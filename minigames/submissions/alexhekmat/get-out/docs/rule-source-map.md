# Moving walls rule map

Kept inside the student folder because the shared map describes Garden Door and is instructor-owned.

| Rule | Evidence |
| --- | --- |
| `*` encodes a blocking moving wall; `#` stays fixed. Moving tiles show no star and directional movement changes their color: red at home, green one tile right. | code: `engine.js:5`, `engine.js:45`, `app.js:41`, `style.css` moving-wall rule; symbol/color requested by student |
| Before the ball slides on each directional attempt, stars alternate between their placed tile and its right neighbor, with no wrapping. Walls sharing a destination both wait. A destination must be floor in the pre-shift board and must not contain the player. S/E remain protected. A turn counts if either player or walls move. | assumed: implemented in `engine.js:36`; fixed-pair choice, collision and turn-count conventions are assistant-selected assumptions |
| Undo restores the whole state; reset restores the original board; hints search player and wall positions. Terminal and unknown actions cannot move walls. | code: `engine.js:23`, `engine.js:60`, `app.js` undo/reset handlers; tested by `tests/engine.test.cjs` and browser checks |

Search is bounded to 10,000 states. Exhausting the budget reports an unknown result, never an unsolvable board (`code`: engine.js solve; app.js hint handler).

Wall-before-ball ordering is requested by the student: the ball hits a wall at
its new position. Evidence: student clarification; regression in engine.test.cjs.

Color derives from each wall's actual position (`app.js` renderBoard). Undo
restores color with position; blocked walls keep their color. Red-left/green-right
is the implementation convention for the student's arrow-key color request.
All four boards contain multiple moving walls (code: levels.js).
