# Independent code review record

Review task: `echo_independent_review`, a fresh-context read-only agent that did not write the reviewed implementation. It read root/project instructions, rule-change/reviewer instructions, the public contract/map, core, tests, then players/runner/renderer. It ran only deterministic local tests/check/build, no model requests, edits, gate decisions or merge.

## Pass1 — core

1. **R3 swept collision:** .35-unit sampling missed a grazing reef corner. Reproduced both with analytical test points and a24-action publicly legal trace reaching (66.306,24.394), whose E:rush crossed within1.394 of reef vertex(71,23), below boat radius1.4. Root added `REG-001`, ran it red (`true !== false`), replaced sampling with exact segment-to-edge minimum distance, and ran green. The reachable rounded endpoint is covered too.
2. **R6 fish sound memory:** rule map promised decaying sound interest but fish reselected each tick without a remembered target. Root added a beacon-expiry behavioral test, observed red, then implemented retained target/interest and provided DESIGN.md. Green; stronger/quiet sound and delayed-beacon mechanism tests were also added.
3. **Return/attack priority:** docking skipped a publicly announced attack and left a terminal pending corridor. Root added `REG-002` red (returned vs sunk), then resolves existing attack before banking; a surviving return still precedes night expiry. Green; public contract updated.

## Pass2 — full implementation

Reviewer independently confirmed all three core fixes,20/20 tests and check/build passing, and no private-state inputs to renderer/audio/model in inspected code. It found:

4. **Baseline harbor escape:** return priority ignored a known imminent corridor and sank instead of taking a legal safe move. Runner implementation agent is responsible for test-first repair and evidence in runner-review-fixes.md.
5. **Replay result integrity:** forged runnerStop could claim step_limit after a genuine terminal return while replay still verified. Runner implementation agent is responsible for validating true stop boundaries and all recomputable summary fields; see runner-review-fixes.md.
6. **Replay UI modal:** opening help/menu stopped legitimate timed replay with a misleading incompatibility error. Renderer implementation agent is responsible for explicit stop/pause behavior and UI verification.

Fix validation of items4–6 and any later recording changes remains pending a further independent pass. “No finding” on an inspected boundary does not imply human playtest approval or coverage of uninspected behavior.
