# Get Out! browser puzzle workshop

A classroom adaptation of Eric Zimmerman's **Get Out!**, exercise 11 in
*The Rules We Break* (printed pp. 90–97; game sheets pp. 185–189).
The interface and four teaching boards were created for this course.
The book's artwork, sample board, and prose are not bundled.

## Swap-sides variation

This copy changes one rule. When a slide misses the exit, the ball and the exit
trade places: the ball continues from where the exit was, and the exit waits
where the ball stopped. Moves therefore alternate between the start side and
the exit side. Crossing the exit mid-slide still wins, without a swap. Blocked
moves change nothing. The solver searches ball and exit positions together, so
hints and **Check & play** follow the swap rule. Input pauses for a quarter
second while a swap is shown, and holding a key does not repeat moves.

Three details were chosen while implementing the student's idea: a winning
slide does not swap, a blocked move does not swap, and the ball always jumps
to the exit's previous square.

The swap rule comes from rajvardhan19's variation (class PR #12), co-developed
with rohitr4547, and is unchanged here.

## Moving roadblock addition

This copy adds a **no-entry roadblock**, drawn as a red no-entry traffic sign.
It is on the board from the first move, and it stops a slide exactly like a
wall. **After every move that misses the exit, it jumps to a new square**, so
the route you just planned is closed again. The swap rule above is unchanged.

Where it goes: from the new ball and exit positions, the game finds the
shortest way out as if there were no roadblock. It collects the floor squares
the ball would slide across on that route and orders them with a seeded
shuffle. It picks the first square that breaks that route, then any route
square, then any other floor square. It never picks the ball's square, the
exit's square, the start square, or a wall. It never stays on the square it
just left, unless no other free square exists; then it stays rather than
vanishing. A blocked move does not move it, and a winning move ends the game.

Why it is seeded: the choice depends only on the puzzle's seed, the ball, the
exit, and the square it just left. To the player it looks random, but the game
is still a fixed puzzle, so the solver can plan around it. The game only uses
seeds whose sequence still leaves a way out (`solvableSeed`).

- Each teaching board has a fixed seed, so every player sees the same
  sequence. Reset replays that sequence; Undo restores the previous square.
- **New roadblock** switches to a random seed that leaves a way out and starts
  the roadblock on a different square.
- Custom and imported boards get a random seed. Board codes describe only
  walls, start, and exit; the game always places the roadblock. If no seed
  leaves a way out, the board plays without a roadblock and says so.
- The status line says where the roadblock jumped and whether it stopped your
  slide. The trace records its square after each move.

## Play

Start a local server and open the game in your browser, from the repository
root:

```sh
python3 minigames/submissions/rohitr4547/get-out/serve.py
```

It serves only this folder on <http://127.0.0.1:8000/> (or the next free port),
opens your browser, and stops with Ctrl+C. Use `--port 9000` to pick a port or
`--no-open` to skip opening the browser. It needs only Python 3.

You can also open `minigames/submissions/rohitr4547/get-out/index.html`
directly in a browser. No installation, build, account, API key, or runtime
network connection is needed. For classroom phone access,
serve these static files through the course's approved hosting route.
A localhost URL belongs to the device running the server. Campus Wi-Fi may
prevent phones from reaching a laptop server. Hosting is not configured here.

- Move with arrow keys, WASD, swipe, or the on-screen direction buttons.
- Slide in one direction until a wall or the outside border stops you.
- Reach the exit to win, including when you encounter it during a slide.
- Missing the exit swaps the ball and the exit (see above).
- The no-entry roadblock stops you like a wall and jumps after every move (see above).
- Blocked directions leave the board and move count unchanged.
- Undo reverses a successful move; reset starts a fresh attempt and trace.
- Optional hints reveal the next move on a shortest route from your position.
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

Choose **Design a puzzle**, select a wall, clear, start, or exit tool, and
click/tap cells. The game adds the moving roadblock when you play. A fresh
board is 7 × 7. The editor preserves your current game
until you choose **Check & play**; Cancel returns to it.

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

`S` is the start, `E` the exit, `#` a wall, and `.` an empty square. The
roadblock is not part of the code; it gets a random seed when played. Boards
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
  current exit position, move count, terminal flag, and legal actions. The
  board's `E` follows the moving exit; `S` marks the starting square.
- `step(state, direction)` returns the resulting state without mutating the
  input. It rejects unknown directions. Terminal states cannot move.
- `solve(state)` returns a shortest direction sequence, `[]` for a won
  state, or `null` if the exit is unreachable. It searches ball, exit, and
  roadblock positions together, so hints account for the jumps.
- `create(board, seed)` adds the moving roadblock when `seed` is a whole
  number; with no seed (`null`) the game is the plain swap version.
- `solveWithin(state, limit)` is `solve` with a cap on positions examined; it
  returns `{path, complete}`, where `complete` is false if it stopped early.
  Hints use it so a large board cannot freeze the page.
- `solvableSeed(board, first, tries = 12)` returns the first seed from
  `first` whose roadblock sequence leaves a way out, or `null`.
- `observe` also reports `roadblock` (its square or `null`), and the board
  shows it as `X`.

`solve` is the instructor reference and hint provider. A future model player
should receive only observations and submit actions through a bounded runner;
keep solver answers and development tools outside that player's access.
There is no model player or live model connection in this minigame yet.

Trace downloads (`get-out-moving-roadblock-trace-v1`) contain the starting
board, the `seed`, attempted directions, outcomes, undo and hint events, and
final ball, exit, and `roadblock` positions. Each move event has `exit`,
`block` (the roadblock's square after the move), `swapped`, and `roadblock`
(true when the roadblock stopped the slide or blocked the move). After a swap, `to` is
where the ball landed (the old exit) and `exit` is where the slide stopped.
Coordinates in JSON are zero-based;
the visible trace uses one-based coordinates. Reset begins a new trace.

## Checks

From the repository root, with Node installed:

```sh
node --test minigames/submissions/rohitr4547/get-out/tests/engine.test.cjs
```

The rules tests cover wall/border movement, the swap and a move from the exit
side, blocked and invalid actions before and after a swap, crossing the old
exit square, exit crossing, terminal behavior, swap-aware shortest paths,
unreachable exits, malformed boards, detached observations that follow the
exit, and the teaching boards' solvability. Roadblock tests cover a slide
stopped by the roadblock (and the swap that follows), a move into it being
blocked without moving it, the roadblock moving to a new free square after
every move on all teaching boards, the first roadblock breaking the shortest
route, different seeds giving different squares, staying put when no other
square is free, boards no seed can solve, the search budget, the solver
planning around the jumps, observations, and rejection of `X` in board codes.

Browser smoke check (run with `serve.py`): confirm the roadblock appears,
make a move and see it jump, finish the first board by following hints, undo
(roadblock returns), reset (same sequence), New roadblock,
request a hint, edit a wall, play the custom board, export and reload its
code, reject an unsolvable code, and download a trace. Repeat movement with
phone controls and confirm the page fits the screen.

## Sources

- Eric Zimmerman, *The Rules We Break*, exercise 11, Get Out!, pp. 90–97.
- Author's printable game sheets: <https://theruleswebreak.com/gamesheets.html>.
- Course adaptation: original boards, browser interface, explicit border/exit
  rules, hints, undo, board exchange, and trace export.
