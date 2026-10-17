# Variation rule map

| Rule | Evidence | Implementation | Test |
| --- | --- | --- | --- |
| The start square and every square the player slides over or stops on become cracked ice. | student's explicit choice: "every square slid over" | engine.js:20 fresh; engine.js:24 step | tests/thin-ice.test.cjs |
| Sliding onto or across a cracked square drops the player: the attempt restarts at the start with zero moves and only the start cracked. Falls are counted and the fall position is reported. | student request ("falls off the map and dies, triggering a state reset") | engine.js:33 step | tests/thin-ice.test.cjs |
| Walls, the border, and the exit stop slides as in the reference. Blocked moves change nothing. | reference rules | engine.js:24 step | tests/engine.test.cjs |
| Hints and Check & play search only safe routes (position plus cracked set) and never use a falling move. | code; follows from the fall rule | engine.js:54 solve | tests/thin-ice.test.cjs |
| Undo cannot reverse a fall; the browser clears undo history when the player falls. | design choice: a fall is a reset | app.js move | manual browser check |
| Teaching boards 3 and 4 replace the reference's boards 3 and 4, which have no thin-ice route. On the new boards the reference's shortest route falls. | solver search | levels.js | tests/thin-ice.test.cjs |
