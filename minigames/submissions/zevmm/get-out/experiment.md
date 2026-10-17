# Design and playtesting

Decisions: What did you change, why did you choose it, and which puzzle principle informed the decision?

I added a pushable wall type to the game. When you bump into these walls, they stop the player as usual, but then the wall itself slides in the direction you hit it. I chose this feature because it felt like a minor change to the original game mechanics, yet it allows for a big change in dynamics, since it introduces more complex puzzles and an element of timing.

This decision was informed by Puzzle Principle #4: Give a Sense of Solvability. In the original game, the only way to know a puzzle was solvable was to actually see the solution. With the moving walls, you can see a solution, but there is the extra difficulty of actually executing the solution with the correct timing. This creates scenarios where a player fails the puzzle, but remains motivated to reset and keep trying because they see the solution.

This mod also relates to Puzzle Principle #5: Increase Difficulty Gradually, since levels can start with no moving walls, then can include a wall which needs to be bumped once, and then can use walls that must be redirected/bounced off of while already in motion.

Possible outcomes: What do you expect players to do? What different outcome might you see, and what would each outcome suggest about your design?

I expect players to at first hit the block, and then wait for it to come to a stop before executing their next move. For some puzzles, this is sufficient. But for more difficult puzzles, they will find this is not enough, and hopefully they will think to hit the block while it is already in motion.

If the player never realizes they can redirect/bounce off a moving wall, this suggests my design is unintuitive and I should add a hint or visual indication of some kind.

Playtest: What will you ask someone to try, and what behavior will you watch for? If you have tested it, separate actual observations from predictions.

To playtest this, I created a series of four levels. 1) a moving wall which you let slide until it stops. 2) a moving wall you have to push twice, and which you are likely to hit while it is already in motion. 3) a moving wall which you have to bounce off of while it moves. 4) a moving wall which you have to redirect and then bounce off of.

I will watch to see the time the player spends on each level, and ask them to rate the perceived fun and difficulty level. I also hope that in level 2 the player starts to understand how hitting the moving block works (it still stops them), even though it’s not required to beat the level.

Actual observations: The mechanic was intuitive to my friend who tested the game, but they had complaints about the collision detection. When the wall is between two squares, the player can sometimes pass right through it. I like the smooth movement animation, but I could maybe change the color of the wall to make it solid/darker when actually on a square, and then lighter when between squares. (I think keeping interactions to integer coordinates is easier/cleaner than trying to allow walls to sit between grid spaces)

Next decision: What would you keep or change depending on the result? Mention any relevant checks you ran or known problems.

Mostly reiterating prior answers, but if players find the multi-collision levels difficult I would add some hints. I ensured all levels were completable, but the unclear collision boundaries do add some annoyance (without improving the game in any way), so that is a known problem. My playtester was also able to get through all the levels without any guidance/assistance.


---

## Submission and implementation

Owner: zevmm. Primary principle: solvability (Confidence in solvability). Secondary principle: sequence (Gradual difficulty). The design, predictions, observations, and interpretation above are the student's words, supplied after implementation; they are not a contemporaneous pre-build prediction record.

M walls retain a direction between actions and can be redirected while moving. Fixed # walls remain fixed. Engine player actions resolve immediately, with the original 0.22-second visual easing. Walls advance one cell every 900 ms and animate linearly between grid cells. Undo restores state and headings and pauses; reset clears motion. Pause/Wait controls and heading-aware hints allow inspection. Wall collisions remain discrete, explaining the student's reported visual collision limitation.

Student-authored Level 1 through Level 4 follow the five existing puzzles; all supplied rows are preserved exactly. Shared code and other submissions are unchanged. See rule-source-map.md for rule evidence and implementation assumptions.

## Validation

- `python scripts/minigames.py check --owner zevmm`: passed.
- `python scripts/minigames.py test --owner zevmm`: all 17 tests passed (14 engine, 3 simulated DOM/clock).
- All nine boards are solver-solvable. Automated solvability does not establish human difficulty or timing feasibility; the student separately reports unassisted playtest completion.
- Tests cover active-wall redirection, wall/player collisions, contested destinations, start restoration, waiting in solutions, original player-element preservation, slow wall clock, undo/reset, and hint/wait pausing. New movement tests failed before the engine update.
- Visual browser/narrow-screen/touch verification by the assistant remains TODO; simulated DOM tests do not render CSS. The student's actual play observations are recorded above.
- Earlier full Python repository checks had four environment errors (missing dependencies and Windows symlink privilege). Offline setup diagnostics remain incomplete. No live provider was called.

## Independent review

An independent read-only reviewer examined the final submission against the reference and ran all 17 tests: no blocking issues. The smooth-animation versus integer-grid collision limitation is disclosed above. Minor wording was clarified to distinguish immediate engine updates from the original visual easing. This review provides code evidence, not human play evidence or gate approval.

## AI assistance and human decisions (student writes)

TODO: Student AI disclosure in their own words. Codex implemented the requested wall mechanics, animations, tests, controls, and metadata; the student chose the mechanic, mid-slide redirection, relative speed, animation preference, authored four puzzles, and supplied the design/playtest account above.

## Remaining evidence

TODO: Optional detail about playtest board order, hint/reset counts, measured time, and difficulty/fun ratings if recorded. Do not infer measurements from successful completion. Known collision-boundary feedback remains open; the student suggests changing wall appearance between cells as a possible next revision.
