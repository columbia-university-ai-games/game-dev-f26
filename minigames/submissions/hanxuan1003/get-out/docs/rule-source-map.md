# Switchback rule map

This is an original student variation, not a claim about Zimmerman's printed rules.

| Rule | Evidence label | Evidence |
| --- | --- | --- |
| Entering T toggles phase immediately, once per entered switch cell; leaving T does not toggle. | code | engine.js: step; tests/switch.test.cjs: immediate toggle, re-entry and multiple switches |
| A blocks phase 0; B blocks phase 1. New games start in phase 0. Walls always block. | code | engine.js: isBlocked/create; tests/switch.test.cjs: closed B stopping point |
| A refused direction changes neither position, moves nor phase. | code | engine.js: step; tests/switch.test.cjs: blocked A/B |
| Crossing E wins immediately; won states cannot move. | code | engine.js: step; tests/engine.test.cjs and tests/switch.test.cjs |
| Solver distinguishes both position and phase. Hints use the same rules as play. | code | engine.js: solve; tests/switch.test.cjs: same position/different phases and executable route |
| Undo restores the previous full state, including phase; reset restores phase 0. | observed | app.js: move/undo/load; browser checks on tutorial and main board |
| Board codes preserve T/A/B and always start in phase 0; editor previews that initial state. | code | app.js: renderBoard/loadCustom/export; index.html: exchange instructions |
| Closed B can be a useful stopping point, not just an obstacle. | code | levels.js: second board; tests/switch.test.cjs: position [3,1] after first switch |
| Players will recognize the usefulness of closing a gate. | assumed | Design hypothesis remains unverified. Player A initially misunderstood T, then understood after instructions and experimentation; no specific closed-gate insight was reported. |

The initial three switch tests failed on the unmodified reference engine because T/A/B were unsupported, before implementation. Game state is deterministic. `observe` includes the visible gate phase and detached board/position copies; no model agent or credentials are part of the game.

Presentation update: app.js preserves the player node and interpolates each slide. Gate visuals change at the crossed switch cell; the engine and solver rules are unchanged. Browser observation confirmed intermediate coordinates, completed moves, undo and reset cancellation.
