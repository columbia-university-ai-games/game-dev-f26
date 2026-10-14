# Independent rules-review handoff

## Changed rules and evidence

One real-time enemy replays all crossed player tiles from the origin. It spawns
after 3/2/1/1 successful slides and moves at 2/3/4/5 tiles per second.
Touching it causes capture; escape and capture are terminal. Undo/reset restore
complete state, and workshop tools/hidden tabs suspend elapsed time.
See `rule-source-map.md` for code evidence and explicit design assumptions.

## Test evidence

Eleven new tests failed before the engine change: the reference lacked the
trail, enemy, elapsed-time API, chase settings, and curriculum configuration.
The personal copy now passes all 19 engine tests, including illegal/blocked
directions, fractional elapsed time, chronological corner following, capture
during player slides and enemy ticks, terminal states, detached observations,
and immediate hint routes for all boards. The course folder validator passes.
Browser checks have observed completion, timed capture while stationary,
paused time, safe hinting, and undo restoring spawn progress.

## Observation/action boundary

`GetOut.observe` detaches all visible state. `legalActions` follows the engine
and is empty after capture/escape. Blocked directions change no state; enemy
time advances separately. No model player or file access is added.

## Assumptions and limits

Enemy speeds are initial tuning; human outcomes remain untested. Hints search
immediate routes with zero thinking time and explicitly warn about movement
while deciding. The first board can be solved before the enemy spawns.
The student has now requested a draft PR to the class repository.

Review the personal copy under `minigames/submissions/demonrain7/get-out/`.
Do not edit files or approve/merge anything. Report concrete issues using the
repository rules-reviewer format.

## Review resolution

A separate read-only rules reviewer independently passed 18 tests. Findings
were resolved: Cancel editor resets the real-time clock before resuming;
manual Resume uses the preceding pause reason for trace classification;
observations expose active/index/position without hidden fractional timing.
The reviewer re-read the changed files, reran the tests, and reported No findings.
The repository's 43 deterministic tests and offline setup check also passed.

## Speed revision review handoff

The student requested 2× enemy speed. The current rates are 2/3/4/5 tiles per
second; spawn delays remain 3/2/1/1. The engine default now matches the first
level at 2 tiles/second. The speed-table assertion and new elapsed-time test
failed before the change; the latter verifies two trace tiles per former
one-tile interval on every level. The game now has 19 tests.
Observation/action boundaries are unchanged. Human experience at these
speeds remains an assumption pending playtesting. The independent reviewer
verified exact doubling, all 19 tests, and agreement between rules, UI, and
documents. Its stale current-test-count note was corrected; there were no
implementation findings.
