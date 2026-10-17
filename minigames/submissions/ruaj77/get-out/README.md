# Get Out! — Switch & Door

Principle: `perception` — A Change in Perspective. This is RuaJ77's personal
copy, with the approved switch/door engine now integrated into the browser UI.
The four original teaching levels and the engine remain unchanged. Level 5,
"The Door Is a Tool," now demonstrates the mechanic. You can also design or
import your own switch/door boards.
The interface keeps the reference layout, type, palette and controls.

`T` is a one-time switch; `D` is a door. Boards contain either neither symbol
or exactly one of each. `doorOpen` starts false. A closed door stops sliding
before its cell. Entering a switch opens the door immediately without stopping
the slide, including when the door lies ahead in that same slide. Subsequent
switch crossings keep it open.

Snapshots, board arrays, and position arrays are frozen. Undo's existing
history pattern restores a complete earlier snapshot, including moves and
`doorOpen`; Reset's existing `create(initialBoard)` pattern starts closed.
`observe` includes `doorOpen` in a detached observation. BFS searches from the
complete current state and visits `(row, column, doorOpen)` combinations, so
returning to an earlier position after activation remains searchable.

The design hypothesis, designer self-play and Player A observations are in
`experiment.md`; deterministic evidence is in `rule-source-map.md`.

## Level 5: The Door Is a Tool

The fifth board is the approved Candidate C: 7 × 7 with six walls and exactly one start, exit, switch
and door. Its instruction is: "Cross the switch to open the door. Think
carefully about your stopping points." The shortest solution is eleven moves;
no winning move sequence is documented here.

Run the exhaustive proof from the repository root:

```sh
node minigames/submissions/ruaj77/get-out/verify-level5.cjs
```

It uses the actual engine and explores all 33 reachable augmented states
(21 position/door states) and 65 successful transitions, including the initial
state and one winning state. The installed-level check also pins the exact
approved Candidate C layout and expected metrics; it uses no temporary study files.
Visited keys contain position, door state, a successful closed-door-stop flag,
and an open-door-traversal flag. All winning states require activation, a real
closed-door stop and entering the opened door. A blocked input and an exit
stop before an adjacent door never qualify. Undo/Reset are not forward edges.
The flags are verification history, not extra runtime game rules.

The board has no reachable losing dead ends, and no activation can occur
before the required stop. Alternative routes and loops are included in the
proof; one winning state does not mean only one winning move sequence.
These facts verify geometry, not human insight or satisfaction. See the
playtest plan and actual Player A observations in `experiment.md`.

This revision follows designer self-play of the previous seven-move board,
which the designer found relatively easy. The previous layout and the
designer's observation, decision and prediction are preserved in `experiment.md`.
Player A completed Candidate C without hints or resets and rated its difficulty
moderate, but recognized the closed door's strategic value only during post-game
reflection. This single-player evidence partially supports the prediction; it
does not establish a general improvement in discovery or difficulty.

## Switch and door in the browser

- A solid door marked `D×` is closed; a dashed doorway marked `D✓` is open.
  The floor switch is oval, marked `T○` when inactive and `T✓` when activated.
  Symbols, shapes, state labels and the legend supplement color.
- Entering the switch announces activation and opening. Undo restores the
  engine snapshot and refreshes all indicators; it mentions the door only if
  that state changed. Reset restores the closed door, inactive switch, initial
  position and empty history/trace.
- The existing Hint button calls the state-aware solver from the current
  snapshot. No extra hint mechanic or solution reveal is introduced.
- The editor has Switch (T) and Door (D) paint tools. Incomplete or duplicate
  pairs are rejected on Check & play or import, preserving the playable board.
  Editing previews the initial closed/inactive configuration, even if the
  current attempt is open; Cancel restores its current appearance.
- Board exchange exports the original board symbols, never an open-door game
  snapshot. Trace JSON separately records `doorOpenBefore`, `doorOpenAfter`,
  `switchActivated` on moves, door states/positions/counters on Undo, and final
  `doorOpen`. These are additive fields in the existing v1 trace format.

