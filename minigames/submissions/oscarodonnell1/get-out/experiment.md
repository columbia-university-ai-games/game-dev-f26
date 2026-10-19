# Get Out: progressive hints

Principle: `hints`.

## Prediction before building

The student selected progressive hints: a question, then a clue, then a move.
The student's goal, in their own words:

> Help them figure out the route themselves and feel that they solved it.

This goal was recorded before building. The observations below were reported
after playing the variation.

## Design and playtesting

**Decisions:** I added a question, then a clue, then a move. Each step is optional.
I want players to figure out the route themselves and feel that they solved it.
This uses Schell's Chapter 14, Principle 8: hints can sustain interest (p. 263).
Schell writes that "a well-timed hint can renew their hope and their curiosity."
Lens 58 asks, "Which of the ten puzzle principles apply to each of my puzzles?"
(p. 265). Here I am applying the hints principle to the route-finding puzzle.

**Possible outcomes:** I expect a player to use a question or clue and then
figure out the move. That would support my goal. Some players might just want
the move fed to them. They can click through the earlier hints to get it.
If that happens, the sequence is not preserving the discovery I want.
I think having access to every hint can make the game less fun or competitive.
This is a possible outcome, not something I observed Player A doing.

**Playtest:** When I needed a hint, it was helpful. Player A played the game.
They found it fun and thought the hints were good. They solved it on their own
without using the hints. So this test did not show whether the gradual hints
helped Player A figure out the route. For the next test, I would ask a player
to try an unfamiliar board and use help when they need it. I would watch
whether they work out a move after a question or clue, or click through to
the move.

**Next decision:** If the early hints help players work out a move, I would
keep the sequence. If players skip straight to the move, I would test being
more stingy with hints. I could limit the number of hints or make hints use up
points. I want to see whether that keeps the game fun and competitive.
Those are ideas for a future test. They are not implemented or tested here.
The checks and known limits are listed below.

## Implementation

- The first request shows a question. The second adds a clue about a useful
  stopping feature or exit alignment. The third reveals one move.
- Clues are derived from the current board and the reference solver. They
  apply to imported and edited boards as well as the teaching boards.
- Every hint is optional. Requesting help never moves the player.
- Successful moves and Undo restart the sequence. Blocked moves preserve it.
- Reset and valid new boards clear help. Editor Cancel and invalid imports
  preserve the previous sequence. Help is hidden during editing.
- Unreachable positions receive staged recovery help. Finished boards disable
  hints. After all three levels, further requests are disabled until play changes.
- The trace records the level, kind, message, and position. The hint count
  counts revealed levels, not how many positions needed help.
- Reference rules, solver, move scoring, and teaching boards are unchanged.
  No route-history markers are used in this variation.

## Actual playtest observations

- I found a hint helpful when I needed one.
- Player A played and solved the game without using the hints.
- Player A said the game was fun and thought the hints were good.
- I also completed the board exchange with a classmate.

These are the student's reported observations. Player A's comments are
paraphrased. No hint-use sequence is claimed for Player A.

## Interpretation and revision

The hints helped me when I needed them. Player A did not need them.
That leaves the effect of the gradual sequence on another player untested.
My next question is how to restrict hints without losing the fun.
I would test a hint limit or a points cost. Neither has been added to the game.

## Checks and known limits

- All 13 student-game tests pass. The hint tests first failed because the new
  hint module was absent, then passed after implementation.
- Move hints were checked at every reachable position on the four teaching
  boards. No rule or solver changes were needed.
- Submission validation passes. All 83 deterministic Python tests pass.
  Offline/headless setup diagnostics pass; this is partial setup verification,
  with no live model calls.
- Browser checks pass for all hint levels, blocked/successful moves, Undo,
  Reset, board selection, completion, custom-board hints, no-route recovery,
  editor Cancel after an invalid edit, invalid/unsolvable imports, valid board
  exchange, trace display/download, and keyboard focus in both guides.
- At 390 x 844, there is no horizontal overflow. Direction buttons are
  58 x 48 pixels; the hint button is at least 44 pixels high. On-screen
  movement and completion work at that size. The browser reports no errors.
- An independent reviewer found that hiding the empty hint live region could
  suppress the first announcement. The region now stays rendered. The
  reviewer verified the fix and found no remaining actionable issues.
- The reviewer also checked clue and move validity over 6,262 positions on
  1,000 generated boards. This is software validation, not human evidence.
- The engine, solver, teaching boards, and original rule tests are byte-identical
  to the instructor reference.
- A question can repeat at different positions. Some clues may still be too
  vague or too revealing; the playtest should investigate that.
- Physical touchscreen and screen-reader-only play have not been tested.

## Decision provenance

The student chose progressive hints and supplied the design goal before this
change was built. After playing, the student supplied their experience,
Player A's result, the concern about skipping hints, and the ideas for hint
limits or point costs. This report separates those observations from the
possible outcomes and proposed next test.
Codex implemented the hint sequence and helped organize this report from
the student's directions and dictation.

## Sources

- Jesse Schell, *The Art of Game Design: A Book of Lenses*, third edition,
  Chapter 14, Principle 8, p. 263; Lens 58: The Puzzle, p. 265. Verified in the
  full publisher PDF accessed through Columbia Libraries. These are PDF pages
  306 and 308. [Chapter DOI](https://doi.org/10.1201/b22101-14) ·
  [Columbia library access](https://clio.columbia.edu/catalog/on1118981796).
- [Course hints exercise](https://github.com/columbia-university-ai-games/game-dev-f26/blob/main/minigames/EXERCISES.md).
- Eric Zimmerman, *The Rules We Break*, exercise 11, Get Out! Reference-game
  attribution and original course boards remain in `README.md` and the game.
