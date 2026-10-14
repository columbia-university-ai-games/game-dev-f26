# Get Out experiment: rogerwangdev

Principle: progress

## Prediction (student writes before building)

Student's stated prediction: "i would expect the player to be more strategic about their trials. if run-out of moves, the level is reset"

Student requested a decreasing move counter, then added: "introduce it, and make sure all 4 puzzles have this new thing, not just one puzzle", referring to a pushable block.

TODO (student): Predict how movable stopping points affect planning, and name an observation that would challenge your prediction.

## Implementation

This variation adds a move budget and one pushable B block to each of four new boards. Sliding into the block stops the player just before it and pushes it one square when space beyond is clear. An adjacent push also costs one move, even if the player stays still. Fully blocked inputs are free. Blocks can cover the exit without erasing it.

The budget is shortest block-aware solution + 2. Running out before reaching the exit automatically resets player, block and budget, clears undo and preserves the attempt trace. Final-move escape wins. Manual reset clears the trace. Undo restores player, block and budget. Hints search both positions within the remaining budget. B is supported in the editor and board codes.

All four boards require moving their block: substituting a fixed wall for B leaves no route. No neighbor board code was supplied. The final game contains no chaser.

Only minigames/submissions/rogerwangdev/get-out/ is submitted. Changed engine, app, UI, styles, levels and manifest; added local rule map and budget/block/app tests. The reference and shared tools remain instructor-owned.

## Automated validation (Codex)

- `python scripts/minigames.py check --owner rogerwangdev`: passed.
- `python scripts/minigames.py test --owner rogerwangdev`: all 16 tests passed.
- `node --check minigames/submissions/rogerwangdev/get-out/app.js`: passed.
- Budget tests and initial block tests were written first and failed on the earlier engine before implementation.
- Checks cover pushing, refused pushes, detached observations, block over exit, solver correctness, all four boards, countdown, exhaustion/reset, final-move win, undo, hints and app block markers.
- Browser connection failed with a tool configuration error. TODO: actual visual, keyboard/touch, editor/import, next-level and narrow-screen checks. Simulated DOM tests do not establish visual usability.
- Shared Python suite previously ran 35 tests with three environment errors (two Windows symlink privilege errors and missing anthropic). Offline diagnostics were incomplete for Pyxel/shared tests. No cloud calls were made.

## Playtest observations

TODO (student): Record anonymous player labels, board/version/order, hints, restarts, completion and one revealing action or remark. No human observations have been supplied.

## Interpretation and revision (student writes)

TODO (student): Compare observations with the prediction, explain limits and identify one next test or revision. Solver success is not player experience evidence.

## AI assistance and human decisions (student writes)

Codex implementation record: generated game rules, UI, boards, solver changes and automated tests in response to the student's decisions.

TODO (student): State what you checked and one design decision you retained or changed, in your own words.

## Independent review

A separate read-only rules reviewer checked final engine, app, levels, rule map, UI/styles and tests; all 16 tests passed and no findings remained. Browser layout was not assessed. Student and instructor retain approval decisions.

This PR remains a draft until the student report and manual play checks are complete.
