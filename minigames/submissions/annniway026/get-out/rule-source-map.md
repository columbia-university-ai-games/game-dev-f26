# Variation rule evidence

This local map supplements the starter's Garden Door map; all variation edits stay in this submission.

| Rule | Evidence |
| --- | --- |
| An adjacent maximal wall block is jumpable only when it contains exactly one cell. Land immediately beyond it and stop; blocks of two or more walls or missing in-bounds landings return the original state and spend no move. | code: engine.js:24Ã¢â‚¬â€œ36; tests/wall-jump.test.cjs (user-specified design) |
| An open adjacent cell retains the original slide, stopping at a wall, boundary or exit. Landing on an exit wins; terminal states cannot move. | code: engine.js step; tests/engine.test.cjs |

No changes to the course_game player interface. The browser's observe, legalActions and solver continue to share the local engine.
