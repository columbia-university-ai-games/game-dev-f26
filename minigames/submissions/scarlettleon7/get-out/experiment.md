# Get Out experiment: scarlettleon7

Principle: perception

## Prediction (student account recorded after implementation)

“I wanted the player to not only think about where they would land on the board, but also where the door would be after they made their move. I just wanted to make the game a little bit harder to complete.”

“I think a player might try to use the up/down moves to simply get themselves on the same row as the door, rather use the blocking tiles to move towards the door.”

“I would watch out for the moves a playtester makes, whether they make more up/down moves or right/left moves due to the shifting rows.”

Timing note: these are the student's stated original intentions, supplied after playing the implementation; this is not a recorded pre-build prediction.
“My prediction would be challenged if the player started using the row shifts to win the games, instead of having it be more of an obstacle for them.”

## Implementation

Requested change (student's words): “the bottom row of the board becomes the top row, the top row becomes the second row, and so on. The only thing that changes is the order of the rows, nothing else.”

Implemented in engine.js: rotate intact rows after successful slides and carry the player with their row. Blocked inputs leave state unchanged. Crossing the exit still wins; the winning slide also rotates. The latter timing and carrying the player are implementation assumptions to confirm through play. Solver tracks board order as well as position. app.js redraws the board for movement and undo. index.html explains the rule; submission.json names the variation. See rule-source-map.md for scoped evidence.

Verification: tests were changed first; three failed on the reference engine (expected changed position/row ordering). After implementation, `python3 scripts/minigames.py check --owner scarlettleon7` passed and `python3 scripts/minigames.py test --owner scarlettleon7` passed all 9 tests, including all four teaching-board solutions. A temporary Node 22.20.0 runtime in /tmp was used because Node was absent from PATH.

No browser automation is available. The student reports that Undo and Reset worked correctly and that hints worked when tried in level 4. The student played all four levels; phone-width controls have not been tested. Code checks do not establish player experience.

Separate starter checks: Python unittest ran 36 tests with two import errors for missing anthropic; offline setup diagnostics also reported missing Pyxel, authentication check failure and failed deterministic tests. No live provider calls were made.

## Playtest observations

Student self-play report: “All four levels I tried were solvable.” The student tried all four included levels in the shifting-rows variation.

“I played the four levels in order, without using an hints or Resets. I do not remember all of my move counts, but they tended to be much greater than in the original game, sometimes more than 20 moves. However, when I played the levels a second and third time, I managed to get my move count below 10 moves.”

“I tried using hints in level 4 and it worked. Undo and reset also worked correctly. I did not use a phone for this. I did not get someone else to test the game.”

These are recalled self-play observations; exact per-level move counts were not recorded. The initial ordered playthrough used no hints or resets; the later functionality checks included hints, Undo and Reset.

TODO: Neighbor playtest, including level, order, completion, hints/resets, and observed vertical versus horizontal moves. TODO: Check direction controls at phone width.

## Interpretation and revision (student writes)

“My version of the game came out exactly how I wanted and predicted it to be.”

“I don't think I would change anything unless my version makes some of the level designs impossible to solve. All four levels I tried were solvable.”

Next test, in the student's words: “I would watch out for the moves a playtester makes, whether they make more up/down moves or right/left moves due to the shifting rows.”

Evidence limit: the reported play is the designer's own experience, with approximate recalled counts. Lower counts on the second and third attempts may reflect familiarity and practice. The independent solver also verified all four levels, but neither result establishes greater difficulty for a new player. Neighbor play and movement-direction counts remain TODO.

## AI assistance and human decisions (student writes)

Student-confirmed disclosure: “Codex implemented my row-shifting idea, updated the solver and instructions, wrote tests, and helped prepare the report and PR. I chose the mechanic, played all four levels, and decided to keep the design. I wrote most of the report.”

Codex also scaffolded the personal game copy, arranged an independent code review, and formatted the student's supplied words into this report.

## Independent review

Independent rule review (read-only Codex agent): found stale reference paths
and smoke instructions in README, and insufficient explicit labels/locations
in the scoped rule map. Both corrected. Reviewer checked engine, UI, tests,
and maps; no rule disagreement reported. Independent test execution was
blocked by Node missing from its PATH; implementation verification used the
temporary runtime. This is code review evidence, not student approval or a
human playtest.

## Draft PR verification

Fresh independent read-only review: No findings. Reviewer read the engine,
UI, README, evidence map, manifest, experiment and tests, and independently
reran all 9 Node tests successfully. Submission validation also passed again.
The full branch comparison against fetched class main contains only this
student game folder. Student self-play, intentions and interpretation are now recorded above.
Student AI disclosure is confirmed. Neighbor playtest observations and
phone-width controls remain TODOs. Exact historical move counts were not
recorded and are not reconstructed.
No ready-for-review or gate approval is claimed.
