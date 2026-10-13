# Get Out: Think Before You Push

Open this folder's `index.html` in a browser. No install or API key needed.

Use arrows, WASD, swipe, or direction buttons. Slide until a fixed wall or
boundary; crossing the exit wins. When you hit an orange ↔ wall, push it one
cell into empty floor (including the start square). You enter its old square
and stop. No chain pushes, no pushing onto the exit or past a boundary.
Blocked moves do not add to the counter. Undo restores the previous player
and wall positions; Reset restores the original board.

Three original variation boards introduce pushing, then combine pushing with
planning stopping points. The two challenge boards require a push and have
reachable dead ends; neither claim establishes human difficulty.

Design a puzzle includes a Sliding wall tool. Board codes use `W` for movable
walls and the reference `S`, `E`, `#`, `.` symbols. Up to three movable walls
are allowed. W codes require this variation; the reference cannot import them.
Copy your board code before closing the page. Exchange exports the starting
board, not the changed layout during play.

Hints search player and wall positions together. `solve(state)` returns a
shortest path, `[]` after winning, `null` for unreachable, or `undefined` when
the 50,000-state search limit is reached. Unknown results are not presented
as unsolvable and cannot pass Check & play. Trace v1 for this variation
records wall layouts after attempted moves and marks pushes.

Checks from repository root:

```sh
python3 scripts/minigames.py check --owner rezhao
python3 scripts/minigames.py test --owner rezhao
```

Manual checks still needed: push right on board 1, undo (wall returns), reset,
request a hint, push right then down (completion), edit/export/import a W board,
and try narrow-screen direction controls. Browser automation could not open
local file URLs under its security policy.

See `experiment.md` for the student's prediction and unfinished human evidence,
and `rule-source-map.md` for rule/test evidence. Based on the course Get Out
adaptation; these boards and the pushing mechanic are this student variation.