## Reference workshop retained below

A classroom adaptation of Eric Zimmerman's **Get Out!**, exercise 11 in
*The Rules We Break* (printed pp. 90–97; game sheets pp. 185–189).
The interface and four teaching boards were created for this course.
The book's artwork, sample board, and prose are not bundled.

## Play

Open `minigames/submissions/ruaj77/get-out/index.html` directly in a browser. No installation,
build, account, API key, or runtime network connection is needed.

Alternatively, from the repository root:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000/minigames/submissions/ruaj77/get-out/>. For classroom phone access,
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

`S` is the start, `E` the exit, `T` a switch, `D` its door, `#` a wall, and `.` an empty square. Boards
must be rectangular, between 2 and 20 rows and columns, with exactly one
start and exit, plus either no switch/door or exactly one of each.
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
let state = game.create(['S..', '...', '..E']);
const observation = game.observe(state);
const actions = game.legalActions(state);
state = game.step(state, 'right');
```

- `create(board)` validates and creates a frozen initial state with `doorOpen: false`.
- `observe(state)` returns a detached, fully visible board, player position,
  move count, terminal flag, door state, and legal actions.
- `step(state, direction)` returns the resulting state without mutating the
  input. It rejects unknown directions. Terminal states cannot move.
- `solve(state)` returns a shortest direction sequence, `[]` for a won
  state, or `null` if the exit is unreachable. It searches stopping positions
  together with door state.

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
python3 scripts/minigames.py check --owner ruaj77
python3 scripts/minigames.py test --owner ruaj77
node --test --test-isolation=none minigames/submissions/ruaj77/get-out/tests/*.test.cjs
```

The rules tests cover wall/border movement, blocked and invalid actions,
exit crossing, terminal behavior, shortest paths, unreachable exits, malformed
boards, detached observations, and the teaching boards' solvability. The new
switch/door suite covers pairing validation, collision, immediate activation,
same-slide passage, persistence, frozen snapshots, Undo/Reset engine patterns,
complete observations, state-aware shortest paths and unreachable exits.

The explicit isolation flag executes individual tests reliably in this cloud
session. The course commands above are also run unchanged.

Optional browser regression checks (requires Python Playwright and system or
bundled Chromium, only for development; the game has no new dependencies):

```sh
python3 -B -m unittest discover -s minigames/submissions/ruaj77/get-out/tests -p 'test_*browser.py' -v
```

All 23 Chromium browser tests passed (17 UI regressions plus six Level 5 checks).
All 48 Node tests passed (29 preserved engine tests plus 19 proof/level tests).
The browser tests exercise actual controls, rendering,
feedback, Undo/Reset, hints including unreachable states, editor pairing
validation, exchange, trace downloads, keyboard focus, a 375px viewport, and
simulated touch pointer events. Level 5 checks additionally exercise selector
and Next navigation, a complete engine-solved playthrough, required collisions,
activation/traversal, hints, Undo/Reset and 375px layout. Screenshots were
inspected for the new board as well as closed/open states and the narrow editor
layout. These checks are automated browser testing. Physical-device, manual
screen-reader and cross-browser checks remain unperformed. Player A's separate
human playtest is recorded in `experiment.md`. The reference checklist below
remains a useful broader manual check.

Browser smoke check: finish the first board (down, right, down), undo, reset,
request a hint, edit a wall, play the custom board, export and reload its
code, reject an unsolvable code, and download a trace. Repeat movement with
phone controls and confirm the page fits the screen.

## Sources

- Eric Zimmerman, *The Rules We Break*, exercise 11, Get Out!, pp. 90–97.
- Author's printable game sheets: <https://theruleswebreak.com/gamesheets.html>.
- Course adaptation: original boards, browser interface, explicit border/exit
  rules, hints, undo, board exchange, and trace export.
