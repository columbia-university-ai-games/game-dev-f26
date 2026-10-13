# Get Out experiment: adit-prabhu

Principle: perception

## Prediction (student writes before building)

TODO: Describe one design change, the player behavior you predict, and what
observation would make you question that prediction.

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

TODO: Record anonymous player labels, board, version and order played, hints
requested, restarts, completion, and one revealing action or remark. Separate
observations from interpretations. No names, emails, or other personal data.

## Interpretation and revision (student writes)

TODO: Compare the evidence with the prediction. Mention prior familiarity,
practice effects, sample size, or other limits. Describe the revision made or
one next test. A single player's response supports a question, not a general claim.

## AI assistance and human decisions (student writes)

TODO: State what Codex generated, what you checked, and one design decision you
retained or changed. Include any remaining known issues.

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
  reviewer noted red is close to the player's coral token. TODO (student):
  decide whether to keep red after playtesting.

Checks repeated after fixes: `check` valid, `test` 13 pass / 0 fail, headless
Chrome walkthrough (crack, break, undo, hint, reset, win, 375px width) with no
console errors. Human play evidence is separate from this review and is still
TODO above. The student and instructor retain approval decisions.
