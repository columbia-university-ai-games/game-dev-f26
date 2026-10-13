# Get Out experiment: adit-prabhu

Principle: perception

## Prediction (student writes before building)

Change: walls break. The first hit cracks a wall (it turns red) and the second
hit destroys it. I predict this will make the game more fun and harder,
because breaking a wall can remove the only route to the exit, and then the
player has to reset. That makes each break a decision with a risk.

## Implementation

Rule change: walls are breakable. When a slide ends against a wall (or the
player pushes into an adjacent wall), the wall cracks and turns red. The next
collision with that cracked wall removes it, leaving open floor. The outer
edge of the board never breaks. A collision that cracks or breaks a wall
counts as a move, so undo restores the wall's previous state.

- `engine.js`: `step` records which wall was hit and returns a new board
  (`#` → `x` cracked → `.` cleared). The solver's visited-state key now
  includes the board, so hints account for walls already broken. Because that
  state space is much larger, the solver stops after 100,000 states with a
  "too complex" message instead of freezing the tab.
- `README.md`: rules and solver description updated.
- `app.js`: cracked walls render red; status text and the move trace report
  "cracked" and "broke" events.
- `style.css`, `index.html`: cracked-wall style, legend entry, and rule text.
- `tests/engine.test.cjs`: six new tests (crack then break, unbreakable
  edge, solver routes through walls, exit reached before a wall, pushing an
  adjacent wall is legal, solver cap).

Checks run by Claude Code (2026-10-12):
`python3 scripts/minigames.py check --owner adit-prabhu` (valid) and
`python3 scripts/minigames.py test --owner adit-prabhu` (13 pass, 0 fail).
Headless Chrome on puzzle 1: crack, break, slide, undo ×2, hint, reset, and a
solver-route win all behaved as specified; no console errors; no horizontal
scroll at 375px width. Board codes still use only `S E # .`.
Student checked the game on a real phone (2026-10-13) and reported it works.

Solver-measured effect on boards (shortest route, reference → variation):
teaching boards 1–3 unchanged (3, 5, 7); board 4 "A useful detour" 9 → 7.
A neighbor's exchanged board went from 13 → 6 moves by breaking the first
wall. Since almost any board with walls now has a route, "Check & play"
mainly rejects exits that no slide line can reach.

## Playtest observations

- Breakable walls seemed to make complex levels with the exit in the middle
  of the board much harder.
- When the exit was flush against the edge of the board, the game was easier,
  because the player could break all the walls in the way.
- Player A (one classmate) played all four built-in puzzles of this
  variation. They requested no hints, used resets, and finished every puzzle.

## Interpretation and revision (student writes)

_Drafted by Claude from the student's prediction and playtest notes, at the
student's request; student to review and edit._

The prediction was only partly supported. It was harder when the exit was in
the middle of the board. Out there, walls are the only places a slide can
stop, so breaking one can remove a stopping point the route needed, which is
the risk I predicted. When the exit was against the edge, the border (which
never breaks) still gives a reliable place to stop, so breaking walls just
clears a straight path. Breakable walls there removed difficulty instead of
adding it. So whether the change makes the game harder depends on where the
exit is, not on breaking alone.

Limits: this comes from a single player (Player A) who already knew the
original game and may have seen some boards before. It suggests a question
rather than a general claim.

Next revision: add a limit on breaks per board (for example, two, shown on
screen), so edge-exit boards can't be solved by smashing everything. Then
compare a mid-board exit and an edge exit with new players, to see whether the
limit makes the edge board challenging again without making the mid-board one
frustrating.

## AI assistance and human decisions (student writes)

I decided which idea to implement: breakable walls that crack red on the
first hit and break on the second. I used AI (Claude Code) to make the change
and to confirm it worked without breaking anything else, through tests, a
browser check, and a separate code review. I wrote this report myself, except
for the interpretation section above, which Claude drafted from my notes.
Remaining known issue: the cracked red is close to the player's colour, and I
haven't decided whether to change it.

## Independent review

Reviewer: a separate Claude Code review agent (code review only, 2026-10-12).
Issues found and resolution:
- Solver could exhaust memory on dense custom boards (12×12 at 60% walls took
  23 s / 3.8 GB). Fixed: parent-pointer paths and a 100,000-state cap with a
  clear message; a dense 20×20 board now stops in about 0.6 s.
- Status messages after cracking/breaking omitted the player's position and
  "smashed through" implied movement. Fixed wording; position appended.
- README described the old rules. Updated.
- Missing tests (exit before wall, adjacent-wall push, solver cap). Added.
- Not changed: cracked walls stay red as the student specified, although the
  reviewer noted red is close to the player's coral token. Kept for now;
  listed as a known issue above.

Checks repeated after fixes: `check` valid, `test` 13 pass / 0 fail, headless
Chrome walkthrough (crack, break, undo, hint, reset, win, 375px width) with no
console errors. Human play evidence is separate from this review. The student and instructor retain approval decisions.
