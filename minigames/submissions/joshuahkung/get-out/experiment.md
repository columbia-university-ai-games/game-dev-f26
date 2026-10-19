# Get Out experiment: joshuahkung

Principle: hints — Schell, *The Art of Game Design* (3rd ed.), Chapter 14 and
Lens 58, puzzle principle "Hints extend interest."

## Decisions

- **What changed:** the reference's one hint button gives the next move outright.
  My version replaces it with three levels at each position: (1) a question about
  unexplored stopping points, (2) a highlight on the wall or edge that stops the
  next slide on a shortest route, (3) the move itself. Each press goes one level
  deeper; any move, undo, or reset returns to level 1.
- **Why:** when we exchanged boards in class, my classmate sometimes needed a
  hint, because not every move is intuitive, and a hint helps the game keep
  progressing. But the reference hint names the move outright, which solves the
  step for the player. Schell's principle is that hints extend interest, so I
  want the smallest nudge that keeps someone moving. Level 2 points at the idea
  the game teaches (walls are stopping points) without giving the direction.
- **Rules:** movement, exit, and the solver are unchanged. The new `hint(state, level)`
  in `engine.js` derives every level from the existing shortest-path solver.

## Possible outcomes (predictions, not yet observed)

- **Expected:** stuck players request level 1 or 2, then find the next move
  themselves and can say why it works ("I need that wall to stop me").
- **Alternative A:** players click straight through to level 3. That would suggest
  the question is too vague to help, or that being stuck feels bad enough that
  players want the answer, not a nudge.
- **Alternative B:** level 2 works but players treat the highlight as the
  destination and slide past or into it wrongly. That would mean "stop against
  this wall" is not clear and the highlight needs a direction cue.

## Playtest plan

- Give Player A board 2 ("Take the long way"), which they have not solved.
  No coaching. Watch for: which hint level they stop at, whether they move right
  after a level-1 or level-2 hint, resets, and completion.
- After the board, ask "What were you trying to do?" and "What changed your
  understanding?" The trace records each hint level requested.
- Compare with a player on the reference version, using a different player or
  board to avoid a practice effect.

## Playtest observations

TODO: no playtest of this variation yet. Record actual behavior here, separately
from the predictions above.

## Next decision

- If players stop at level 1 or 2 and can explain the move: keep the three levels,
  and try making level 1 specific to the board.
- If players skip to level 3: make level 1 concrete (name a nearby wall) or cut
  it, so there are two levels.
- If the highlight is misread: add the direction of travel to level 2.

## Checks

- `python3 scripts/minigames.py test --owner joshuahkung`: 10 of 10 pass,
  including three new hint tests. Level 2 always matches the solver's next stop
  on all four boards, and unreachable exits say so at every level.
- `python3 scripts/minigames.py check --owner joshuahkung`: valid.
- Browser check, desktop and 390 px phone width: levels advance 1→2→3, the
  wall highlights on level 2, and a move resets to level 1. No horizontal
  scroll, no console errors.
- Known limit: level 1's question is the same on every board. Level 2 names the row and column for screen readers; the level-2 outline stays visible at level 3 by design.

## Independent review

A separate Claude review of the folder found two issues: the hint highlight could
appear on the wrong square while editing a board, and level 2 relied on a visual
highlight alone. Both are fixed: the highlight is suppressed in the editor, and
level 2 now names the row and column. Tests and the browser check were rerun
after the fixes.
