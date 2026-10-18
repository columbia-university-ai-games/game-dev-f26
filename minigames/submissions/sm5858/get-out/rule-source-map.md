# Variation rule map

| Rule | Evidence | Implementation | Test |
| --- | --- | --- | --- |
| After each successful, non-escaping move, two walls chosen at random each move one square up/down/left/right; the rest stay. | observed: student's request after playing the two-colour version ("more intuitive; make the original walls move randomly"), then after playing v2 ("too many walls move; move only a few at a time") | engine.js drift (MOVING_WALLS = 2), step | tests/engine.test.cjs "exactly two walls move…" |
| Walls never land on the player, start, exit, or another wall. | assumed: keeps the player and goal visible and never trapped; pending human play | engine.js drift (options filter) | tests/engine.test.cjs "exactly two walls move…" |
| Every new layout keeps a route to the exit if walls froze; otherwise re-roll (20 tries), then keep walls. | assumed: implementation choice for confidence in solvability; pending human play | engine.js drift, solveStatic | tests/engine.test.cjs "a route to the exit always remains…" |
| Blocked moves and the escaping move do not move walls. | assumed: matches the reference rule that blocked moves cost nothing | engine.js step | tests/engine.test.cjs "blocked moves and escaping moves…" |
| Randomness is seeded in state; undo restores walls; hints search the actual drift (5,000 states or 200 ms, then the frozen-wall route shown as "Best guess"). Walls with no free neighbour are skipped when picking the two. Reset uses a new seed. | code; review finding (hint speed and accuracy on 20×20 boards) | engine.js random, drift, hint; app.js load, hint | tests/engine.test.cjs "the same seed…", "hints follow the actual drift…", "hint falls back…", "crowded boards still drift…" |
