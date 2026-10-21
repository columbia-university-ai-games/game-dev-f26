"""Trusted episode runner; exports only allowlisted observations to players.
SPDX-License-Identifier: GPL-2.0-or-later
"""
from dataclasses import asdict
from datetime import datetime, timezone
import argparse
import hashlib
import json
import os
from pathlib import Path
import time
import traceback

from catacomb_env import CatacombEnv
from player_contract import BudgetExceeded, CallBudget, PlayerContext, parse_decision
from situation_env import SituationEnv, load_situations

ROOT = Path(__file__).resolve().parents[1]


def sha(data):
    return hashlib.sha256(data).hexdigest()


def run_episode(exe, data, output, config, policy, seed=101, max_usd=None,
                model_factory=None, env_factory=CatacombEnv, baseline_factory=None,
                situation_id=None):
    if policy not in ("baseline", "current", "history"):
        raise ValueError("Unknown policy")
    situation = None
    if "situations" in config:
        cases, declaration = load_situations(ROOT / config["situations"])
        if situation_id not in cases:
            raise ValueError("Select a declared situation for this configuration")
        if (config["limits"]["max_actions"] != declaration["limits"]["max_actions"]
                or config["limits"]["max_ticks"] != declaration["limits"]["max_player_ticks"]):
            raise ValueError("Player limits must match the declared situation limits")
        situation = cases[situation_id]
    elif situation_id is not None:
        raise ValueError("This configuration has no declared situations")
    prompt = (ROOT / config["prompt"]).read_text(encoding="utf-8")
    output = Path(output)
    output.mkdir(parents=True, exist_ok=False)
    started = time.monotonic()
    result = {"schema": 1, "policy": policy, "seed": seed, "live_model": policy != "baseline",
              "started_at": datetime.now(timezone.utc).isoformat(),
              "config_sha256": sha(json.dumps(config, sort_keys=True).encode()),
              "prompt_sha256": sha(prompt.encode()), "game_status": "not_started",
              "termination": "initialization_error", "actions": 0, "invalid_actions": 0,
              "ticks": 0, "model_versions": [], "latencies_seconds": [], "frames": 0}
    if situation:
        result.update(schema=2, situation=situation.id, split=situation.split,
                      situation_manifest_sha256=sha(json.dumps(declaration, sort_keys=True).encode()),
                      preparation_actions=len(situation.actions),
                      preparation_ticks=situation.native_ticks - 1,
                      native_start_ticks=situation.native_ticks)
    (output / "evaluation-config.json").write_text(json.dumps(config, indent=2), encoding="utf-8")
    budget = CallBudget(config, max_usd)
    model = env = observation = None
    phase = "player_initialization"
    contexts = PlayerContext(config["history_frames"] if policy == "history" else 0)
    invalid_notice = None
    consecutive_invalid = 0
    unique_frames = set()
    try:
        if policy == "baseline":
            if baseline_factory is None:
                from visual_baseline import VisualBaseline
                baseline_factory = VisualBaseline
            baseline = baseline_factory(seed)
        else:
            if model_factory is None:
                from vertex_player import VertexPlayer
                model_factory = VertexPlayer
            model = model_factory(config, prompt, seed)
        phase = "environment_initialization"
        if situation:
            env = SituationEnv(exe, data, output / "game", situation,
                               max_ticks=config["limits"]["max_ticks"],
                               max_actions=config["limits"]["max_actions"], env_factory=env_factory)
            observation = env.reset(seed)
        else:
            env = env_factory(exe, data, output / "game", level=1,
                              max_ticks=config["limits"]["max_ticks"], timeout=15, debug=False)
            observation = env.initial
        # Preparation is evaluator work, not player deliberation time/history.
        player_started = time.monotonic() if situation else started
        phase = "running"
        result.update(game_status=observation.status, ticks=observation.ticks)
        while observation.status == "running":
            if result["actions"] >= config["limits"]["max_actions"]:
                result["termination"] = "action_limit"
                break
            if time.monotonic() - player_started >= config["limits"]["max_seconds"]:
                result["termination"] = "wall_time_limit"
                break
            unique_frames.add(sha(observation.png))
            event = {"decision": result["actions"], "ticks_before": observation.ticks,
                     "frame_sha256": sha(observation.png), "policy": policy}
            if model:
                try:
                    budget.reserve()
                except BudgetExceeded as error:
                    event["termination"] = str(error)
                    append_event(output, event)
                    raise
                frames = contexts.build(observation)
                event["context"] = [{**f.metadata, "png_sha256": sha(f.png)} for f in frames]
                request_started = time.monotonic()
                try:
                    reply = model.generate(frames, invalid_notice)
                except KeyboardInterrupt:
                    elapsed = time.monotonic() - request_started
                    event.update(termination="operator_stop", latency_seconds=elapsed,
                                 accounting=budget.settle())
                    result["latencies_seconds"].append(elapsed)
                    append_event(output, event)
                    raise
                except Exception as error:
                    (output / "provider-error.log").write_text(traceback.format_exc(), encoding="utf-8")
                    elapsed = time.monotonic() - request_started
                    event.update(error=type(error).__name__, termination="provider_error",
                                 latency_seconds=elapsed, accounting=budget.settle())
                    result["latencies_seconds"].append(elapsed)
                    append_event(output, event)
                    result["termination"] = "provider_error"
                    result["error_type"] = type(error).__name__
                    break
                event.update(model_version=reply.model_version, finish_reason=reply.finish_reason,
                             raw_response=reply.text, input_tokens=reply.input_tokens,
                             output_tokens=reply.output_tokens, latency_seconds=reply.elapsed_seconds)
                result["latencies_seconds"].append(reply.elapsed_seconds)
                if reply.model_version not in result["model_versions"]:
                    result["model_versions"].append(reply.model_version)
                try:
                    event["accounting"] = budget.settle(reply.input_tokens, reply.output_tokens)
                except BudgetExceeded as error:
                    event.update(termination=str(error), accounting={"usage_known": True,
                                 "estimated_usd": budget.estimated_usd,
                                 "accounted_tokens": budget.tokens, "calls": budget.calls})
                    append_event(output, event)
                    raise
                try:
                    if reply.finish_reason != "STOP":
                        raise ValueError("Model response did not finish normally")
                    action, intent = parse_decision(reply.text)
                except (ValueError, TypeError) as error:
                    result["invalid_actions"] += 1
                    consecutive_invalid += 1
                    invalid_notice = str(error)
                    event["rejected"] = invalid_notice
                    append_event(output, event)
                    if consecutive_invalid >= config["limits"]["max_consecutive_invalid"]:
                        result["termination"] = "invalid_action_limit"
                        break
                    continue
            else:
                action, intent = baseline.decide(observation)
            action.command()
            if time.monotonic() - player_started >= config["limits"]["max_seconds"]:
                event["termination"] = "wall_time_limit"
                append_event(output, event)
                result["termination"] = "wall_time_limit"
                break
            event.update(action=asdict(action), intent=intent)
            before = observation
            try:
                observation = env.step(0, action) if situation else env.act(action)
            except Exception as error:
                event.update(termination="harness_error", error=type(error).__name__,
                             action_outcome="unconfirmed")
                append_event(output, event)
                raise
            contexts.remember(before, action, intent)
            event.update(ticks_after=observation.ticks, status_after=observation.status)
            append_event(output, event)
            result["actions"] += 1
            result.update(game_status=observation.status, ticks=observation.ticks)
            consecutive_invalid = 0
            invalid_notice = None
        else:
            result["termination"] = env.outcome()["reason"] if situation else observation.status
    except BudgetExceeded as error:
        result["termination"] = str(error)
    except KeyboardInterrupt:
        result["termination"] = "operator_stop"
    except Exception as error:
        result.update(termination="initialization_error" if phase == "player_initialization" and policy != "baseline" else "harness_error",
                      failure_stage=phase, error_type=type(error).__name__)
        (output / "harness-error.log").write_text(traceback.format_exc(), encoding="utf-8")
        # Keep provider exception bodies/credential paths out of public logs.
    finally:
        # Preserve the last confirmed observation on every exit, including a
        # budget exception. A failed native step is not assumed to have executed.
        if observation is not None:
            unique_frames.add(sha(observation.png))
            result.update(game_status=observation.status, ticks=observation.ticks,
                          final_frame_sha256=sha(observation.png), frames=env.counter)
            if situation:
                if env.outcome()["state"] == "ongoing":
                    env.finish(result["termination"])
                result.update(outcome=env.outcome(),
                              native_ticks=situation.native_ticks + observation.ticks,
                              frames=env.counter - len(situation.actions),
                              player_elapsed_seconds=time.monotonic() - player_started)
        for label, resource in (("environment", env), ("model", model)):
            if resource is not None:
                try:
                    resource.close()
                except Exception as error:
                    result.setdefault("cleanup_errors", []).append({"component": label, "error_type": type(error).__name__})
        result.update(elapsed_seconds=time.monotonic() - started, model_calls=budget.calls,
                      accounted_tokens=budget.tokens, estimated_usd=round(budget.estimated_usd, 8),
                      unique_frame_hashes=len(unique_frames))
        (output / "result.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
    return result


def append_event(output, event):
    with (output / "decisions.jsonl").open("a", encoding="utf-8") as stream:
        stream.write(json.dumps(event, ensure_ascii=True) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--exe", type=Path, required=True)
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--config", type=Path, default=ROOT / "config/midterm.json")
    parser.add_argument("--policy", choices=("baseline", "current", "history"), required=True)
    parser.add_argument("--seed", type=int, default=101)
    parser.add_argument("--situation", help="Required with a version-two situation configuration")
    args = parser.parse_args()
    result = run_episode(args.exe, args.data, args.output,
                         json.loads(args.config.read_text(encoding="utf-8")), args.policy, args.seed,
                         situation_id=args.situation)
    print(json.dumps(result, indent=2))
    raise SystemExit(1 if result["termination"] in ("harness_error", "provider_error", "initialization_error")
                     or result.get("cleanup_errors") else 0)
