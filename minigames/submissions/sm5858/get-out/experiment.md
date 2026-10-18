# Get Out experiment: sm5858

Principle: perception

## Prediction (student writes before building)

TODO: Describe one design change, the player behavior you predict, and what
observation would make you question that prediction.

## Implementation

Rule change: after every successful move that does not escape, two walls chosen at
random each move one square (up, down, left, or right); the other walls stay. Walls never cover the player, start,
exit, or each other, and every layout keeps a route to the exit. See `rule-source-map.md`.

Version history: v1 alternated red/blue walls each move. After playing it, the student
asked for something more intuitive and switched to v2, where every wall could drift after
each move. After playing v2 the student found that too many walls moved at once (about 10 of
12 per move) and confusing, so v3 moves only two random walls per move.

- `engine.js`: seeded random drift, fairness re-roll, `solveStatic`, and a hint solver
  that searches the actual future drift.
- `levels.js`: the four reference boards with new prompts.
- `app.js`, `index.html`, `style.css`: walls drawn as blocks that glide and glow when they
  move; status and trace report how many walls drifted; reset uses a new seed; trace JSON
  includes the seed and wall positions.
- `tests/engine.test.cjs`: nine new rule tests (the seven reference tests still pass).

Checks run: `python3 scripts/minigames.py check --owner sm5858` → valid;
`python3 scripts/minigames.py test --owner sm5858` → 16/16 pass.

## Playtest observations

Observed (designer self-play, Player A = the designer):

- v1 (red/blue alternating walls): Player A played it and said it should be
  "a bit more intuitive".
- v2 (every wall could drift each move; about 10 of 12 walls moved per move):
  Player A said "the walls move too much and it is confusing".
- v3 (two random walls move per move, with glow): Player A said "it is fine now".
  An unidentified player in the preview escaped v1 puzzle 4 in 8 moves.

TODO: Peer playtest of v3 (Player B, not yet run). Record board, hints, resets,
completion, and when Player B first noticed that walls move.

## Interpretation and revision (student writes)

TODO: Compare the evidence with the prediction. Mention prior familiarity,
practice effects, sample size, or other limits. Describe the revision made or
one next test. A single player's response supports a question, not a general claim.

## AI assistance and human decisions (student writes)

TODO: State what Codex generated, what you checked, and one design decision you
retained or changed. Include any remaining known issues.

## Independent review

Reviewer: a separate AI code-review agent with no edit access, run on the full folder diff.
Issues it found, all resolved:

- The glow did not replay when the same wall moved twice in a row. Fixed by restarting
  the animation and clearing old glows.
- Hints could freeze the page for over 1 s on 20×20 crowded boards. Fixed with a cap
  of 5,000 states or 200 ms; the worst case measured is now 200 ms.
- Capped hints could be wrong without saying so. They now return `exact: false` and
  are shown as a "Best guess".
- A boxed-in wall could cancel a whole drift attempt. Fixed: only walls that can move
  are picked.
- The README API text, manifest title, and legend were stale. Updated.
- The tests were weak. Added checks that two walls actually move, plus tests for
  0/1-wall boards, crowded boards, and the hint fallback.

Repeated checks: `check --owner sm5858` → valid; `test --owner sm5858` → 16/16 pass.
Browser: hints followed to completion, undo, reset, board import (solvable and
unsolvable), 375 px width with no horizontal scroll, and no console errors.
