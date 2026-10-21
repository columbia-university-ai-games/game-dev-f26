# Get Out! The Pursuit

A standalone, turn-based Get Out variation: slide through moving gates while
one hunter pursues you. Open `index.html` directly; no build, account, model,
API key or network connection is required.

## Play

- Arrow keys / WASD / on-screen arrows slide until the border or a wall.
  Touch / pen swipes also work; physical phone gestures remain unverified.
- Space, period, or Wait stays in place for one turn. No clock runs while you
  think. Blocked directions spend no turn and move no actors.
- One accepted turn: **player slide or Wait -> all gates -> hunter**.
- Gates move one rail cell, bounce at endpoints, and pause if their target
  contains you or the hunter. Other gates continue independently.
- The hunter walks exactly one cell along a shortest open path toward your
  final position, after the gates shift. Walls and gates block it. Equal paths
  break ties Up, Right, Down, Left. With no route, it stays put.
- Contact kills you, including crossing the hunter during a slide. A living
  player reaches the door immediately, before the gates or hunter act.
- Death freezes the board. Undo restores the whole previous turn, including
  hunter and every gate phase; Reset restores the initial board.

The solid H creature is the hunter. The dotted H is its **IF YOU WAIT** target,
computed after the gates move. Choosing a direction changes the pursuit.
A lethal Wait is marked in red, with text and an accessible warning.
A/B/C letters, arrows and dashed squares identify gate targets.

One hint starts a solver-verified safe escape from the current state. If none
exists, it says to Undo/reset. OPTIMAL is the shortest safe escape from the
starting board; it includes Wait and stays fixed during an attempt. You can
win without matching the target.

## Boards

The game starts in Pursuit. The selector also retains the previous wall-only
boards as Practice, using the same layouts for comparison.

| Pursuit | Gates | Shortest safe escape | Practice counterpart |
| --- | --- | --- | --- |
| Borrowed shelter | 2, horizontal and vertical | 11 turns | Cross traffic, 10 |
| Crossed signals | 3, both axes | 9 turns | Three-way timing, 9 |
| The last corridor | 3, both axes | 16 turns | Clockwork maze, 12 |

All initial boards are solvable. Each authored hunt route includes a gate held
by the hunter; without the moving gates, none of these layouts has an escape.
Path length alone is not a measurement of human difficulty or enjoyment.
Some later choices have no safe forward escape; Undo/reset remain available.

## Design and exchange

Design a puzzle edits around existing rails. Hunter places/moves the single
spawn; Clear on its cell removes it. A spawn needs empty floor, separate from
start, exit and initial gate cells. Clear board creates a new 7 x 7 board with
no rails or hunter. Check & play verifies a safe route before loading it.
Cancel restores the current attempt. New rails require editing a board code.

Exchange a board preserves initial terrain, all rails/phases, and the hunter.
Pursuit codes use `get-out-pursuit-v1`; previous `get-out-moving-walls-v1` JSON
and plain S/E/#/. boards remain supported. Rails must be straight, adjacent,
disjoint, 2-20 cells long; at most three rails and one hunter are supported.

Search admission includes both actor cells and every gate phase. With a
hunter, floorCells^2 * product(2 * railLength) must be <= 1,000,000. Without a
hunter, rows * columns * product(2 * railLength) must be <= 120,000. Larger
custom boards are rejected before searching; admitted custom boards can take
longer than the small built-in levels.

Inspect your move trace exports initial/final actors, all gate phases, every
move, capture cause, hints and Undo restorations. Pursuit traces use
`get-out-pursuit-trace-v1`. These are mechanical records, not evidence of a
player's intentions or feelings. No scores or play records are uploaded.

## Development and review

Pure rules: `engine.js`; boards: `levels.js`; UI: `app.js` / `index.html` /
`style.css`; exchange: `puzzle-code.js`. Tests run with the repository owner
command `python scripts/minigames.py test --owner weihao-zhou03`.
`rule-source-map.md` connects choices, implementation and tests.
`experiment.md` contains the concise PR reflection. `validation-notes.md`
records the supporting design, self-play and technical checks.

This is a classroom adaptation of Eric Zimmerman's Get Out!, exercise 11 in
The Rules We Break (pp. 90-97). The reference game and workshop guides remain
in the class repository; all variation changes stay in this student's folder.
