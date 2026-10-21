"""Offline contract, memory, accounting and failure-path regressions."""
from dataclasses import asdict
from io import BytesIO
import json
from pathlib import Path
import sys
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from catacomb_env import Action, Observation
from player_contract import BudgetExceeded, CallBudget, PlayerContext, parse_decision
from run_episode import run_episode
from vertex_player import ModelReply
from vertex_player import VertexPlayer
from visual_baseline import VisualBaseline, perceive
from PIL import Image, ImageDraw


def configuration():
    return json.loads((ROOT / "config/midterm.json").read_text(encoding="utf-8"))


def screenshot(block_north=False):
    image = Image.new("RGB", (320, 200), (0, 170, 0))
    draw = ImageDraw.Draw(image)
    draw.rectangle((192, 0, 319, 199), fill="white")
    draw.rectangle((202, 131, 303, 131), fill=(255, 85, 255))
    draw.rectangle((202, 107, 303, 107), fill="black")
    if block_north:
        draw.rectangle((0, 0, 191, 87), fill=(255, 85, 255))
    stream = BytesIO()
    image.save(stream, format="PNG")
    return stream.getvalue()


class FakeEnv:
    instances = []

    def __init__(self, exe, data, run, **kwargs):
        if kwargs.get("debug") is not False:
            raise AssertionError("Player environment must explicitly disable debug")
        self.initial = Observation(screenshot(), "running", 1)
        self.actions = []
        self.counter = 1
        self.closed = False
        self.instances.append(self)

    def act(self, action):
        self.actions.append(action)
        self.counter += 1
        return Observation(screenshot(), "cleared", 1 + action.ticks)

    def close(self):
        self.closed = True


class FakeModel:
    def __init__(self, config, prompt, seed):
        self.closed = False

    def generate(self, frames, notice=None):
        assert len(frames) == 1
        assert set(frames[0].metadata) == {"status", "ticks", "width", "height"}
        return ModelReply(json.dumps({"action": asdict(Action(direction="south")), "intent": "Explore"}),
                          "test-fixture", 100, 30, 0.01, "STOP")

    def close(self):
        self.closed = True


