"""Opt-in integration checks using locally supplied original resources.

No model, visible window, desktop input, resource downloads or hidden-state API.
"""
import argparse
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("catacomb_env", ROOT / "scripts/catacomb_env.py")
client = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = client
spec.loader.exec_module(client)
sys.path.insert(0, str(ROOT / "scripts"))
from situation_env import SituationEnv, load_situations, pixel_digest


class LiveGameTests(unittest.TestCase):
    def test_declared_starts_repeat_with_full_player_budget_and_no_history(self):
        cases, _ = load_situations(ROOT / "config/situations-v2.json")
        for name, situation in cases.items():
            with self.subTest(situation=name), SituationEnv(
                    EXE, DATA, self.root / name, situation, max_ticks=4) as env:
                first = env.reset(201)
                self.assertEqual(first.ticks, 0)
                self.assertEqual(pixel_digest(first.png), situation.pixels_sha256)
                with self.assertRaises(ValueError):
                    env.step(0, client.Action(ticks=0))
                self.assertEqual(env.observe(0), first)
                repeated = env.reset(202)
                self.assertEqual(repeated, first)
                ended = env.step(0, client.Action(ticks=32))
                self.assertEqual((ended.status, ended.ticks), ("truncated", 4))
                self.assertEqual(env.outcome()["reason"], "tick_limit")
                self.assertEqual(env.outcome()["score"], 0)
                with self.assertRaises(ValueError):
                    env.step(0, client.Action())

    def test_door_start_can_reach_original_exit_through_same_controls(self):
        cases, _ = load_situations(ROOT / "config/situations-v2.json")
        case = cases["s3-door"]
        route = json.loads((ROOT / "config/acceptance-route.json").read_text())["actions"]
        with SituationEnv(EXE, DATA, self.root / "prepared-exit", case) as env:
            env.reset(201)
            for raw in route[len(case.actions):]:
                env.step(0, client.Action(**raw))
            self.assertEqual(env.outcome(), {"state": "terminal", "reason": "cleared", "score": 1,
                                           "ticks": 612 - 529, "actions": len(route) - len(case.actions)})
            with self.assertRaises(ValueError):
                env.step(0, client.Action())

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def start(self, name="episode", max_ticks=200):
        env = client.CatacombEnv(EXE, DATA, self.root / name, max_ticks=max_ticks,
                                 timeout=10, headless=True)
        self.addCleanup(env.close)
        return env

    def assert_clean_exit(self, env):
        env.close()
        self.assertEqual(env.process.returncode, 0)
        self.assertEqual((env.run_dir / "game-stderr.log").read_bytes(), b"")

    def test_observe_and_rejected_commands_do_not_change_world(self):
        env = self.start()
        self.assertEqual(env.initial.status, "running")
        self.assertEqual(env.initial.ticks, 1)
        self.assertGreater(len(env.initial.png), 1000)
        for command in ("step 9 0 0 0 0 0 8", "step 2 0 0 0 0 0 0", "godmode",
                        "step " + "8 " * 200, "observe\x00hidden"):
            with self.assertRaisesRegex(ValueError, "invalid_command"):
                env._request(command)  # Malformed wire input, bypass Python validation.
            self.assertEqual(env.observe(), env.initial)
        self.assert_clean_exit(env)

    def test_charge_release_and_movement_produce_new_frames(self):
        env = self.start()
        charged = env.act(client.Action(fire=True, ticks=32))
        self.assertNotEqual(charged.png, env.initial.png)
        released = env.act(client.Action(ticks=1))
        self.assertNotEqual(released.png, charged.png)
        moved = env.act(client.Action(direction="south", ticks=32))
        self.assertNotEqual(moved.png, released.png)
        self.assertEqual(moved.ticks, 66)
        self.assert_clean_exit(env)

    def test_tick_budget_and_terminal_action_rejection(self):
        env = self.start(max_ticks=9)
        ended = env.act(client.Action(ticks=32))
        self.assertEqual((ended.status, ended.ticks), ("truncated", 9))
        with self.assertRaisesRegex(ValueError, "episode_finished"):
            env.act(client.Action())
        self.assertEqual(env.observe(), ended)
        self.assert_clean_exit(env)

    def test_recorded_acceptance_route_reaches_original_exit(self):
        # This is a privileged acceptance fixture, not an exploration baseline.
        route = json.loads((ROOT / "config/acceptance-route.json").read_text(encoding="utf-8"))
        env = self.start(max_ticks=6000)
        observation = env.initial
        for raw in route["actions"]:
            self.assertEqual(observation.status, "running")
            observation = env.act(client.Action(**raw))
        self.assertEqual(observation.status, "cleared")
        self.assertEqual(observation.ticks, route["ticks"])
        with self.assertRaisesRegex(ValueError, "episode_finished"):
            env.act(client.Action())
        self.assert_clean_exit(env)

    def test_same_actions_repeat_identical_frames(self):
        actions = (client.Action(direction="south", ticks=32),
                   client.Action(direction="south", ticks=32),
                   client.Action(direction="east", ticks=16),
                   client.Action(fire=True, ticks=32), client.Action(ticks=8))
        episodes = []
        for name in ("first", "second"):
            env = self.start(name)
            frames = [env.initial]
            frames.extend(env.act(action) for action in actions)
            episodes.append(frames)
            self.assert_clean_exit(env)
        self.assertEqual(episodes[0], episodes[1])

    def test_missing_resources_fail_before_startup(self):
        result = subprocess.run([str(EXE), "--agent", "--headless"], cwd=self.root,
                                capture_output=True, text=True, timeout=10,
                                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0)
        self.assertEqual(result.returncode, 2)
        self.assertIn("LEVEL1.CA2", result.stderr)
        self.assertIn("SOUNDS.CA2", result.stderr)
        self.assertEqual(result.stdout, "")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--exe", type=Path, required=True)
    parser.add_argument("--data", type=Path, required=True)
    args = parser.parse_args()
    EXE, DATA = args.exe.resolve(strict=True), args.data.resolve(strict=True)
    unittest.main(argv=[sys.argv[0]], verbosity=2)
