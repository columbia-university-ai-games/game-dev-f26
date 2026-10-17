# Sliding walls: rule and source map

The shared docs/rule-source-map.md covers Garden Door. This local map preserves the student-folder boundary.

| Rule | Evidence |
| --- | --- |
| Only M walls move; # walls remain fixed. Player slides stop at either kind. | code: engine.js:25; student clarification. |
| Bumping M gives it the impact heading; another bump replaces that heading even during motion. Player stops at the normal cell. | code: engine.js:29; explicit student request; tests/engine.test.cjs:54. |
| Player grid state updates immediately (visual easing takes 0.22 seconds); walls keep advancing independently one square every 900 ms. | code: app.js:7, engine.js:40; student requires walls substantially slower. Exact interval is assumed, pending play. |
| Borders, walls, exit, or player stop a moving wall. Occupied destinations block for the current tick; contested destinations stop all contenders. No pushing. | assumed: engine.js:49; tests/engine.test.cjs:82, tests/engine.test.cjs:87. |
| A bump changing heading counts once even without player displacement. A wholly blocked action changes nothing. | assumed: engine.js:37; baseline blocked-action test. |
| Undo restores pre-action positions and headings, then pauses. Reset clears motion. Hints pause; wait advances one tick and pauses. A direction resumes time. Hidden tabs pause. | code: app.js:89, app.js:91; tests/app.test.cjs:32. |
| Hints search position, walls and headings with wait transitions; search limit yields an explicit message, not a false unreachable claim. | code: engine.js:66; tests/engine.test.cjs:95. |
| Observation contains detached visible board, player position, wall headings and legal directions. Shared Python player interface is unchanged. | code: engine.js:62; tests/engine.test.cjs:75. |

Presentation only: app.js renderBoard preserves moving DOM elements; style.css retains the original .22s player easing and adds .9s linear wall transitions. Grid rules and clock cadence are unchanged.