class PlayerTests(unittest.TestCase):
    def test_invalid_actions_cannot_reach_native_protocol(self):
        valid = {"action": asdict(Action()), "intent": "Wait"}
        self.assertEqual(parse_decision(json.dumps(valid))[0], Action())
        for key, value in (("ticks", True), ("ticks", 0), ("ticks", 33), ("fire", 1),
                           ("direction", "debug state"), ("ticks", 2.5)):
            broken = {"action": {**valid["action"], key: value}, "intent": "Wait"}
            with self.assertRaises(ValueError):
                parse_decision(json.dumps(broken))
        for raw in ('{"action":{},"action":{},"intent":"x"}',
                    json.dumps({**valid, "map": []}),
                    json.dumps({"action": {**valid["action"], "potion": True, "nuke": True}, "intent": "x"}),
                    "```json\n{}\n```", "[]"):
            with self.assertRaises(ValueError):
                parse_decision(raw)

    def test_context_is_allowlisted_and_evicted(self):
        current, history = PlayerContext(0), PlayerContext(3)
        for tick in range(1, 7):
            observation = Observation(bytes([tick]), "running", tick)
            current.remember(observation, Action(), "Wait")
            history.remember(observation, Action(), "Wait")
        latest = Observation(b"current", "running", 7)
        self.assertEqual([f.metadata["ticks"] for f in current.build(latest)], [7])
        frames = history.build(latest)
        self.assertEqual([f.metadata["ticks"] for f in frames], [4, 5, 6, 7])
        self.assertEqual(set(frames[-1].metadata), {"status", "ticks", "width", "height"})
        self.assertNotIn("action_taken", frames[-1].metadata)
        self.assertEqual(len(PlayerContext(3).build(latest)), 1)  # No cross-episode memory.

    def test_budget_reserves_before_call_and_accounts_unknown_usage(self):
        config = configuration()
        config["limits"]["max_calls"] = 1
        budget = CallBudget(config)
        budget.reserve()
        amount = budget.estimated_usd
        accounting = budget.settle()
        self.assertFalse(accounting["usage_known"])
        self.assertEqual(budget.estimated_usd, amount)
        with self.assertRaisesRegex(BudgetExceeded, "call_limit"):
            budget.reserve()
        budget = CallBudget(config, max_usd=0)
        with self.assertRaisesRegex(BudgetExceeded, "spending_limit"):
            budget.reserve()
        self.assertEqual(budget.calls, 0)
        config["limits"]["max_total_tokens"] = 1
        with self.assertRaisesRegex(BudgetExceeded, "token_limit"):
            CallBudget(config).reserve()

    def test_actual_usage_releases_reservation_and_includes_all_output(self):
        budget = CallBudget(configuration())
        budget.reserve()
        budget.settle(1000, 200)
        self.assertAlmostEqual(budget.estimated_usd, 0.0008)
        self.assertEqual(budget.tokens, 1200)

    def test_baseline_reacts_to_pixels_and_emits_valid_controls(self):
        png = screenshot(block_north=True)
        view = perceive(png)
        self.assertFalse(view.walkable[10][11])
        self.assertEqual(view.health, 1)
        for seed in range(5):
            action, _ = VisualBaseline(seed).decide(Observation(png, "running", 1))
            self.assertNotEqual(action.direction, "north")
            action.command()

    def run_fixture(self, model=FakeModel, config=None):
        with tempfile.TemporaryDirectory() as folder:
            result = run_episode(Path("not-exposed-exe"), Path("not-exposed-data"),
                                 Path(folder) / "run", config or configuration(), "current",
                                 model_factory=model, env_factory=FakeEnv)
            on_disk = json.loads((Path(folder) / "run/result.json").read_text())
            self.assertEqual(result, on_disk)
            return result, FakeEnv.instances[-1]

    def test_success_closes_environment_and_records_real_action(self):
        result, env = self.run_fixture()
        self.assertEqual((result["termination"], result["actions"], result["model_calls"]), ("cleared", 1, 1))
        self.assertEqual(env.actions[0].direction, "south")
        self.assertTrue(env.closed)

    def test_invalid_model_output_never_advances_game(self):
        class Invalid(FakeModel):
            def generate(self, frames, notice=None):
                return ModelReply('{"action":{"debug":"godmode"},"intent":"x"}', "test", 30, 20, 0.01, "STOP")
        result, env = self.run_fixture(Invalid)
        self.assertEqual(result["termination"], "invalid_action_limit")
        self.assertEqual((result["invalid_actions"], result["model_calls"]), (2, 2))
        self.assertEqual(env.actions, [])
        self.assertEqual(result["ticks"], 1)

    def test_timeout_has_no_hidden_retry_or_game_step(self):
        class Timeout(FakeModel):
            def generate(self, frames, notice=None):
                raise TimeoutError("forced offline fixture")
        result, env = self.run_fixture(Timeout)
        self.assertEqual((result["termination"], result["model_calls"]), ("provider_error", 1))
        self.assertEqual(env.actions, [])
        self.assertGreater(result["estimated_usd"], 0)
        self.assertEqual(result["frames"], 1)
        self.assertEqual(len(result["latencies_seconds"]), 1)

    def test_budget_stop_preserves_last_confirmed_frame(self):
        class Continuing(FakeEnv):
            def act(self, action):
                self.counter += 1
                return Observation(screenshot(), "running", 9)
        config = configuration()
        config["limits"]["max_calls"] = 1
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / "run"
            result = run_episode(Path("unused"), Path("unused"), output, config, "current",
                                 model_factory=FakeModel, env_factory=Continuing)
            self.assertEqual((result["termination"], result["actions"], result["ticks"], result["frames"]),
                             ("call_limit", 1, 9, 2))
            self.assertEqual(len(result["final_frame_sha256"]), 64)
            events = [json.loads(line) for line in (output / "decisions.jsonl").read_text().splitlines()]
            self.assertEqual(events[-1]["termination"], "call_limit")

    def test_usage_overrun_retains_response_and_does_not_act(self):
        class Overrun(FakeModel):
            def generate(self, frames, notice=None):
                reply = super().generate(frames, notice)
                reply.input_tokens = 40000
                return reply
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / "run"
            result = run_episode(Path("unused"), Path("unused"), output, configuration(), "current",
                                 model_factory=Overrun, env_factory=FakeEnv)
            event = json.loads((output / "decisions.jsonl").read_text())
            self.assertEqual(result["termination"], "provider_usage_exceeded_reservation")
            self.assertEqual((result["actions"], result["frames"], result["accounted_tokens"]), (0, 1, 40030))
            self.assertEqual(result["model_versions"], ["test-fixture"])
            self.assertEqual(result["latencies_seconds"], [0.01])
            self.assertEqual(event["input_tokens"], 40000)
            self.assertIn("action", json.loads(event["raw_response"]))
            self.assertTrue(event["accounting"]["usage_known"])

    def test_player_initialization_failure_is_distinct(self):
        def unavailable(*args):
            raise ValueError("Missing local project configuration")
        def never_start(*args, **kwargs):
            self.fail("Environment should not start after player setup failed")
        with tempfile.TemporaryDirectory() as folder:
            result = run_episode(Path("unused"), Path("unused"), Path(folder) / "run", configuration(), "current",
                                 model_factory=unavailable, env_factory=never_start)
        self.assertEqual(result["termination"], "initialization_error")
        self.assertEqual(result["failure_stage"], "player_initialization")
        self.assertEqual((result["model_calls"], result["actions"]), (0, 0))

    def test_cleanup_failures_preserve_result_cost_and_both_cleanup_attempts(self):
        class BrokenEnv(FakeEnv):
            def close(self):
                super().close()
                raise OSError("offline close fixture")
        class BrokenModel(FakeModel):
            def close(self):
                super().close()
                raise OSError("offline close fixture")
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / "run"
            result = run_episode(Path("unused"), Path("unused"), output, configuration(), "current",
                                 model_factory=BrokenModel, env_factory=BrokenEnv)
            self.assertEqual(result, json.loads((output / "result.json").read_text()))
            self.assertEqual(result["termination"], "cleared")
            self.assertGreater(result["estimated_usd"], 0)
            self.assertEqual([error["component"] for error in result["cleanup_errors"]], ["environment", "model"])

    def test_missing_engine_is_not_a_provider_failure(self):
        def missing_engine(*args, **kwargs):
            raise FileNotFoundError("offline engine fixture")
        with tempfile.TemporaryDirectory() as folder:
            result = run_episode(Path("unused"), Path("unused"), Path(folder) / "run", configuration(), "current",
                                 model_factory=FakeModel, env_factory=missing_engine)
        self.assertEqual(result["termination"], "harness_error")
        self.assertEqual(result["failure_stage"], "environment_initialization")
        self.assertEqual(result["model_calls"], 0)

    def test_failed_engine_step_is_logged_as_unconfirmed(self):
        class BrokenStep(FakeEnv):
            def act(self, action):
                raise TimeoutError("offline native response timeout")
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / "run"
            result = run_episode(Path("unused"), Path("unused"), output, configuration(), "current",
                                 model_factory=FakeModel, env_factory=BrokenStep)
            event = json.loads((output / "decisions.jsonl").read_text())
            self.assertEqual(result["termination"], "harness_error")
            self.assertEqual((result["actions"], result["ticks"], result["frames"]), (0, 1, 1))
            self.assertEqual(event["action_outcome"], "unconfirmed")
            self.assertIn("action", event)

    def test_vertex_transport_has_no_tools_and_counts_thinking_output(self):
        with patch.dict("os.environ", {"GOOGLE_CLOUD_PROJECT": "offline-test-project"}), \
                patch("google.genai.Client") as factory:
            client = factory.return_value
            client.models.generate_content.return_value = SimpleNamespace(
                text="{}", model_version="offline-test-model",
                usage_metadata=SimpleNamespace(prompt_token_count=100, candidates_token_count=20, thoughts_token_count=30),
                candidates=[SimpleNamespace(finish_reason=SimpleNamespace(value="STOP"))])
            player = VertexPlayer(configuration(), "Public game rules", 101)
            frame = PlayerContext().build(Observation(screenshot(), "running", 1))
            reply = player.generate(frame)
            kwargs = client.models.generate_content.call_args.kwargs
            self.assertIsNone(kwargs["config"].tools)
            self.assertTrue(kwargs["config"].automatic_function_calling.disable)
            self.assertEqual(kwargs["contents"][0].parts[1].inline_data.data, frame[0].png)
            self.assertEqual(reply.output_tokens, 50)
            self.assertEqual(factory.call_args.kwargs["http_options"].retry_options.attempts, 1)
            player.close()
            client.close.assert_called_once()


if __name__ == "__main__":
    unittest.main()
