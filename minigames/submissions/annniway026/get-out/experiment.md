# Get Out experiment: annniway026

Principle: perception

Student design goal: "I want to test how allowing players to jump over walls changes their spatial reasoning and route-planning strategies."

## Prediction (student writes before building)

TODO: Describe one design change, the player behavior you predict, and what
observation would make you question that prediction.

## Restricted-jump revision

Student rationale: "The previous implementation allowed players to jump over walls of any length, which weakened walls as obstacles and often turned them into shortcuts. I want to preserve wall-jumping while ensuring that walls still constrain route planning."

Only maximal blocks of exactly one wall along the selected direction are now
jumpable. Longer blocks and missing landings refuse the move without spending
moves. Checking the cell beyond the adjacent wall distinguishes a one-cell
block from every longer block; scanning the rest of a refused block is unnecessary.
The original open-path slide is unchanged. No other obstacle/entity types exist.

Updated engine.js, tests/wall-jump.test.cjs, index.html, app.js, README.md,
and rule-source-map.md, plus this report. Removed the previous multi-wall
success expectation and changed the exit-jump fixture from S##E to S#E.
Added multi-wall refusals (including all directions), single-wall boundary
refusals, and an unreachable solver case for S##E enclosed by walls.
Before the engine update: 6 new-suite tests passed, 1 failed because the old
engine crossed a two-cell block. After the change: submission validation passed
and all 14 submission tests passed, including all original teaching boards.
One input still stops after its first jump even with another separated block.

Root Python tests were rerun: 36 tests, 24 errors (including missing anthropic
and temporary-directory permission failures). Offline diagnostics remain
incomplete: GitHub authentication, Pyxel and deterministic tests failed; Python,
Git and the scripted fixture passed. No live provider calls were made. Browser UI checks remain unverified following the earlier
file-URL policy block. A student-supplied playtest reflection is summarized in the comments section below; detailed playtest records remain incomplete.
Independent read-only rules review of this revision: no findings after checking
the engine, tests, interface, rule map, instructions and refreshed report. The
reviewer did not independently execute tests. Approval remains with the student
and instructor.

## Implementation (previous unrestricted version)

engine.js adds adjacent-wall jumping; open-path slides and exit rules stay intact.
index.html and app.js explain the movement. README.md documents play and checks;
submission.json names the variation. rule-source-map.md records local evidence;
tests/wall-jump.test.cjs adds deterministic coverage. Other files are scaffold copies.

Actually run: new tests before implementation (2 passed, 3 failed for absent jumps);
submission check passed; submission tests passed all 12. Coverage includes open
paths, single/multiple walls, all directions, boundary refusals, stopping after
one run, return to start, exits, terminal states, invalid actions, legal actions,
solver and all teaching boards.

Root unittest discovery failed (24 errors, including missing anthropic and temp
permission errors). Offline setup is incomplete: GitHub authentication in sandbox,
Pyxel and deterministic checks failed; scripted fixture passed. No live calls.
Browser opening was blocked by the tool's file-URL security policy. Interaction,
undo/reset, hint UI, editor/completion UI and narrow-screen controls remain manual
checks; no human playtest result is claimed.

## Playtest observations

TODO: Record anonymous player labels, board, version and order played, hints
requested, restarts, completion, and one revealing action or remark. Separate
observations from interpretations. No names, emails, or other personal data.

## Interpretation and revision (student writes)

TODO: Compare the evidence with the prediction. Mention prior familiarity,
practice effects, sample size, or other limits. Describe the revision made or
one next test. A single player's response supports a question, not a general claim.

## AI assistance and human decisions (student writes)

TODO: State what Codex generated, what you checked, and one design decision you
retained or changed. Include any remaining known issues.

## Independent review

Independent read-only rules reviewer found no blocking findings and independently ran all 12 submission tests successfully. Minor finding: successful jumps were announced as “Slid”; changed this to “Moved”. Human play supplies experience evidence; student/instructor approval remains pending.


## Design and playtesting comments

*Summary of the student's supplied reflection.*

I restricted jumping to single-cell wall blocks because unrestricted jumping
turned walls into shortcuts. Keeping consecutive walls impassable supports
meaningful choices between jumping and navigating around obstacles. I expected
more deliberate route planning; rare jump use or continued easy solutions would
suggest limited strategic value or insufficient board constraints.

In the second playtest, Player A considered when to approach consecutive walls
and when to jump isolated walls more carefully than in the earlier versions.
This suggests more meaningful route decisions, although the small, simple board
still allowed a quick solution. This observation from one player does not
establish a general effect.

I would keep restricted jumping and explore harder board layouts and clearer
jump-trigger conditions, creating stronger trade-offs without complicating the
rules. The current board's limited complexity remains the main limitation.
