# Shifting Rows: scoped rule map

The shared docs/rule-source-map.md describes Garden Door, a separate game.
This map stays within the student folder to honor lab ownership.

| Rule | Evidence |
| --- | --- |
| After a successful slide, the bottom row becomes the top; all other rows move down. Each row retains all contents and column order. | Student request; `code`: engine.js:31–34; tests/engine.test.cjs:45–55. |
| Player travels with their row, wrapping from bottom to top. | `assumed` design interpretation of “only ... order of the rows”; implemented by engine.js:33; tested at tests/engine.test.cjs:45–55. |
| Blocked directions do not rotate or spend moves. | `assumed` interpretation of “move”; `code`: engine.js:30; tests/engine.test.cjs:11–14 and :54. |
| Crossing the exit wins before rotation; the winning move still rotates. Terminal actions do nothing. | `assumed` timing choice preserving crossing-exit victory; `code`: engine.js:20, :27, :34; tests/engine.test.cjs:15–19 and :56–59. |
| Hints search board order and position together. Observations show the current board; legal actions reflect successful slides only. | `code`: engine.js:36–60; tests/engine.test.cjs:20–25 and :31–38. |

Assumed design interpretations remain assumed until the student confirms them.
