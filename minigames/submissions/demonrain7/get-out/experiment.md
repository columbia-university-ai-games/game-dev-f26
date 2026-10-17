# Get Out experiment: demonrain7

Principle: pyramid — Combining Ideas. Secondary connection: Learning Sequence.

## Prediction (student supplied before building)

> I want to add a slow real-time enemy that follows the player while they decide where to move. This connects to “Combining Ideas,” because players must combine route planning with avoiding the enemy. I predict this will make the puzzle feel more tense and engaging. I will watch whether players plan ahead or rush into mistakes, and ask whether the pressure feels exciting or frustrating. If the enemy makes learning the puzzle too difficult, I will slow it down or introduce it on a later board.

The student additionally requested an enemy that follows the player's trace,
with curriculum-based difficulty: spawning after 3/2/1 player moves and
increasing speed as levels advance.

## Implementation

- `engine.js`: record every crossed tile, spawn one trace-following enemy,
  advance it by real elapsed time, detect capture, and make hints respect its
  current position. States remain immutable and observations are detached.
- `levels.js`: 3/2/1/1 successful-slide delays and 2/3/4/5 tiles/second.
  The student requested twice the original enemy speed on every level;
  these values remain tuning choices to evaluate with players.
- `app.js`, `index.html`, `style.css`: visible enemy and trail, chase status,
  curriculum table, pause/resume, complete undo/reset, and chase trace export.
- Existing reference boards, editor, exchange, guides, and movement controls
  are available in this personal copy. All changes stay in this game folder.
- The first board can be completed within its three-slide head start. This
  supplies a movement introduction before later boards combine pursuit and
  planning. Winning ends the chase before a threshold spawn.
- Hints describe an immediate spatial route. They do not establish human
  reaction time or promise that the route remains safe while someone waits.
- Eleven new rule tests were written first and failed against the reference
  because trace, enemy, time, and curriculum behavior were absent.

Checks: `python3 scripts/minigames.py check --owner demonrain7` passes.
`python3 scripts/minigames.py test --owner demonrain7` passes 19 tests.
The shared deterministic suite passes 43 tests under Python 3.12.15. The
repository's offline/headless setup check passes (no live model calls).

Browser checks observed: first-board completion in three moves; level 2
spawning at exactly two moves; capture while stationary after resume; pause
holding the enemy fixed; undo after capture restoring pre-spawn progress;
reset clearing moves and trail; hints reflecting current chase positions;
phone controls at a 390-pixel viewport with no horizontal overflow; both
guides preserving the move count; editor pause/custom play; canceling the editor after a long pause without
charging paused time; board export and
reload; rejection of an unreachable import while preserving the current
49-cell board; and a saved trace JSON containing difficulty and pause events.
The browser download event API timed out, but the file was saved successfully
and its JSON was inspected in Downloads.

## Playtest plan and possible outcomes

Ask Player A to play the curriculum using only the on-screen instructions.
Watch whether they plan before the enemy spawns, how they react to a shorter
head start, whether they anticipate the traced route, and whether they rush
into blocked directions or the enemy. Record level/order, prior familiarity,
hints, pauses, resets, captures, completion, and a revealing action or remark.
Ask what they were trying to do and whether pressure felt exciting or
frustrating. These are planned observations, not reported results.

Expected outcome supplied by the student: more tension and engagement. An
alternative is rushed guessing, frustration, or failure to learn sliding.
That alternative would challenge the prediction and support the student's
proposed slower enemy or later introduction. A familiar player's faster solve
may reflect practice. A tiny sample is exploratory.

## Playtest observations

TODO: Record actual anonymous human observations. No human playtest results
have been supplied for this variation. Automated checks establish game
behavior, not player feelings.

## Interpretation and revision (student writes)

TODO: Compare real observations with the prediction. The student's proposed
next decision is to slow the enemy or introduce it later if it interferes
with learning. Explain what to keep/change after the test.

## AI assistance and human decisions

The student chose real-time pursuit, trace following, curriculum spawn delays,
and the Combining Ideas connection, and supplied the prediction above. Codex
implemented and checked those choices, and proposed the initial speed values.
The student subsequently requested doubling all four enemy speeds.
TODO: Student records what they personally checked and any revised decision.
CourseWorks does not require a separate AI-use disclosure submission.

## Independent review

A separate read-only rules reviewer checked the personal copy and
independently ran all 18 game tests. Review found an editor-resume clock issue,
a manual-resume classification issue in trace metadata, and exposure of an
internal fractional timer in observations. Codex fixed all three. The reviewer
rechecked the changes and reported “No findings.” Human experience evidence
remains separate. The student and instructor retain approval decisions.

## Speed revision

At the student's request, enemy speeds were doubled from 1/1.5/2/2.5 to
2/3/4/5 tiles per second. Spawn delays remain 3/2/1/1 successful slides.
The updated curriculum assertion and new elapsed-time test failed before the
change. The latter checks that the chaser traverses two trail tiles during
each previous one-tile interval, including the doubled default speed.
The game UI, README, rule map, and PR description use the new values.
Human outcomes for the faster version remain untested.
Browser verification of the faster version observed level 2 displaying
3 tiles/second and capturing a stationary player along the recorded trail.
Independent review passed all 19 tests and found no implementation issues.
Browser recovery checks also passed for undo, reset, hints, and first-board
completion. At a 390-pixel viewport, controls worked and the fourth level
displayed 5 tiles/second with no horizontal overflow.
