# Get Out! hidden breakable walls

A classroom adaptation of Eric Zimmerman's **Get Out!**, exercise 11 in
*The Rules We Break* (printed pp. 90–97; game sheets pp. 185–189).
The interface and seven teaching boards were created for this course.
The book's artwork, sample board, and prose are not bundled.

## Play

Open `minigames/submissions/joshitareddy/get-out/index.html` directly in a browser. No installation,
build, account, API key, or runtime network connection is needed.

Alternatively, from the repository root:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000/minigames/submissions/joshitareddy/get-out/>. For classroom phone access,
serve these static files through the course's approved hosting route.
A localhost URL belongs to the device running the server. Campus Wi-Fi may
prevent phones from reaching a laptop server. Hosting is not configured here.

- Move with arrow keys, WASD, swipe, or the on-screen direction buttons.
- Slide in one direction until a wall or the outside border stops you.
- Each puzzle secretly makes up to one quarter of its walls breakable while
  keeping a valid route. A breakable wall needs a random 1–3 hits and looks
  ordinary until the first hit.
- Reach the exit to win, including when you encounter it during a slide.
- Hitting a breakable wall spends a move, reveals its remaining strength, and
  opens the cell when its strength reaches zero. Solid-wall hits change nothing.
- Undo reverses a successful move; reset starts a fresh attempt and trace.
- Optional hints reveal every unbroken breakable wall and its remaining hits.
  Hint requests appear in the trace and completion message.

The border and mid-slide exit conventions are explicit classroom rules.
This version covers the basic wall puzzle, without the book's advanced pieces.

## Increasing challenge

The first four boards introduce sliding and stopping with randomly selected
breakable walls. Three authored boards then add strategic constraints:

1. **Break through:** no route exists until the hidden wall is destroyed.
2. **Keep your footing:** a fragile wall must remain because it is the stopping
   point that makes the exit reachable.
3. **Choose what changes:** destroy one hidden wall while preserving another.

The shortest verified solutions increase from 4–6 actions, to 7 actions, to
8–10 actions as the random durability changes.

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

Check & play verifies a single start and exit and at least one solution for the
generated wall strengths, including any wall-breaking actions.
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

- `create(board)` validates the board, randomly selects up to one quarter of
  its wall cells as breakable, assigns each 1–3 hits, and keeps a solvable
  generated layout.
- `observe(state)` returns a detached, fully visible board, player position,
  move count, terminal flag, and legal actions.
- `step(state, direction)` returns the resulting state without mutating the
  input. It rejects unknown directions. Terminal states cannot move.
- `revealBreakables(state)` returns a state whose observation identifies every
  unbroken breakable wall and its remaining hits.
- `solve(state)` returns a shortest direction sequence, `[]` for a won state,
  or `null` if the exit is unreachable. It searches positions and wall health.

`solve` is the instructor reference and hint provider. A future model player
should receive only observations and submit actions through a bounded runner;
keep solver answers and development tools outside that player's access.
There is no model player or live model connection in this minigame yet.

Trace downloads contain the starting board, attempted directions, outcomes,
undo and hint events, and final position. Coordinates in JSON are zero-based;
the visible trace uses one-based coordinates. Reset begins a new trace.

## Checks

From the repository root, with Node installed:

```sh
node --test minigames/submissions/joshitareddy/get-out/tests/engine.test.cjs
```

The rules tests also cover hidden walls, randomized durability, reveal hints,
ordinary-wall refusals, and solutions that require repeated wall hits.

Browser smoke check: hit walls until one reveals, undo the hit, reset and check
that the same walls are hidden again, request a reveal hint, and finish a board.
Then edit a wall, play the custom board, export and reload its code, reject an
unsolvable code, and download a trace. Repeat movement with phone controls and
confirm the page fits the screen.

## Sources

- Eric Zimmerman, *The Rules We Break*, exercise 11, Get Out!, pp. 90–97.
- Author's printable game sheets: <https://theruleswebreak.com/gamesheets.html>.
- Course adaptation: original boards, browser interface, explicit border/exit
  rules, hints, undo, board exchange, and trace export.
