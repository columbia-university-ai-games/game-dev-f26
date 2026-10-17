# Get Out experiment: rogerwangdev

Principle: progress

## Prediction (student writes before building)

Student's stated prediction: "i would expect the player to be more strategic about their trials. if run-out of moves, the level is reset"

Student requested a decreasing move counter, then added: "introduce it, and make sure all 4 puzzles have this new thing, not just one puzzle", referring to a pushable block.

The additional prediction below was developed after implementation; it is not a pre-build prediction or an observed result.

I expect movable stopping points to make players plan both where they will stop and where the block will be left for a later move. This prediction would be challenged if players keep repeating the same pushes after resets, or complete boards by following hints without being able to explain how the block helped.

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

## Design and playtesting

### Decisions

I chose a move budget to encourage planning before each trial, and pushable blocks so players can create useful stopping points. Each board allows the shortest solution plus two moves, leaving a small margin for experimentation. For the progress principle, progress means learning a route or preparing the block for a later move, rather than simply getting closer to the exit. A reset removes board progress, but players can carry their improved understanding into the next attempt.

### Possible outcomes

Players may plan more purposeful pushes after each reset, supporting my prediction of more strategic trials. Alternatively, repeated resets may interrupt exploration, suggesting the budget is too tight even when players understand the mechanic. If players only push the block out of the way without using it as a stopping point, the mechanic may need a clearer introduction. Completing a board alone would not show which kind of learning occurred.

### Playtest plan

Ask Player A to try all four boards in order, initially without hints, while observing without coaching. Record completion, hints, undo use, resets, and one revealing action or remark per board. Watch whether they predict stopping points and change their plan after failure, especially when applying the block idea on a later board. Afterward, ask what they were trying to do and what changed their understanding. No human playtest results have been recorded yet.

### Next decision

Keep the current rules if players understand the block and improve their plans across attempts. If resets interrupt useful exploration, test a budget of shortest solution plus four moves. If the block's purpose is unclear, test a simpler introductory board that makes its role as a stopping point easier to discover. Change one element at a time and compare the next playtest, looking for clearer explanations and fewer repeated mistakes; solver success alone does not establish player understanding.

## AI assistance and human decisions (student writes)

Codex implementation record: generated game rules, UI, boards, solver changes and automated tests in response to the student's decisions.

The student supplied the move-budget/reset idea, the expectation of more strategic trials, and the requirement to include a pushable block in all four puzzles. Codex inspected the engine, boards, and app and drafted the design explanation, possible outcomes, playtest plan, and conditional revisions above. Automated checks are listed separately; no student manual checks or human playtest results are claimed.

## Independent review

A separate read-only rules reviewer checked final engine, app, levels, rule map, UI/styles and tests; all 16 tests passed and no findings remained. Browser layout was not assessed. Student and instructor retain approval decisions.

This PR remains a draft until the student report and manual play checks are complete.
