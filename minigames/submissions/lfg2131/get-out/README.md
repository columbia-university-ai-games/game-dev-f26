# Get Out! — Think Before You Peek

A classroom adaptation of Eric Zimmerman's **Get Out!**, exercise 11 in
*The Rules We Break* (printed pp. 90–97; game sheets pp. 185–189).
The reference interface and four teaching boards were created for this course.
The book's artwork, sample board, and prose are not bundled.

This personal variation replaces immediate answer hints with **Think → Notice
→ Reveal**. It studies useful assistance that preserves discovery, applying
Schell's Chapter 14 / Lens 58 — The Puzzle. After informal feedback that the
original sequence was too easy to make hints useful to observe, this revision
replaces its four boards with **ten challenge puzzles**. The original sliding
rules, progressive hints, editor, and exchange tools are retained. See
[puzzle-design.md](puzzle-design.md) for the board structures and verification,
and [experiment.md](experiment.md) for actual feedback, predictions, technical
evidence, and remaining human work. Longer solutions are a design constraint,
not proof of human difficulty.

## Play

Open `minigames/submissions/lfg2131/get-out/index.html` directly in a browser. No installation,
build, account, API key, or runtime network connection is needed.

Alternatively, from the repository root:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000/minigames/submissions/lfg2131/get-out/>. For classroom phone access,
serve these static files through the course's approved hosting route.
A localhost URL belongs to the device running the server. Campus Wi-Fi may
prevent phones from reaching a laptop server. Hosting is not configured here.

- Move with arrow keys, WASD, swipe, or the on-screen direction buttons.
- Slide in one direction until a wall or the outside border stops you.
- Reach the exit to win, including when you encounter it during a slide.
- Blocked directions leave the board and move count unchanged.
- Undo reverses a successful move; reset starts a fresh attempt and trace.
- Hints are optional: **Think** asks a question; **Notice** identifies a relevant
  route feature without naming the next direction; **Reveal** explicitly gives
  the next move on a shortest route from your current position.
- Each request exposes one level. The UI shows the current level and next help
  available; Reveal disables further requests until a successful move or undo.
- A successful move or undo clears the hint progression, while a blocked move
  keeps it. The attempt's total request count survives moves and undo; reset or
  loading a board clears the count and begins a fresh trace.
- Hints never move the player or alter the board. An unreachable state receives
  honest recovery guidance; completion disables hints. Hint requests, including
  their levels and messages, appear in the trace.

The border and mid-slide exit conventions are explicit classroom rules.
This version covers the basic wall puzzle, without the book's advanced pieces.

## In-game workshop guides

Open **Designer’s guide** or **Codex starter guide** from Workshop companions
beside the board (below it on phones). The guides expand within the game and
preserve the current puzzle. They are bundled with each scaffolded copy and
work offline, including inside the generated gallery. External installation
links need an internet connection. During a browser check, open both guides
after making a move and confirm the move count stays unchanged; arrow keys
used while focusing the guide should not move the player.

The designer's guide offers ten Schell-inspired questions with experiments
and observations, plus a human-playtest checklist. The Codex guide follows
play, exchange, and one plain-language request. The skill discovers the GitHub
login and creates the branch and copy; Codex handles checks and the later draft
PR. Building requires the full class repository, not just a downloaded gallery.

In the course's third edition, Schell's puzzle chapter is 14, with Lens 58;
chapter 13 covers balance. Guide text is original classroom interpretation.

## Design and exchange

Choose **Design a puzzle**, select a wall, clear, start, or exit tool, and
click/tap cells. A fresh board is 7 × 7. The editor preserves your current
game until you choose **Check & play**; Cancel returns to it.

Check & play verifies a single start and exit and at least one solution.
It does not reveal the solution. **Exchange a board** exports a plain-text
code that a partner can paste and load:

```text
S..#...
...#...
.......
..##E..
#......
.....##
#....#.
```

`S` is the start, `E` the exit, `#` a wall, and `.` an empty square. Boards
must be rectangular, between 2 and 20 rows and columns, with exactly one
start and exit. Invalid or unsolvable imports preserve the current game.
Boards and progress are kept in memory only. Copy the board code before
closing or reloading the page.

## Classroom sequence

1. Solve a sample in pairs. Predict each stopping point.
2. Design a board and record a solution privately.
3. Exchange board codes with a neighboring pair. Observe without coaching.
4. Discuss: When did a wall become useful? Did proximity to the door mean
   progress? What created a moment of discovery?
5. Inspect the trace. Distinguish legal moves, reaching the goal, efficiency,
   and the human experience.

Hints and traces support discussion; they are not a graded leaderboard.
The board uses symbols as well as color, visible focus, keyboard and touch
controls, status announcements, and reduced-motion preferences. The spatial
puzzle has not been validated as a complete screen-reader-only experience.

## Rules API and future agent scaffold

`engine.js` is dependency-free and shared by the browser and Node:

```js
const game = require('./engine.js');
let state = game.create(['S..', '...', '..E']);
const observation = game.observe(state);
const actions = game.legalActions(state);
state = game.step(state, 'right');
```

- `create(board)` validates and creates an initial state.
- `observe(state)` returns a detached, fully visible board, player position,
  move count, terminal flag, and legal actions.
- `step(state, direction)` returns the resulting state without mutating the
  input. It rejects unknown directions. Terminal states cannot move.
- `solve(state)` returns a shortest direction sequence, `[]` for a won
  state, or `null` if the exit is unreachable. It searches stopping positions.

`solve` is the instructor reference and hint provider. A future model player
should receive only observations and submit actions through a bounded runner;
keep solver answers and development tools outside that player's access.
There is no model player or live model connection in this minigame yet.

Trace downloads contain the starting board, attempted directions, outcomes,
undo and hint events with their level and message, and final position. Coordinates in JSON are zero-based;
the visible trace uses one-based coordinates. Reset begins a new trace.

## Checks

From the repository root, with Node installed:

```sh
python3 scripts/minigames.py check --owner lfg2131
python3 scripts/minigames.py test --owner lfg2131
```

The rules tests cover wall/border movement, blocked and invalid actions,
exit crossing, terminal behavior, shortest paths, unreachable exits, malformed
boards, detached observations, and all ten challenge boards' solvability. Additional
tests check progressive hint truthfulness, agreement with the solver, and hint
state, counters, and trace behavior.

Browser smoke check: finish a challenge board without hints using a separately
verified solution, continue to the next level, undo, reset, then request Think,
Notice, and Reveal. Confirm the direct answer
matches the next legal solution move and the counter/trace records each request.
Move, undo, and reset to verify fresh clues and attempt totals. Edit a wall,
play the custom board, export and reload its code, reject an unsolvable code,
and download a trace. Repeat with keyboard and phone controls at a narrow
viewport; confirm reduced-motion and guide interactions preserve play state.
Executed results belong in [experiment.md](experiment.md), separate from this
checklist. The initial informal feedback is recorded; the revised sequence still
needs a fresh human playtest.

## Sources

- Eric Zimmerman, *The Rules We Break*, exercise 11, Get Out!, pp. 90–97.
- Author's printable game sheets: <https://theruleswebreak.com/gamesheets.html>.
- Course adaptation: original boards, browser interface, explicit border/exit
  rules, hints, undo, board exchange, and trace export.
