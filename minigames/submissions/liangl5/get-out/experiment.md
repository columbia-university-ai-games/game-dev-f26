# Get Out experiment: liangl5

Principle: perception

## Prediction (student writes before building)

One design change that I am implementing is a mechanic where the user can only through through a tile once and cannot backtrack any moves. I believe this change will make it so that players have to first intensely evaluate the board without any visual aids or brute force (although still could be done) before settling on a solution. This could also be dependent on a players skill so perhaps even if I view that a player moves immediately, it is possible they are incredibly skilled and can solve the problem in one glance or they are brute forcing and not thinking too much before attempting the puzzle.

## Implementation

Changed files (all in `minigames/submissions/liangl5/get-out/`):

- `engine.js`: state tracks a `visited` set (the start square counts from the
  first move). Sliding onto a visited square ends the run with `died: true`;
  dead states cannot move. `observe()` exposes `died` and `visited`. The solver
  searches position + visited set, so hints and the editor's solvability check
  respect the ice rule.
- `app.js`: paints used squares as ice, adds "cracked ice" to cell labels,
  records `died` in the trace, and restarts the board 1.2 s after a fall.
- `style.css`: `.cell.visited` ice styling.
- `levels.js`: boards 3 and 4 were unsolvable under the ice rule, so each
  gained one wall. "Change direction" adds a wall at row 5, column 3 (shortest
  route 8 moves, vs. 7 in the reference). "A useful detour" adds a wall at
  row 5, column 4 (7 moves).
- `tests/engine.test.cjs`: every teaching board must be solvable without
  falling; new tests cover falling through ice (including the start square)
  and the solver rejecting a board that only the reference rules can solve.

Rule change: re-entering any square you have already slid across ends the
attempt. The Undo button is removed, so every move is a commitment; reset
still starts over. Everything else (slide to wall/border, mid-slide exit,
hints) is unchanged.

Checks: `node --test minigames/submissions/liangl5/get-out/tests/engine.test.cjs`
→ 9 passed, 0 failed. `python scripts/minigames.py check --owner liangl5` → passed.

## Playtest observations

Player A played the thin-ice variation's teaching boards.

Observed:

- Time to first move rose sharply. Before touching a key, Player A stopped to
  map out the whole route as efficiently as possible.
- On some levels Player A showed frustration at first, and described solving
  them as very rewarding.

Not recorded: exact boards and order, hint requests, number of falls/restarts,
and timings. Player A's familiarity with the reference game was not noted.

Interpretation (designer's, not observed): the reward after solving came from
the difficulty increase.

## Interpretation and revision (student writes)

I think that the evidence generally backs up my investigation of whether this mechanic forces the player to think more about their moves before moving. But I did notice that most of the puzzles could be solved fairly quickly as it is difficult to ramp the difficulty up of this current set up. Perhaps a larger board or more difficult mechanics could increase the time to first move that a player must spend. 

## AI assistance and human decisions (student writes)

I used Claude in an iterative process to complete my variation of the minigame. I would specifically test the product (i.e. after a change play the game to see how it feels). At the beginning I had issues visually displaying that a tile was used but mechanically it worked as I envisioned (so multiple iterations were necessary here).

## Independent review

Reviewer: Claude Code (AI coding assistant), reviewing the full branch diff
against class `main` in the same session that added the manifest, report, and
level fixes. It is a code review, not a fully independent one, and not human
play evidence.

Issues found and resolution:

- Boards 3 and 4 had no ice-safe route (hints showed nothing). Fixed by adding
  one wall each; a test now requires every teaching board to be winnable.
- README claimed the start tile never becomes ice; the engine treats it as
  ice. README corrected to match the engine.
- After a fall, the 1.2 s restart timer was never cancelled. Undo, switching
  level, importing a board, or opening the editor during that delay was
  overwritten by the restart. Fixed: `load()` cancels the timer, undo and
  hints are disabled while fallen, and opening the editor restarts first.
  The trace now marks falls, and a downloaded trace reports `fell`.
- Checked, no change: the solver keys on position + visited set, so it stays
  correct; it solved random boards up to 20 × 20 in under 5 ms.

Design question raised: the Undo button still let players take back safe
moves, although the prediction describes a mechanic where you "cannot
backtrack any moves". Decision (student): remove Undo. Done in `index.html`,
`app.js`, and the README.

Checks repeated: engine tests 9/9 pass; `minigames.py check --owner liangl5
--ready` and the boundary check pass. The student checked the game in a
browser after the restart fix (fall/restart, hints, reset, editor, narrow
window) and found no problems. Undo was removed after that check.
