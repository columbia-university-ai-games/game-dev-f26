# Get Out experiment: alexhekmat

Principle: sequence — Increase difficulty gradually (student-selected during reflection).

## Student design and prediction

Requested movable red `*` walls that move right on any directional input,
with multiple moving walls in the level.

Student prediction (before human testing): “I think that it would make the game harder,
as a player would be able to choose where the wall is. As in, if the player were
to be jammed to a wall on the right side of the screen, they could press right
again, even though they wouldn't move, and make the red wall move, there should
also be multiple walls in the level.”

The first level now contains two moving walls. Pressing into a wall can advance
them even if the player stays still. Timing after sliding, choosing the placed tile and its right neighbor,
and waiting at occupied destinations are assistant-selected conventions.

## Planned human playtest — not observations

Give the variation to a neighbor without coaching; observe whether they use a
blocked direction intentionally to reposition walls. Record hints, resets,
completion and an anonymous remark. Ask whether controlling walls made planning
harder and why. TODO: Student supplies an alternative outcome, what that result
would mean, and the next design decision. No human playtest has been reported.

## Implementation and actual automated evidence

Changed engine.js, app.js, style.css, index.html and levels.js in this personal
copy; added rule coverage in tests/engine.test.cjs and local docs/rule-source-map.md.
The solver includes wall positions; it reports uncertainty at its search limit.
Three new moving-wall tests initially failed because the reference rejected `*`.
The solver example was corrected during implementation to respect protected exits.
11 game tests pass; all teaching levels are solver-verified. Submission validation
passes. The project's .venv passes all 43 Python tests. Offline setup diagnostics
pass Python, Git, Pyxel, tests and fixture, but sandboxed GitHub auth fails; a
separate network-enabled gh API call verified the signed-in identity. No live
model/provider call was made.

Browser checks: arrow input advanced a star during a blocked player move; undo
restored its position; reset restored the board; hints reached completion;
390px-wide direction controls worked. These are software checks, not evidence
that a neighbor finds the game harder. The second wall was added after these
initial checks and the final board was rechecked separately: both stars advanced on a blocked
right input, then seven hint-guided moves reached the exit (eight total turns).
Reset restored both stars and zero turns.

## Independent code review

A separate read-only rules reviewer found a missing star glyph, unbounded solver,
stale README, and incorrectly labeled rule assumptions. All were fixed; the
reviewer independently reran 11 passing tests and found only citation cleanup,
which was also fixed. Student/instructor retain approval decisions.

## Interpretation

TODO: Student interpretation after a peer plays. Compare observations against
the prediction and record an alternative explanation or next revision.

## Correction: alternate between two tiles

Student clarified that walls should transition back and forth between two tiles,
not continue traveling. Each star now alternates between its placed tile and
its right neighbor, waiting when blocked and never wrapping. Two walls targeting
the same tile both wait. This pair choice is an implementation assumption.
The no-wrap and four-turn oscillation tests failed before this correction;
an independent reviewer found a simultaneous-collision bug, reproduced by a
failing regression before the fix. Tests also check waiting on return and
detached wall metadata in observations. All 14 game tests pass.
Browser checks confirmed both stars move out and return on two right-key inputs
while the player stays at the start. Earlier travel/wrapping evidence above is
historical and does not describe this revised version. Human experience remains
untested. Repository Python tests pass; offline diagnostics retain the sandboxed
GitHub authentication limitation recorded above.

Final correction checks: independent reviewer reran all 14 passing tests and
verified collision and observation fixes. Browser undo restored the outward
positions; reset restored the starting positions; hints reached the exit in
four moves. The game was left reset for play.

## Revision: walls move before the ball; more moving walls

Student requested more moving walls in the first example and that the ball hit
walls where they have moved to first, including on the return-left turn.
The first puzzle now has seven moving walls (previously two). On each input,
walls resolve their moves first, then the ball slides using their new positions.
A wall targeting the ball's current cell waits for that turn, even if the ball
subsequently leaves. Walls still alternate between the same two tiles.

Four rule/solver assertions failed against the old wall-after-ball engine,
including a regression for outbound and returning collisions; all 15 game tests
now pass. All four built-in boards remain solvable. This supersedes the timing
in the earlier historical entries. No new human playtest has been reported.

Final verification of wall-first revision: the independent reviewer reran all
15 tests with no findings. In the browser, seven stars were visible; Up then
Right returned the nearest wall left before the ball attempted to slide, leaving
the ball correctly blocked at its start. Undo and reset worked. Four hint-guided
moves completed the revised first puzzle. The game was left reset for the student.
All 43 Python tests passed; offline diagnostics still flag sandboxed GitHub auth.

## Revision: moving walls in every level and clickable colors

Student requested moving walls in levels 2–4, no star glyph on the tiles, and
red-to-green coloring when pressed. Levels 2, 3 and 4 now have four, five and
five moving walls respectively. Board codes still use `*`; rendered tiles are
blank. Clicking or pressing Enter/Space on a moving tile toggles red/green.
Color is cosmetic: it follows the same wall through movement and undo, while
Reset or a level change restores red (assistant-selected conventions).

A new level-coverage test failed on level 2 before adding walls. All 16 game
tests now pass, including solvability of all four levels. Independent read-only
review reran 16 tests with no findings. Browser checks verified no tile text,
red/green toggling, keyboard activation, color following movement/undo, reset
restoring red, and clicking at 390px width. Hint-guided browser play completed
levels 2, 3, 4 in 3, 5, 3 moves respectively. These are software checks only;
no new human experience observations or student interpretation were supplied.

## Correction: arrow-key colors, not tile clicks

Student clarified that arrow keys should change the wall color. Removed tile
click handlers and cosmetic color storage. Color now comes from the wall's
position: red at its left/home tile, green at its right tile. Blocked walls
keep their color; undo restores it with position. This supersedes the clickable
color behavior above. All four levels retain their added moving walls and tiles
remain blank.

Browser verification: initial 0 green walls, first Up 7 green, second Up 0;
clicking a tile kept 0; undo restored 7; reset restored 0. All 16 game tests
passed and an independent reviewer reported no findings. Color-position mapping
is the assistant's implementation convention; human playtesting is still pending.

## Draft PR verification — October 18, 2026

Student supplied the Decisions, Possible Outcomes, Playtest and Next Decision
reflection directly for the PR description. Human playtesting remains planned.
All 16 game tests and 43 repository Python tests passed again. Submission
validation passed. Offline setup retains the sandboxed GitHub auth limitation;
a separate authenticated request verified the account and repository write access.

Fresh independent final review: no findings; reviewer independently reran all
16 game tests and submission validation successfully.
