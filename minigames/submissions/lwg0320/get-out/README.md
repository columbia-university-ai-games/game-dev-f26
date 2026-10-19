# Get Out! · Ordered exits

A classroom adaptation of Eric Zimmerman's **Get Out!**, exercise 11 in
*The Rules We Break* (printed pp. 90–97; game sheets pp. 185–189).
The interface and original boards were created for this course. This student
variation replaces the single exit with numbered exits that must be reached in order.
The book's artwork, sample board, and prose are not bundled.

## Play

Open `minigames/submissions/lwg0320/get-out/index.html` directly in a browser. No installation,
build, account, API key, or runtime network connection is needed.

Alternatively, from the repository root:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000/minigames/submissions/lwg0320/get-out/>. For classroom phone access,
serve these static files through the course's approved hosting route.
A localhost URL belongs to the device running the server. Campus Wi-Fi may
prevent phones from reaching a laptop server. Hosting is not configured here.

- Move with arrow keys, WASD, swipe, or the on-screen direction buttons.
- Slide in one direction until a wall, the outside border, or a numbered exit stops you.
- Reach exits 1, 2, 3, and 4 in order to win. Touching any other number ends the run.
- Blocked directions leave the board and move count unchanged.
- Undo reverses a successful move; reset starts a fresh attempt and trace.
- Optional hints reveal the next move on a shortest route that visits the exits in order.
  Hint requests appear in the trace and completion message.

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

Choose **Design a puzzle**, select a wall, clear, start, or numbered exit tool, and
click/tap cells. A fresh board is 7 × 7. The editor preserves your current
game until you choose **Check & play**; Cancel returns to it.

Check & play verifies a single start, a complete set of numbered exits, and an
in-order solution.
It does not reveal the solution. **Exchange a board** exports a plain-text
code that a partner can paste and load:

```text
S.....1
.......
.......
4......
.......
.......
3.....2
```

`S` is the start, digits `1` through `N` are the numbered exits, `#` a wall,
and `.` an empty square. Boards must be rectangular, between 2 and 20 rows and
columns, with one start and each exit number from 1 through N exactly once.
Invalid or unsolvable imports preserve the current game.
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
let state = game.create(['S..1', '....', '4..2', '3...']);
const observation = game.observe(state);
const actions = game.legalActions(state);
state = game.step(state, 'right');
```

- `create(board)` validates and creates an initial state.
- `observe(state)` returns a detached, fully visible board, player position,
  move count, next required exit, terminal flags, and legal actions.
- `step(state, direction)` returns the resulting state without mutating the
  input. It rejects unknown directions. Terminal wins and out-of-order losses
  cannot move.
- `solve(state)` returns a shortest direction sequence, `[]` for a won
  state, or `null` if a complete in-order route is unreachable. It searches
  both stopping positions and sequence progress.

`solve` is the hint provider in this variation. A future model player
should receive only observations and submit actions through a bounded runner;
keep solver answers and development tools outside that player's access.
There is no model player or live model connection in this minigame yet.

Trace downloads contain the starting board, attempted directions, outcomes,
undo and hint events, and final position. Coordinates in JSON are zero-based;
the visible trace uses one-based coordinates. Reset begins a new trace.

## Checks

From the repository root, with Node installed:

```sh
node --test minigames/submissions/lwg0320/get-out/tests/engine.test.cjs
```

The rules tests cover ordered exit contacts, the `1234` win and `121`/`124`
losses, blocked and invalid actions, terminal behavior, shortest paths,
unreachable sequences, malformed boards, detached observations, and teaching
board solvability.

Browser smoke check: finish the first board (right, down, left, up), undo, reset,
request a hint, edit a wall and a numbered exit, play the custom board, export
and reload its code, reject an unsolvable code, and download a trace. Repeat
movement with phone controls and confirm the page fits the screen.

## Sources

- Eric Zimmerman, *The Rules We Break*, exercise 11, Get Out!, pp. 90–97.
- Author's printable game sheets: <https://theruleswebreak.com/gamesheets.html>.
- Course adaptation: original boards, browser interface, explicit border/exit
  rules, hints, undo, board exchange, and trace export.
