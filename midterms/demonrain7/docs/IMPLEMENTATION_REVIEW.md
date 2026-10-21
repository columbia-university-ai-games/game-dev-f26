AI-use disclosure: On October 12, 2026, Codex implemented the adapter and fixes, performed self-checks, and prepared this record.

# Implementation and review record — Week 4

Current midterm review: [October 19 independent report and correction
disposition](evidence/independent-review-20261019.md). A fresh reviewer found
three failure-accounting bugs in M1–M3; the implementer corrected them and added
regressions. All twenty offline player/evaluation tests pass. The reviewer
checked the final classification fix independently. This supersedes the older
"independent review pending" status below, which is retained as the Week 4 history.

## Roles actually used

| Responsibility | Actor / evidence | Limit |
| --- | --- | --- |
| Game choice and work constraints | Student chose Catacomb II and requested repair without desktop control | Final scope agreement and acceptance remain with the student/instructor |
| Implementation | Codex in this conversation; local diff against upstream `473d1362` | Existing engine code is reused and attributed |
| Testing and self-review | Same Codex session; native tests, Python tests, real-resource runs, frame inspection | **Not an independent review** |
| Independent review | Pending | No reviewer identity, approval or finding is invented |
| Playtesting and final decisions | Pending student/peer session | Automated frames are not human playtest testimony |

## Implemented changes

- Original simulation iteration extracted into `GameTick`, reused by human and stepped agent modes.
- `agent_bridge` provides single-level setup, headless execution, observations and terminal status.
- `agent_protocol` validates an action allowlist before state changes.
- Python adapter copies only selected resources, exports immutable PNGs and records traces/configuration.
- Windows resource flags and startup option scan repaired; warp-number parsing repaired.
- Documentation, first configuration and reusable validation skill prepared. The skill passed its structural validator; the workflow's underlying commands were run in this session.

## Evidence and decisions

Three CTest groups and five real-resource integration cases passed; see [VALIDATION.md](VALIDATION.md). Real level 1 ran for the 177-tick demo with empty stderr. Original artwork was retained after checking a visual concern against a separate source-port screenshot. No gameplay redesign was needed.

The adapter deliberately pauses the world while waiting for a player command, bounds each action to 1–32 ticks, counts the initial neutral tick and omits audio from model observations. These choices are recorded for later fair comparison; they do not establish human-equivalent timing or difficulty.

## Independent review handoff

Review `agent_bridge.c`, `agent_protocol.c`, `scripts/catacomb_env.py` and their interaction with `GameTick`, initialization and terminal paths. Check that neither a malformed request nor observe changes the world, that endings cannot be stepped through, that original control semantics survive batching, and that only documented visible output reaches the player. Inspect actual tests for missing failure cases; report file/line, concrete trigger and observed effect. Run the appropriate tests headlessly and record the platform. Do not change gameplay or claim approval without evidence.

Unresolved items to scrutinize: full first-level completion, live strafe/door/wall/bolt/healing behavior, original-DOS fidelity, Mac compatibility and future model-host permissions. A coding agent with repo access is not the intended playing agent.

No git commit, PR, Asana update, CourseWorks upload or public release was made in this repair turn. A later independent review and human decision should be added here with their actual evidence.

## Checkpoint preparation — 2026-10-17

Codex checked the live CourseWorks syllabus, published assignments, weekly
preparation pages, announcements, and course repository instructions. The
submission routes and unresolved midterm entry are recorded in `SUBMISSION.md`.
The existing work was prepared as a personal private-repository draft PR, with
English documentation, a pinned-action CI workflow, ignored resources and
credentials, and a fresh Windows validation run. This remains implementation
and self-review evidence, not an independent review or completed submission.
