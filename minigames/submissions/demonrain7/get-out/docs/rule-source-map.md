# Trace Chaser rule and source map

The chaser is an original design variation. `code` below establishes what the
implementation does; it does not claim a human experience result or book rule.
The shared starter map concerns The Garden Door, so this minigame keeps its
map inside the student's permitted folder.

| Rule | Evidence |
| --- | --- |
| Slides append each crossed tile chronologically. Blocked directions leave state unchanged. | code: `engine.js:36`, `engine.js:44`, `engine.js:47`; `tests/chaser.test.cjs` trace test |
| One enemy spawns at the origin after the configured successful-move threshold, unless already escaped. Boards use 3/2/1/1 moves. | code: `engine.js:48`, `levels.js` curriculum; spawn and winning tests |
| The enemy follows the trail one tile at a time at 2/3/4/5 tiles per second. Partial intervals accumulate. | code: `engine.js:54`, `levels.js`; corner-following and fractional-time tests |
| Sharing the enemy tile during a slide or enemy tick captures the player. Each elapsed tile is checked even in a long time update. | code: `engine.js:41`, `engine.js:61`; crossing and waiting-capture tests |
| Escape or capture is terminal; no further movement or time changes state. | code: `engine.js:31`, `engine.js:45`, `engine.js:56`; terminal tests |
| Undo restores the entire pre-slide state, including trail and partial enemy time. Reset creates a new state with original difficulty. | code: `app.js` undo/reset handlers, `engine.js:21`; browser undo/reset checks |
| Pause, guides, exchange, trace inspection, editor, and a hidden tab suspend time and player input. | code: `app.js` pauseReason/syncClock/move functions; browser pause and workshop checks |
| Hints find safe instantaneous routes from the current enemy tile and spawn state. They do not simulate human thinking time or waits. | code: `engine.js:80`, `app.js` hint handler; safe-route and terminal tests |
| Observations return detached board, player, trail, enemy, difficulty, legal actions, and outcomes. | code: `engine.js:71`; detached-observation test |

## Design choices requiring human evidence

- `assumed`: the chosen speed schedule creates a useful learning sequence.
- `assumed`: real-time pursuit increases engagement rather than frustration.
- `assumed`: the first board's safe head start prepares players for pursuit.

## Boundary

The pure engine owns game state. The browser supplies elapsed unpaused time.
`observe` exposes only visible puzzle/chaser information. A blocked direction
returns the same state and does not advance the spawn counter, though the
real-time clock continues separately. No model player, secrets, filesystem
access, or changes to the shared Python playing-agent interface are introduced.
