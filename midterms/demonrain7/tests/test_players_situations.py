"""Prepared-start contracts: no preparation history, edits or budget leakage."""
import hashlib
import json
from pathlib import Path
import struct
import sys
import tempfile
import unittest
from unittest.mock import patch
import zlib

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from catacomb_env import Action, Observation
from player_contract import PlayerContext
from situation_env import Situation, SituationEnv, load_situations, pixel_digest
from run_episode import run_episode
from vertex_player import ModelReply


def frame(tick):
    raw = (b"\x00" + bytes((tick % 256, 0, 0)) * 320) * 200
    def chunk(kind, data):
        return (struct.pack(">I", len(data)) + kind + data
                + struct.pack(">I", zlib.crc32(kind + data) & 0xffffffff))
    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", 320, 200, 8, 2, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b""))


class NativeFixture:
    instances = []

    def __init__(self, exe, data, output, **settings):
        assert settings["debug"] is False and settings["headless"] is True
        self.resource_hashes = {"fixture": "hash"}
        self.settings = settings
        self.native_ticks = 1
        self.counter = 1
        self.initial = Observation(frame(1), "running", 1)
        self.last = self.initial
        self.actions = []
        self.closed = False
        self.instances.append(self)

    def act(self, action):
        self.actions.append(action)
        self.native_ticks = min(self.settings["max_ticks"], self.native_ticks + action.ticks)
        status = "truncated" if self.native_ticks == self.settings["max_ticks"] else "running"
        self.last = Observation(frame(self.native_ticks), status, self.native_ticks)
        self.counter += 1
        return self.last

    def observe(self):
        return self.last

    def close(self):
        self.closed = True


def situation():
    return Situation("fixture-start", "held_out", (Action(ticks=4),),
                     5, pixel_digest(frame(5)), {"fixture": "hash"})


