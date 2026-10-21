# Independent situation-interface review — October 21, 2026

Reviewer: fresh read-only Codex subagent `review_situation_checkpoint`, required
by the course `AGENTS.md` and `.claude/agents/rules-reviewer.md`. It did not
implement these changes, edit files, execute tests, make live requests, or
approve a merge. Target: working implementation against declaration `b68a641`.

## Reviewer report

> No blocking or should-fix findings in the reviewed implementation.
>
> [note] `docs/SCOPE.md:26`, `docs/MIDTERM_PLAN.md:81`, and
> `docs/MIDTERM_CHECKLIST.md:15`: these status statements still describe the
> situation/interface work as unimplemented. Update them before publishing so
> they agree with `DESIGN_SPEC.md`, `INTERFACE.md`, and the implemented checkpoint.
>
> Reviewed the working tree against `b68a641`. Native C rules, baseline policy,
> model transport, action parser, and player prompt are unchanged. This was a
> read-only source review; I did not execute tests, make model calls, edit files,
> or approve merging.

Files read: course `AGENTS.md`, rule-change/reviewer instructions; checkpoint
summary, rule map, design specification, interface, situations, scope and
relevant plan/checklist passages; `situation_env.py`, `run_episode.py`,
`evaluate.py`, `catacomb_env.py`, `package_release.py`, `player_contract.py`,
`vertex_player.py`, `visual_baseline.py`; both new configs; `agent_bridge.c`,
RNG initialization in `pcrlib_a.c`, CMake/pyproject; situation/evaluation/release
tests and relevant real-resource/context/failure tests.

## Implementer disposition

The three status passages were updated to distinguish implemented/local checks
from hosted CI and live/human work. No gameplay or interface correction was
requested. Independent review does not replace tests, human play, final student
judgment or course staff approval. Test results are in the separate checkpoint
record; the reviewer did not claim to rerun them.

## Independent follow-up: canonical route pins

The same read-only reviewer checked the correction against `81a6bf6` and
reported: "No findings in the canonical-hash correction." It confirmed that
parsed JSON is pinned, both LF/CRLF variants are accepted, a changed action is
rejected, and actions, prefix lengths and image/resource hashes are unchanged.
It also verified the previously flagged status passages. One remaining note
asked to change the plan's final "next unit" from P1 to P2/P3; that text is now
updated. Files checked: situation adapter, both route/declaration configs,
situation tests, situations/scope/plan/checklist docs. No test/model execution
or edits were performed by the reviewer.
