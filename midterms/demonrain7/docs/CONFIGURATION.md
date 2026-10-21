AI-use disclosure: Codex recorded the actual runtime and production-agent configuration under the student's direction.

# Configuration record

Runtime settings are executable inputs in [config/midterm.json](../config/midterm.json).
The old `config/week4.json` is retained as a historical checkpoint. The scope
record is described in [SCOPE.md](SCOPE.md). The current `midterm-v1` configuration
is the preliminary five-seed single-start study, not the final compliant suite.
Its null instructor-agreement field does not override the new assignment's
Week 3 scope-record procedure. P1 will version the distinct-case protocol before
further tuning; see [the October 21 plan](MIDTERM_PLAN.md). The proposed new spending
allocation is not yet runtime configuration. Course CI is prepared in `delivery/`
and is not installed or executed in the course repository yet.

| Field | Current implementation |
| --- | --- |
| Purpose | Play the original first level through its ordinary wizard controls; compare a visual script, current-frame model and bounded-history model |
| Model | Gemini `gemini-3.5-flash-lite`, Vertex `global`, temperature 0.2, MINIMAL thinking; actual response version logged when available |
| Prompt / output | `prompts/player.txt`; strict `RESPONSE_SCHEMA` in `scripts/player_contract.py`; one action plus a short English intention |
| Available action | Direction, fire/strafe, at most one consumable, 1–32 ticks; the trusted runner validates before native input |
| Prohibited access | Source, maps, coordinates, hidden state, debug operations, browser owner keys, filesystem/shell tools, resets and cross-episode memory |
| Context sources | Current rendered PNG/status/ticks; history adds at most three prior permitted observation/action/intent records |
| Retrieval / reflection | No retrieval service, persistent memory, self-training or hidden reasoning transcript; only the supplied short intentions are retained |
| Limits | 80 actions/calls, 2,000 ticks, 900 s, 30 s request timeout, 1,000,000 accounted tokens, $0.30 estimated/episode, $3 suite including carried-forward use |
| Failure / fallback | Reject malformed outputs without stepping; stop after two consecutive invalid responses, timeout or provider failure; no silent substitution of replay or baseline |
| Logging | Decisions, allowed context hashes, response/version, usage/latency, primary outcome and cleanup errors; native traces, PNGs and binary/resource hashes |
| Human override | Ctrl+C stops a run; student directs scope/evaluation choices and final claims; Week 3 scope origin is linked |
| Tests / CI | `uv run --frozen python -m unittest discover -s tests -p 'test_players*.py' -v`; `.github/workflows/checkpoint.yml` plus native CTest |

The remote model has no registered SDK tools; its structured action is the
bounded control interface. The local evaluator owns processes, paths and
credentials. That separation is an API/context boundary, not an OS sandbox.

## Production roles actually used

| Role | Configuration/context and permissions | Output, handoff and evidence |
| --- | --- | --- |
| Student Executive Producer / Creative Director | Chooses the classic, scope, sequencing, optional features and release/submission decisions | Selected Catacomb II, requested English/module checkpoints, paused new NPC design; final judgment remains human |
| Codex implementation / engineering / QA preparation | `AGENTS.md`, accepted module plan, sources, `skills/catacomb-validation/SKILL.md`; local code/build/test tools and authorized GitHub workflow | M1–M5 commits/PRs, fixtures, live baseline traces, packaging and handoff; may not invent peer observations or approvals |
| Independent Codex reviewer | Fresh task context, pinned `fbe709e`, explicit read-only review brief; offline/native tests, temporary report writes; no live provider, browser, credentials, commits or pushes | Three P2 findings, implementer corrections, independent correction check in `docs/evidence/independent-review-20261019.md` |

The implementation and review used the configured Codex session model; its exact
runtime identifier was not exposed in this evidence record. They are separate
production tasks, not the Vertex gameplay player. No distinct art, audio or
narrative agent is claimed: this bounded reconstruction reuses attributed
original assets and mechanics. The [agent-team log](AGENT_TEAM_LOG.md) records
actual handoffs, limitations and retained human responsibilities.

## Reusable extension

`skills/catacomb-validation/SKILL.md` is the reusable workflow artifact. Its
commands build the project, run native/player/package checks, validate original
resources and preserve correctly labeled evidence. It prohibits hidden-state
leaks and invented human/model results. It does not grant publication,
submission or messaging permissions independently of the user.