class SituationTests(unittest.TestCase):
    def make_env(self, folder, **kwargs):
        return SituationEnv(Path("unused"), Path("unused"), Path(folder) / "game",
                            situation(), env_factory=NativeFixture, **kwargs)

    def test_reset_repeats_preparation_but_resets_player_clock_and_history(self):
        with tempfile.TemporaryDirectory() as folder:
            env = self.make_env(folder, max_ticks=7)
            first = env.reset(101)
            self.assertEqual(first.ticks, 0)
            self.assertEqual(first.png, frame(5))
            self.assertEqual(len(PlayerContext(3).build(first)), 1)
            self.assertEqual(env.native.settings["max_ticks"], 12)
            env.step(0, Action(ticks=2))
            old = env.native
            repeated = env.reset(102)
            self.assertTrue(old.closed)
            self.assertEqual(repeated, first)
            self.assertEqual(env.outcome()["ticks"], 0)
            self.assertEqual(env.outcome()["actions"], 0)
            self.assertEqual(env.native.actions, [Action(ticks=4)])
            env.close()

    def test_illegal_player_and_action_leave_state_unchanged(self):
        with tempfile.TemporaryDirectory() as folder:
            env = self.make_env(folder)
            first = env.reset(101)
            for player, action in [(1, Action()), (False, Action()), (0, Action(ticks=0)),
                                   (0, Action(bolt=True, nuke=True))]:
                with self.subTest(player=player, action=action), self.assertRaises(ValueError):
                    env.step(player, action)
                self.assertEqual(env.observe(0), first)
            self.assertEqual(len(env.native.actions), 1)
            self.assertEqual(env.outcome()["actions"], 0)
            env.close()

    def test_tick_and_action_caps_are_terminal_and_never_success(self):
        with tempfile.TemporaryDirectory() as folder:
            env = self.make_env(folder, max_ticks=3)
            env.reset(101)
            observation = env.step(0, Action(ticks=8))
            self.assertEqual(observation.ticks, 3)
            self.assertEqual(env.outcome(), {"state": "terminal", "reason": "tick_limit",
                                           "score": 0, "ticks": 3, "actions": 1})
            with self.assertRaises(ValueError):
                env.step(0, Action())
            self.assertEqual(env.legal_actions(0), {})
            self.assertEqual(env.observe(0), observation)
            env.close()
        with tempfile.TemporaryDirectory() as folder:
            env = self.make_env(folder, max_actions=1)
            env.reset(101)
            env.step(0, Action(ticks=1))
            self.assertEqual(env.outcome()["reason"], "action_limit")
            self.assertEqual(env.outcome()["score"], 0)
            env.close()

    def test_public_vocabulary_is_static_and_cannot_be_mutated_by_caller(self):
        with tempfile.TemporaryDirectory() as folder:
            env = self.make_env(folder)
            env.reset(101)
            schema = env.legal_actions(0)
            serialized = json.dumps(schema)
            for forbidden in ("route", "map", "held_out", "fixture-start", "resources", "path"):
                self.assertNotIn(forbidden, serialized)
            schema.clear()
            self.assertTrue(env.legal_actions(0))
            self.assertEqual(set(vars(env.observe(0))), {"png", "status", "ticks", "width", "height"})
            env.close()

    def test_wrong_start_or_resources_fails_closed_and_closes_native_process(self):
        for replacement in ("image", "resources"):
            with tempfile.TemporaryDirectory() as folder:
                spec = situation()
                if replacement == "image":
                    spec = Situation(spec.id, spec.split, spec.actions, spec.native_ticks,
                                     "wrong", spec.resource_hashes)
                else:
                    spec = Situation(spec.id, spec.split, spec.actions, spec.native_ticks,
                                     spec.pixels_sha256, {"fixture": "different"})
                env = SituationEnv(Path("unused"), Path("unused"), Path(folder) / "game",
                                   spec, env_factory=NativeFixture)
                with self.assertRaises(RuntimeError):
                    env.reset(101)
                self.assertTrue(NativeFixture.instances[-1].closed)
                with self.assertRaises(RuntimeError):
                    env.observe(0)

    def test_manifest_pins_three_distinct_reachable_starts_and_rejects_changed_route(self):
        cases, manifest = load_situations(ROOT / "config/situations-v2.json")
        self.assertEqual([len(s.actions) for s in cases.values()], [0, 64, 264])
        self.assertEqual(len({s.pixels_sha256 for s in cases.values()}), 3)
        self.assertEqual([s.split for s in cases.values()], ["development", "held_out", "held_out"])
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "cases.json"
            manifest["route"]["sha256"] = "0" * 64
            path.write_text(json.dumps(manifest), encoding="utf-8")
            with self.assertRaises(ValueError):
                load_situations(path)

    def test_route_pin_survives_checkout_newlines_but_rejects_changed_actions(self):
        manifest = (ROOT / "config/situations-v2.json").read_bytes()
        route = (ROOT / "config/acceptance-route.json").read_text(encoding="utf-8")
        with tempfile.TemporaryDirectory() as folder, patch("situation_env.ROOT", Path(folder)):
            config = Path(folder) / "config"
            config.mkdir()
            path = config / "situations.json"
            path.write_bytes(manifest)
            fixture = config / "acceptance-route.json"
            for ending in ("\n", "\r\n"):
                fixture.write_bytes((route.strip() + ending).encode("utf-8"))
                cases, _ = load_situations(path)
                self.assertEqual([len(case.actions) for case in cases.values()], [0, 64, 264])
            changed = json.loads(route)
            changed["actions"][0]["direction"] = "north"
            fixture.write_text(json.dumps(changed), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "changed after declaration"):
                load_situations(path)

    def test_preparation_never_reaches_model_history_and_invalid_response_does_not_step(self):
        config = json.loads((ROOT / "config/midterm-v2.json").read_text())
        declaration = {"limits": {"max_actions": 80, "max_player_ticks": 2000}}
        calls = []
        class InvalidModel:
            def __init__(self, *args):
                pass
            def generate(self, frames, notice):
                calls.append(frames)
                return ModelReply('{}', 'offline-fixture', 10, 5, 0.01, 'STOP')
            def close(self):
                pass
        with tempfile.TemporaryDirectory() as folder, patch(
                "run_episode.load_situations", return_value=({"fixture-start": situation()}, declaration)):
            result = run_episode(Path("unused"), Path("unused"), Path(folder) / "run", config, "history",
                                 model_factory=InvalidModel, env_factory=NativeFixture,
                                 situation_id="fixture-start")
            self.assertEqual(result["termination"], "invalid_action_limit")
            self.assertEqual(result["outcome"]["reason"], "invalid_action_limit")
            self.assertEqual((result["actions"], result["ticks"], result["frames"]), (0, 0, 1))
            self.assertEqual((result["native_ticks"], result["preparation_actions"]), (5, 1))
            self.assertEqual(len(NativeFixture.instances[-1].actions), 1)
            self.assertTrue(NativeFixture.instances[-1].closed)
        self.assertEqual(len(calls), 2)
        for frames in calls:
            self.assertEqual(len(frames), 1)
            self.assertEqual(frames[0].png, frame(5))
            self.assertEqual(frames[0].metadata,
                             {"status": "running", "ticks": 0, "width": 320, "height": 200})

    def test_native_win_or_death_takes_precedence_over_action_limit(self):
        for status, score in (("cleared", 1), ("dead", 0)):
            class Ends(NativeFixture):
                def act(self, action):
                    observed = super().act(action)
                    if len(self.actions) > 1:
                        self.last = Observation(observed.png, status, observed.ticks)
                    return self.last
            with tempfile.TemporaryDirectory() as folder:
                env = SituationEnv(Path("unused"), Path("unused"), Path(folder), situation(),
                                   max_actions=1, env_factory=Ends)
                env.reset(101)
                env.step(0, Action(ticks=1))
                self.assertEqual((env.outcome()["reason"], env.outcome()["score"]), (status, score))
                with self.assertRaises(ValueError):
                    env.step(0, Action())
                env.close()


if __name__ == "__main__":
    unittest.main()
