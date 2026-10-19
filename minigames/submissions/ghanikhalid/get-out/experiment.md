# Get Out experiment: ghanikhalid — Key Detour

Principle: sequence

## Prediction (student writes before building)

My prediction was that adding a key would make players more deliberate with
moves instead of repeatedly pushing toward the goal. This prediction is recorded
here retrospectively from my account; it was not documented in this file before
implementation.

The key creates a sequence: reach an intermediate objective, then solve the
route to the main objective. I expected players to plan in two stages and
reassess stopping points after collecting the key.

Repeated movement toward the goal without board assessment would challenge
that prediction. Repeated attempts to reverse or cross the sealed tile could
suggest unclear feedback or an arbitrary-feeling restriction. If players
understood the rules but immediately found the remaining route, the second
stage might be too obvious. Pausing alone would not establish planning: it
could also indicate confusion.

## Implementation

My variation adds a key micro-objective to each of the four levels:

- The exit blocks movement until the key is collected.
- Reaching the key stops the slide and unlocks the exit.
- The player cannot immediately reverse the collecting slide.
- After leaving the key tile, it becomes impassable.

In an earlier iteration without sealing, I observed players return to pushing
toward the goal after collecting the key. I chose to retain sealing and blocked
reversal so collecting the key changes the remaining route instead of acting
as an extra checkpoint.

All working files are in `minigames/submissions/ghanikhalid/get-out/`.
The engine owns state. The solver tracks position, key status and arrival
direction so hints follow the same rules as play. Legacy imported boards
without a key retain the original exit behavior. The editor supports one key.
The local `rule-source-map.md` records the variation without changing shared
instructor files or the Python playing-agent boundary.

Each supplied board has a solver-verified route with at least three moves after
key collection. This demonstrates a remaining route, not human difficulty.

## Playtest observations

Player A had played the original Get Out but had not previously played this
modified version. They played all four levels in the supplied sequence.

| Order | Board | Completion | Hints requested | Resets |
| --- | --- | --- | --- | --- |
| 1 | Find your feet | Completed | 0 | Reset to return to the start after recognizing the key as the first objective; exact count not recorded |
| 2 | Take the long way | Completed | 0 | 0 |
| 3 | Change direction | Completed | 0 | 0 |
| 4 | A useful detour | Completed | 0 | 0 |

In the earlier non-sealing iteration, I observed movement toward the goal
without apparent board assessment. I described this as “brute forcing,” meaning
repeated movement toward the goal rather than visibly considering the board.
This is my interpretation of the behavior, not a measured search strategy.

After sealing was added, I observed the player slow down and assess the board
after collecting the key instead of immediately retracing the approach and
rushing toward the exit. Timing, move-by-move records and exact quotations were
not collected. This observation was not attributed to a particular level.

## Interpretation and revision (student writes)

The observed pause and board assessment are consistent with my prediction that
sealing would encourage deliberate movement. Completing all four levels without
hints shows that this player could finish the variation. Neither observation
alone establishes enjoyment, understanding or a general improvement.

The first-level reset should not automatically be interpreted as frustration
or failure: the player used it to return to the start after recognizing the
key objective.

This was one player with prior Get Out experience. Sequential levels create
learning and practice effects. The earlier iteration was not a controlled
comparison, and detailed measurements were not collected. The evidence supports
further testing rather than a general claim about all players.

I would keep sealing and blocked reversal. For the next test, I would ask a new
player to play the first two levels using only the on-screen instructions,
without coaching. I would record prior familiarity, level order, hints, resets,
completion and one revealing action or remark. I would watch whether they:

- Recognize the key as the first objective.
- Reassess stopping points after collecting it.
- Understand why reversal and re-entry are blocked.
- Respond to blocked moves with a new plan or repeated confusion.

Afterward, I would ask: “What were you trying to do after collecting the key?”,
“What changed your understanding of the route?” and “Was any blocked move
unexpected?”

If players plan a new route and explain the restriction, I would retain it.
If they misunderstand it, I would improve instructions or visual feedback first.
If they understand it but find the second stage too easy, I would adjust one
board's key or wall placement, verify solvability and test again.

Multiple keys could help scale later levels, but I would first verify that one
key consistently creates the intended planning behavior. Additional keys would
require new rules, solver support and separate testing.

## AI assistance and human decisions (student writes)

Codex created the personal game scaffold, implemented the key mechanic and
interface, updated the solver, placed keys on the four levels, added regression
tests and ran automated checks. An independent Codex agent reviewed the
implementation. Codex helped organize this write-up from my supplied
observations.

I supplied the design goal, interpreted player behavior, tested the game on
desktop and chose to retain sealing and blocked reversal. My next decision is
to test whether the mechanic reliably encourages planning before expanding it
to multiple keys. I retain responsibility for design decisions and interpretation.

## Independent review

Independent review found a reverse-route loophole on level 3 and an editor
display bug. Both were corrected: immediate reversal after collection is
refused, and editor key/door visuals derive from the draft board instead of
the active game's collected status. Relevant checks were repeated and
independent re-review reported no remaining findings. The student and instructor
retain approval decisions.

## Checks and known limitations

- `python3 scripts/minigames.py check --owner ghanikhalid`: passed.
- `python3 scripts/minigames.py test --owner ghanikhalid`: all nine tests passed.
- `node --check minigames/submissions/ghanikhalid/get-out/app.js`: passed.
- Tests cover movement, refused actions, terminal behavior, invalid boards,
  detached observations, shortest paths, all four levels, locked exits, key
  collection, sealing and blocked reversal.
- Regression tests failed before the corresponding rule changes were implemented.
- Branch scope was checked against class main; only this student's game folder
  was included in the draft PR.

I tested the game on desktop and reported that the browser interactions appeared
to work. This was an informal check, not an individually logged checklist.
Phone/touch behavior and narrow-screen layout have not been verified. Codex's
earlier browser attempt was blocked by the tool's file-URL policy; my desktop
check is separately reported human evidence.

The earlier broader Python suite encountered two import errors for missing
`anthropic`. Offline setup diagnostics also reported incomplete Pyxel and
GitHub authentication checks; GitHub identity and write access were verified
separately. These incomplete diagnostics are not reported as passing checks.
No live model calls were made.

Automated tests support correctness and solvability. Human play supplies limited
experience evidence; no human result has been inferred from automated tests.
