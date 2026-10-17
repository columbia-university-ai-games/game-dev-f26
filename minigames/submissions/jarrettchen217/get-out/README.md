# Student variation: One wall, one use

Branch: `jarrettchen217/get-out`. Open `index.html` to play nine built-in puzzles.

`F` is a cracked, one-use wall: a slide stops before it, then it becomes floor. An adjacent collision consumes it and counts as one action without displacement. The wall splits and fades after your slide reaches it; adjacent bumps respond immediately. Reduced-motion settings skip the effect. Undo restores the previous wall configuration; reset restores the original puzzle. You can paint F in the editor and exchange board codes containing F.

## Learn the rule: puzzles 1–5

| Puzzle | One-use walls | Idea |
| --- | --- | --- |
| 1 Stop, then pass | 1 | Stop once, then move through the vanished wall. |
| 2 A place to turn | 1 | Use the stopping point to align with the exit. |
| 3 Two walls, two stops | 2 | Each wall has its own single use. |
| 4 Stop, turn, continue | 2 | Combine a turn with a later stop and continuation. |
| 5 Three useful walls | 3 | Approach three walls from useful directions. |

Puzzles 1–3 and 5 have no reachable unsolvable state. Puzzle 4 introduces losing a stopping point after an unhelpful continuation (Right, Right), with Undo available for recovery. Puzzle 5 combines three walls in a forgiving layout. The intended shortest routes use 2, 2, 3, 4, and 8 actions respectively; this does not establish human difficulty.

Puzzles 6–9 retain their prior layouts for comparison. Puzzles 6–7 each use one F as both a stopping point and eventual floor. Puzzles 8–9 demonstrate wrong-side consumption that loses the route from the current position. See the study notes below (spoilers).

Rules and evidence: `docs/rule-source-map.md`. The solver searches both position and remaining walls. Board export and reset use the original layout; observations show the current layout. Large custom boards with many F walls can make solver search expensive.

The F rule is an original idea discussed with Codex and selected by the student, not attributed to the book. The following reference documentation describes the instructor game and its original boards, not this revised teaching sequence.

## Reference documentation

# Get Out! browser puzzle workshop

A classroom adaptation of Eric Zimmerman's **Get Out!**, exercise 11 in
*The Rules We Break* (printed pp. 90–97; game sheets pp. 185–189).
The interface and four teaching boards were created for this course.
The book's artwork, sample board, and prose are not bundled.

## Play

Open `minigames/get-out/index.html` directly in a browser. No installation,
build, account, API key, or runtime network connection is needed.

Alternatively, from the repository root:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000/minigames/get-out/>. For classroom phone access,
serve these static files through the course's approved hosting route.
A localhost URL belongs to the device running the server. Campus Wi-Fi may
prevent phones from reaching a laptop server. Hosting is not configured here.

- Move with arrow keys, WASD, swipe, or the on-screen direction buttons.
- Slide in one direction until a wall or the outside border stops you.
- Reach the exit to win, including when you encounter it during a slide.
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

`S` is the start, `E` the exit, `#` a wall, `F` a one-use wall, and `.` an empty square. Boards
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
undo and hint events, and final position. Coordinates in JSON are zero-based;
the visible trace uses one-based coordinates. Reset begins a new trace.

## Checks

From the repository root, with Node installed:

```sh
node --test minigames/get-out/tests/engine.test.cjs
```

The rules tests cover wall/border movement, blocked and invalid actions,
exit crossing, terminal behavior, shortest paths, unreachable exits, malformed
boards, detached observations, and the teaching boards' solvability.

Browser smoke check: finish the first board (down, right, down), undo, reset,
request a hint, edit a wall, play the custom board, export and reload its
code, reject an unsolvable code, and download a trace. Repeat movement with
phone controls and confirm the page fits the screen.

## Sources

- Eric Zimmerman, *The Rules We Break*, exercise 11, Get Out!, pp. 90–97.
- Author's printable game sheets: <https://theruleswebreak.com/gamesheets.html>.
- Course adaptation: original boards, browser interface, explicit border/exit
  rules, hints, undo, board exchange, and trace export.

## Puzzles 8 and 9: losing a foothold

Keep your foothold (8) and The wrong approach (9) are 7×7 puzzles with one F. Both start solvable and require consuming F from a useful approach. Consuming F from another approach removes a needed stopping point and leaves the current state unsolvable. The existing hint reports no route; Undo/Reset restores a solvable state. This is a consequence of the existing rule, not a new failure condition.

For study (spoilers): puzzle 8's initial Right makes the state unsolvable; puzzle 9's Right, Up, Down does so. Shortest winning paths have 7 and 9 moves respectively.
