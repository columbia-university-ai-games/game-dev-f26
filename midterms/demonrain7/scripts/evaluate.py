"""Repeated real episodes, frozen evidence and explicit unavailable conditions.
SPDX-License-Identifier: GPL-2.0-or-later
"""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
import statistics
import subprocess

from run_episode import ROOT, run_episode
from situation_env import load_situations

POLICIES = ("baseline", "current", "history")


def fingerprint(root=ROOT):
    files = [*root.glob("*.c"), *root.glob("*.h"), *root.glob("scripts/*.py"),
             *root.glob("prompts/*"), *root.glob("config/*.json"), root / "pyproject.toml", root / "uv.lock"]
    return {str(p.relative_to(root)).replace("\\", "/"): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(files) if p.is_file()}


def plan(seeds, situations=None):
    if situations is not None:
        return [{**case, "id": f"{situation}-{case['id']}", "situation": situation}
                for situation in situations for case in plan(seeds)]
    cases = [("baseline", seed) for seed in seeds]
    for index, seed in enumerate(seeds):
        cases.extend((policy, seed) for policy in (("current", "history") if index % 2 == 0 else ("history", "current")))
    return [{"id": f"{policy}-{seed}", "policy": policy, "seed": seed} for policy, seed in cases]


def wilson(successes, n):
    if not n:
        return None
    z = 1.959963984540054
    p = successes / n
    center = (p + z * z / (2 * n)) / (1 + z * z / n)
    half = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n)
    return [max(0, center - half), min(1, center + half)]


def summarize(records):
    summary = {}
    for policy in POLICIES:
        group = [r for r in records if r["policy"] == policy]
        attempted = [r for r in group if r.get("attempted", True)]
        playable = [r for r in attempted if r.get("actions", 0) > 0]
        clears = sum(r.get("game_status") == "cleared" for r in attempted)
        latencies = [value for r in attempted for value in r.get("latencies_seconds", [])]
        summary[policy] = {
            "planned": len(group), "attempted": len(attempted), "with_actions": len(playable),
            "cleared": clears, "clear_rate_attempted": clears / len(attempted) if attempted else None,
            "wilson_95_descriptive": wilson(clears, len(attempted)),
            "terminations": dict(Counter(r["termination"] for r in group)),
            "median_actions": statistics.median([r.get("actions", 0) for r in attempted]) if attempted else None,
            "median_request_seconds": statistics.median(latencies) if latencies else None,
            "estimated_usd": round(sum(r.get("estimated_usd", 0) for r in attempted), 8),
            "accounted_tokens": sum(r.get("accounted_tokens", 0) for r in attempted),
            "invalid_actions": sum(r.get("invalid_actions", 0) for r in attempted),
            "model_versions": sorted({version for r in attempted for version in r.get("model_versions", [])})}
    return summary


