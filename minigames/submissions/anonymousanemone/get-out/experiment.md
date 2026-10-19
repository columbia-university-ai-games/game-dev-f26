# Get Out experiment: anonymousanemone

Principle: sequence

## Prediction (student writes before building)

Describe one design change, the player behavior you predict, and what
observation would make you question that prediction.

I wanted to add in moveable blocks, that when the player collides with it, will be pushed to the next obstacle or edge. I expect the player ot have to strategize more, as it is now possible to lead yourself into a dead end and have to restart. I would question my prediction if people take the same amount of time to consider the levels as a level without any moving blocks.

## Implementation

Student request: “make certain blocks moveable, so the player can push it as it collides.”
Student clarification: “the block should get pushed to the end.”

Added B blocks, collision pushes to the next obstacle or edge, an introductory board, orange rendering,
and an editor tool. Engine and solver share the same rule; solver keys include block
layouts. Undo keeps immutable board snapshots; reset reloads the original board.
Changed engine.js, app.js, levels.js, index.html, style.css, tests/engine.test.cjs,
and submission.json. Rule evidence and assumptions: docs/rule-source-map.md.

Check and test commands for owner anonymousanemone passed (10 engine tests).
Three new tests failed before implementation because the engine rejected B.
Revised end-of-push tests then failed against one-square pushing and passed after revision.
All 43 course tests passed using .venv/bin/python. Offline diagnostics passed Python,
Git, Pyxel, tests and scripted fixture; sandboxed GitHub authentication check failed
though the explicitly authorized GitHub account lookup succeeded. Setup verification
remains partial; no live provider call was made.
Verified pushes, refused pushes, immutable prior states, solver hints, completion,
visible observations, and solvability of all five boards with deterministic tests.
At the implementation checkpoint, browser tools were unavailable and manual
checks were pending. The student has since confirmed completing the manual
browser checks for movement, Undo, Reset, hints, completion, editor/exchange,
and narrow-screen controls.
At that implementation checkpoint, human experience and prediction were still
student-written sections awaiting completion; the sections above and below now contain student input.

## Playtest observations

These are the student's retrospective observations of three players playing the
ten-level variation. Exact build, play order, prior familiarity, elapsed times,
move counts, and restart counts were not recorded. No verbatim player quotes
were recorded. Level-specific details are included where remembered.

- Player 1 needed no additional instruction; the student observed that the
  simple Level 1 introduction explained the mechanic well enough. They passed
  Levels 1–5 on their first attempts. The student recalled restarts being needed
  after Level 6, and one hint requested on each of Levels 6 and 9. Final
  completion was not explicitly recorded.
- Player 2 was initially confused about the basic movement keys but quickly
  caught on. They struggled more and quit at Level 8. They used no hints; the
  student prompted them to restart. Restart counts were not recorded. These
  prompts mean this was not entirely unassisted play.
- Player 3 needed no additional information and solved all the levels fairly
  quickly, according to the student; no times were recorded. They used no hints
  and restarted more often than Player 1. The student heard angry words when
  incorrect block moves left them unable to progress and they had to restart;
  the exact words and levels were not recorded.

## Interpretation and revision (student writes)

No gameplay revision was made from this report alone.

Overall, I thought player 3 had the right idea, a
challenge (edging on frustration) was one of my goals.” I did think player
2 was comparatively rather impatiemt, and not a fan of reading instruction,
so I ended up pushing them to click on what they need to (the restart button).
However, given the experiences of player 1 and 3, I fel that the controls were sufficient.
I doubt player 2 would've enjoyed the unrevised game any
more, so I would take that as an extreme example of someone who doesn't read instructions,
which may be illuminating for more complex games. I made an informal comparison
(in my head) that this modification did seem to take people longer than the no-mod
example we played in class.

Based on these observations, for my next playtest, I would compare the consideration
times for the modded and unmodded game, and response to instruction. I might also
add a teaching section where the first time someone messes up beyond recovery (has to restart or undo), the restart and undo buttons flash to draw the player's attention and teach them to restart and undo.


## AI assistance and human decisions (student writes)

Codex generated the game mechanics as I had specified, then I playtested and gave feedback on difficulty. It also initially wrongly made the block pushing only one block at a time instead of all the way to the next obstacle/wall.

## Independent review

Independent rules-reviewer inspected the final engine, UI, map, tests and README;
no blocking findings. Fixed copied README paths and instructions, and clarified
adjacent versus distant obstacles in the rule map. Reviewer reran all 10 tests.
Remaining coverage note: no dedicated solver regression board requiring revisiting
a player position with a different block layout. Browser checks were pending
at that checkpoint and have since been completed by the student.
Human play supplies experience evidence; the student and instructor retain approval decisions.

## Ten-level sequence update

Student request: “there are no pushable blocks in the later 9 games. generate completable levels of increasing difficulty and pushable blocks”

Replaced the four wall-only boards with nine generated push puzzles, preserving
the introductory board. All ten include B blocks and require pushing: replacing
B with fixed walls makes each board unsolvable. The unchanged engine's BFS proves
shortest solutions of 2, 3, 4, 5, 6, 7, 8, 9, 10, and 11 moves. Every solution
was replayed to a win. Increasing shortest-path length is an objective ordering,
not evidence of increasing human difficulty. Human playtest was still pending at
this checkpoint; retrospective observations are now recorded above.

The new sequence test failed first (five rather than ten levels), then passed.
Owner validation and all 11 engine tests passed. Updated levels.js, tests,
README and manifest. No movement rule or player boundary changed.
Browser interaction and narrow-screen checks were pending at that checkpoint;
the student has since confirmed completing them.

## Local PR preparation review (2026-10-18)

Updated the local branch to the fetched class main before preparing the submission.
Current verification supersedes the earlier five-board results: owner validation
and all 11 game tests pass for the ten-board sequence; all 83 course tests pass.
Offline headless diagnostics pass outside the sandbox (partial Setup Verification;
no live model call or CI evidence was produced).

A separate read-only reviewer found no blocking engine or player-interface defect.
The solver test still lacks a dedicated board requiring a return to the same
player position with a changed block layout. At this review checkpoint, human
observations and student-written sections were incomplete. Student input is now
recorded above, including the student’s next playtest and possible teaching
revision. The student confirmed completing the manual browser checks. The
proposed teaching revision is future work and has not been implemented.
Preparation is local only, with no push or PR creation. The student will write
the PR description.
