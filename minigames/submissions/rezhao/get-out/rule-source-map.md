# Sliding walls: rule and source map

The shared `docs/rule-source-map.md` describes The Garden Door; it has no Get Out
wall rule. This local map keeps the variation within the student folder.

| Rule | Evidence |
| --- | --- |
| Slide until a fixed wall or boundary; crossing E wins. Blocked moves spend no moves. | `code`: engine.js:19–41; tests/engine.test.cjs:5–24 |
| W is a marked movable wall. On contact, push it one cell in the movement direction if that cell is floor/start; enter its old square and stop. Cannot push onto E, another wall, or outside the board; no chain pushes. | `code`: engine.js:28–35; tests/engine.test.cjs:44–56. Student selected one-cell pushes; stop-on-push and destination restrictions are implementation design choices, not rules attributed to a book. |
| Solver must distinguish player position AND movable-wall positions. Undo/reset restore wall layout. | `code`: engine.js:50–64; app.js:57–65,80–81; tests/app.test.cjs:26–35. Solver tests pass; browser undo/reset verification remains TODO. |
| At most three W tiles can be imported/played. | `code`: engine.js:12; tests/engine.test.cjs:85–88. Implementation constraint to bound search. |
| Search returns undefined at 50,000 discovered states; hints say unknown and custom boards cannot pass validation on an unknown result. | `code`: engine.js:50–60; app.js:84,95–97; tests/engine.test.cjs:85–88. No claim of unsolvability on timeout. |

Player boundary: engine observe exposes the visible board and player position;
legalActions uses step. No file/model access is added.

## Review summary

The three new push tests failed before implementation because create rejected W.
They pass after implementation, including refused pushes. Original rule tests
also pass. State is immutable; the visible board includes all movable walls,
and legal actions are derived from step. No effect on the separate Python
player interface. Browser behavior remains unverified due to local URL policy.
