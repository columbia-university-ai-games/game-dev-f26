# One-use wall rule map

Original student variation proposed by Codex and selected by the student; not a book-derived rule.

| Rule | Evidence |
| --- | --- |
| Ordinary walls and edges stop slides; reaching E during a slide wins. | code: engine.js:26 and engine.js:34; preserved reference rules |
| F is a one-use wall. A slide stops before F, then that wall becomes floor. An adjacent collision also consumes F and counts as one action, even without displacement. | code: engine.js:8, engine.js:27 and engine.js:37; tests/engine.test.cjs:45 and tests/engine.test.cjs:53 (failed before implementation) |
| Undo restores the previous board and position; reset restores the initial board. | code: app.js:92, app.js:113 and app.js:114 (history/load) |
| Observations show current walls; solver searches position plus remaining walls. | code: engine.js:42 and engine.js:47; tests/engine.test.cjs:61 and tests/engine.test.cjs:67 |

## Acceptance trace

Board: `S.F.E / #####`. Right stops at (0,1), consumes F, moves=1, not won; Right reaches (0,4), moves=2, won. The original state retains F, allowing Undo to restore it.

Boundary effect: a collision that consumes adjacent F is a legal state-changing action without displacement. observe includes remaining F; no hidden state or solver answer is added to observe. Solver keys include the board, not just position.

Test-first evidence: four new tests failed because create rejected F; all 11 engine tests passed after engine changes. The first experiment board was additionally checked as unsolvable with F replaced by either permanent wall or floor. No human playtest evidence is claimed.
