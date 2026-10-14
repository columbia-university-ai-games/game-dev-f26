# Chaser rule and source map

This variation's map stays in the student folder; the shared Garden Door map is unchanged.

| Rule | Evidence |
| --- | --- |
| One chaser starts on the farthest walk-reachable floor from S, excluding S and E; absent if there is no eligible floor. | code: `engine.js`:18,39 create/spawn; `tests/chaser.test.cjs` spawn/step tests |
| Each successful slide triggers one adjacent chaser step through floor; blocked/invalid actions do not change state. It favors shortest walking distance toward the stopping position, but every third turn takes an alternative when available. | code: `engine.js`:5,26,53 neighbors/chase/step; chaser tests for one step, third-turn wandering and refused actions |
| Catch is checked at the player's stopping position before and after the chaser step. Crossing E wins with priority; passing over the chaser during a slide is safe. | code: `engine.js`:53,74,78 step/solve/observe; `app.js` move, undo and reset; chaser tests. Design choice by assistant, not an observed human preference |
| Undo/reset restore chaser and turn phase. Hints search player, chaser and phase together, excluding caught states. | code: `engine.js`:53,74,78 step/observe/solve; `app.js`:82,83,84 undo/reset/hints; chaser tests. Design choice by assistant, not an observed human preference |
