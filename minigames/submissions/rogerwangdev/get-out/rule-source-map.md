# Variation rule map

| Rule | Evidence | Implementation | Acceptance |
| --- | --- | --- | --- |
| One optional B becomes a dynamic block. Slide stops before it; push it exactly one square if space beyond is inside board and not a wall. Player does not advance into its former square on that action. A push alone spends one move; fully blocked action changes nothing. Block may cover exit; underlying exit remains. | code: student requested pushable block on all four puzzles | engine.js:5 create, :27 step; app.js:35 renderBoard, :59 move | tests/block.test.cjs; new block tests failed before implementation |
| Solver keys player and block positions and respects remaining budget. Observations expose detached block coordinates. Undo restores player, block and budget; automatic exhaustion resets all. | code | engine.js:52 observe, :57 solve; app.js undo/move | tests/block.test.cjs, tests/app.test.cjs |
| Budget shortest solution + 2. Escape on final move wins. All four authored boards require a block push to solve. | code | engine.js:5 create; levels.js | tests/block.test.cjs, tests/budget.test.cjs |

No private observation or player file access added. No chaser remains. Authoring solvability tests provide no evidence of human experience.