def write_report(output, manifest, records):
    summary = summarize(records)
    (output / "results.json").write_text(json.dumps(records, indent=2), encoding="utf-8")
    (output / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    lines = ["AI-use disclosure: Codex implemented this report generator; figures below are calculated from recorded episode outcomes.",
             "", "# Catacomb II evaluation", "", f"Configuration: `{manifest['config_sha256']}`.",
             f"Source revision: `{manifest['git_revision']}`. Native and resource hashes are stored in each attempted episode.",
             f"Earlier reserved use: ${manifest['prior_estimated_usd']:.6f}; suite ceiling including that use: ${manifest['max_estimated_usd']:.2f}.",
             "", "| Policy | Planned | Attempted | With actions | Cleared | Median actions | Estimated USD |",
             "| --- | ---: | ---: | ---: | ---: | ---: | ---: |"]
    for policy, row in summary.items():
        median = row['median_actions'] if row['median_actions'] is not None else "unavailable"
        lines.append(f"| {policy} | {row['planned']} | {row['attempted']} | {row['with_actions']} | {row['cleared']} | {median} | {row['estimated_usd']:.6f} |")
    lines += ["", "## Interpretation and limits", "",
              ("The three declared level-one starts, actions and player budgets apply equally to every policy. "
               "Preparation uses ordinary controls and is excluded from player history and action/tick budgets. "
               if "situations" in manifest["config"] else
               "The same original first-level start, actions, stepping rules and episode limits apply to every policy. ") +
              "Model policies differ only in whether the last three permitted observation/action/intent records are included. "
              "Repeated model calls are independent requests; provider seeds do not guarantee determinism. Baseline seeds vary tie breaking. "
              "There is no training or cross-episode memory.", "",
              "Failure and unavailable records are retained. A condition with no actions does not establish playing performance. "
              "Clear-rate denominators include attempted failures; unattempted conditions are excluded. The JSON report includes descriptive "
              "Wilson intervals, but this small fixed-map study does not establish generalization or statistically independent map samples.", "",
              "Unique screenshot hashes measure changing images, not explored area. Usage is estimated at recorded uncached rates; "
              "unknown usage retains its full reservation. Cloud billing/credit balances are separate. "
              "The privileged winning acceptance route is not an evaluated baseline.", "",
              "## Terminations", ""]
    for policy, row in summary.items():
        lines.append(f"- {policy}: `{json.dumps(row['terminations'], sort_keys=True)}`")
    if "situations" in manifest["config"]:
        by_case = {case: summarize([r for r in records if r.get("situation") == case])
                   for case in dict.fromkeys(r["situation"] for r in records)}
        (output / "by-situation.json").write_text(json.dumps(by_case, indent=2), encoding="utf-8")
        lines += ["", "## Per-situation results", "",
                  "| Situation | Policy | Attempted | Cleared |", "| --- | --- | ---: | ---: |"]
        for case, groups in by_case.items():
            for policy, group in groups.items():
                lines.append(f"| {case} | {policy} | {group['attempted']} | {group['cleared']} |")
    if any(not summary[p]["with_actions"] for p in ("current", "history")):
        lines += ["", "**Live model/history comparison is incomplete. No conclusion about Gemini playing quality or the effect of memory is supported yet.**"]
    (output / "REPORT.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return summary


def run_suite(exe, data, output, config, policies=POLICIES, unavailable_reason="not_selected",
              prior_estimated_usd=None, runner=run_episode):
    if not set(policies) <= set(POLICIES) or not policies:
        raise ValueError("Select at least one known policy")
    cap = config["suite"]["max_estimated_usd"]
    if prior_estimated_usd is None:
        prior_estimated_usd = config["suite"].get("prior_estimated_usd", 0.0)
    if not 0 <= prior_estimated_usd <= cap:
        raise ValueError("Prior spending must be within the suite budget")
    if config["suite"]["repetitions"] != len(config["suite"]["seeds"]):
        raise ValueError("Repetitions and seed count must agree")
    output = Path(output)
    output.mkdir(parents=True, exist_ok=False)
    revision = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip()
    frozen = fingerprint()
    situations = load_situations(ROOT / config["situations"])[0] if "situations" in config else None
    manifest = {"schema": 1, "created_at": datetime.now(timezone.utc).isoformat(),
                "git_revision": revision, "source_sha256": frozen,
                "config_sha256": hashlib.sha256(json.dumps(config, sort_keys=True).encode()).hexdigest(),
                "config": config, "plan": plan(config["suite"]["seeds"], situations),
                "selected_policies": list(policies), "prior_estimated_usd": prior_estimated_usd,
                "max_estimated_usd": cap}
    (output / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    records = []
    spent = prior_estimated_usd
    provider_unavailable = False
    harness_unavailable = False
    stopped = False
    for case in manifest["plan"]:
        reason = None
        if case["policy"] not in policies:
            reason = unavailable_reason
        elif stopped:
            reason = "operator_stopped_suite"
        elif harness_unavailable:
            reason = "harness_unavailable_after_failure"
        elif provider_unavailable and case["policy"] != "baseline":
            reason = "provider_unavailable_after_failure"
        elif case["policy"] != "baseline" and spent >= cap:
            reason = "suite_spending_limit"
        if reason:
            record = {**case, "attempted": False, "termination": reason}
        else:
            if fingerprint() != frozen:
                raise RuntimeError("Executable player sources changed during the frozen suite")
            result = runner(exe, data, output / case["id"], config, case["policy"], case["seed"],
                            max_usd=max(0, cap - spent),
                            **({"situation_id": case["situation"]} if situations is not None else {}))
            record = {**case, **result, "attempted": True}
            spent += result["estimated_usd"]
            provider_unavailable |= result["termination"] in ("provider_error", "initialization_error")
            harness_unavailable |= result["termination"] == "harness_error"
            stopped |= result["termination"] == "operator_stop"
        records.append(record)
        write_report(output, manifest, records)
        print(json.dumps({"episode": case["id"], "termination": record["termination"],
                          "actions": record.get("actions", 0), "estimated_suite_usd": round(spent, 8)}), flush=True)
    return write_report(output, manifest, records)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--exe", type=Path, required=True)
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--config", type=Path, default=ROOT / "config/midterm.json")
    parser.add_argument("--policies", nargs="+", choices=POLICIES, default=list(POLICIES))
    parser.add_argument("--unavailable-reason", default="not_selected")
    parser.add_argument("--prior-estimated-usd", type=float,
                        help="Cumulative prior estimate; defaults to the configuration's carry-forward")
    args = parser.parse_args()
    run_suite(args.exe, args.data, args.output, json.loads(args.config.read_text(encoding="utf-8")),
              args.policies, args.unavailable_reason, args.prior_estimated_usd)
