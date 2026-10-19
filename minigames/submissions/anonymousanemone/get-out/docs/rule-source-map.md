# Pushable block rule map

The root map describes the separate Garden Door starter. This map stays inside the student-owned Get Out copy.

| Rule | Evidence |
| --- | --- |
| B is a visible pushable block. On collision, push it through empty floor or the start to the next obstacle or edge, then stop directly behind it. An adjacent wall, block, exit or boundary refuses the push; otherwise it stops the block before that obstacle. | assumed: student requested pushable blocks; stopping behind the block and floor-only destination are implementation choices to verify with the student. Implementation: engine.js:27–42. Acceptance tests: tests/engine.test.cjs:44–62. The three new tests failed before implementation because B was rejected, then passed. |

Player boundary: observe exposes the visible board and legalActions uses the same step function; blocked pushes preserve state and move count. The separate course_game/player_interface.py is unaffected.

Student clarification: “the block should get pushed to the end.” Revised expectations failed against the one-square implementation, then passed after changing the engine.
