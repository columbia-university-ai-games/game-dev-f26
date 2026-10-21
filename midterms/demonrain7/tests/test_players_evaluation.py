"""Verify outcome denominators, planned cases and suite failure accounting."""
import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from evaluate import plan, run_suite, summarize, wilson
from run_episode import run_episode


class EvaluationTests(unittest.TestCase):
    def test_situation_plan_pairs_all_eighteen_trials(self):
        cases = plan([201, 202], ["s1-entrance", "s2-clearing", "s3-door"])
        self.assertEqual(len(cases), 18)
        self.assertEqual(len({c["id"] for c in cases}), 18)
        for situation in ("s1-entrance", "s2-clearing", "s3-door"):
            group = [c for c in cases if c["situation"] == situation]
            for policy in ("baseline", "current", "history"):
                self.assertEqual([c["seed"] for c in group if c["policy"] == policy], [201, 202])

    def test_situation_suite_routes_cases_and_carries_prior_cost(self):
        config = json.loads((ROOT / "config/midterm-v2.json").read_text())
        calls = []
        def runner(exe, data, output, settings, policy, seed, max_usd, situation_id):
            calls.append((situation_id, policy, max_usd))
            return {"termination": "action_limit", "actions": 80, "estimated_usd": 0,
                    "game_status": "truncated"}
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / "suite"
            run_suite(Path("unused"), Path("unused"), output, config, policies=["baseline"], runner=runner)
            manifest = json.loads((output / "manifest.json").read_text())
            records = json.loads((output / "results.json").read_text())
            self.assertEqual(len(calls), 6)
            self.assertEqual(len(records), 18)
            self.assertAlmostEqual(calls[0][2], 3 - 0.0111104)
            self.assertEqual(manifest["prior_estimated_usd"], 0.0111104)
            self.assertEqual(len(json.loads((output / "by-situation.json").read_text())), 3)

    def test_unavailable_is_not_a_played_loss_or_success(self):
        data = [{"policy": "baseline", "game_status": "cleared", "actions": 4, "termination": "cleared"},
                {"policy": "current", "actions": 0, "termination": "provider_error"},
                {"policy": "history", "attempted": False, "termination": "reauthentication_required"}]
        summary = summarize(data)
        self.assertEqual(summary["baseline"]["clear_rate_attempted"], 1)
        self.assertEqual(summary["current"]["attempted"], 1)
        self.assertEqual(summary["current"]["with_actions"], 0)
        self.assertEqual(summary["history"]["attempted"], 0)
        self.assertIsNone(summary["history"]["clear_rate_attempted"])

    def test_plan_pairs_seeds_and_alternates_model_order(self):
        cases = plan([101, 102])
        self.assertEqual([c["policy"] for c in cases], ["baseline", "baseline", "current", "history", "history", "current"])
        self.assertEqual(len({c["id"] for c in cases}), 6)
        self.assertIsNone(wilson(0, 0))
        self.assertAlmostEqual(wilson(0, 5)[1], 0.434482, places=5)

    def test_suite_stops_after_provider_failure_and_preserves_remaining_plan(self):
        config = json.loads((ROOT / "config/midterm.json").read_text())
        config["suite"].update(repetitions=2, seeds=[101, 102])
        calls = []
        def runner(exe, data, output, settings, policy, seed, max_usd):
            calls.append((policy, seed, max_usd))
            return {"policy": policy, "termination": "provider_error", "actions": 0, "estimated_usd": 0.01}
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / "suite"
            run_suite(Path("unused"), Path("unused"), output, config,
                      policies=["current", "history"], prior_estimated_usd=0.02, runner=runner)
            records = json.loads((output / "results.json").read_text())
            self.assertEqual(len(calls), 1)
            self.assertEqual(calls[0][2], 2.98)
            self.assertEqual(len(records), 6)
            self.assertEqual(sum(r["attempted"] for r in records), 1)
            self.assertIn("comparison is incomplete", (output / "REPORT.md").read_text())

    def test_real_initialization_error_stops_remaining_model_cases(self):
        config = json.loads((ROOT / "config/midterm.json").read_text())
        config["suite"].update(repetitions=2, seeds=[101, 102])
        starts = []
        def unavailable(*args):
            starts.append(True)
            raise ValueError("Missing project configuration in offline fixture")
        def runner(exe, data, output, settings, policy, seed, max_usd):
            return run_episode(exe, data, output, settings, policy, seed, max_usd,
                               model_factory=unavailable)
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / "suite"
            run_suite(Path("unused"), Path("unused"), output, config,
                      policies=["current", "history"], runner=runner)
            records = json.loads((output / "results.json").read_text())
            self.assertEqual(len(starts), 1)
            self.assertEqual(sum(r["attempted"] for r in records), 1)
            self.assertEqual(records[2]["termination"], "initialization_error")
            self.assertEqual(records[3]["termination"], "provider_unavailable_after_failure")

    def test_harness_failure_preserves_plan_with_correct_reason(self):
        config = json.loads((ROOT / "config/midterm.json").read_text())
        config["suite"].update(repetitions=1, seeds=[101])
        calls = []
        def runner(*args, **kwargs):
            calls.append(True)
            return {"termination": "harness_error", "actions": 0, "estimated_usd": 0}
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / "suite"
            run_suite(Path("unused"), Path("unused"), output, config, runner=runner)
            records = json.loads((output / "results.json").read_text())
            self.assertEqual(len(calls), 1)
            self.assertEqual([r["termination"] for r in records],
                             ["harness_error", "harness_unavailable_after_failure", "harness_unavailable_after_failure"])


if __name__ == "__main__":
    unittest.main()
