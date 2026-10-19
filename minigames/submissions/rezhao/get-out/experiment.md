# Get Out experiment: rezhao

Principle: pyramid

## Prediction (student writes before building)

Student observation: “while playing, the puzzles werre pretty straightforwrd and wasn't challenging enough”.

Design decision: player pushes marked walls one cell.

Student prediction (recorded before implementation): “the user would have to think a bit more about how to move so that they dont end up blocking themselves from getting to the exit”.

Lens 58 connection: combining learned ideas (`pyramid` in the Designer’s guide):
combine sliding to a stopping point with repositioning a wall to create a route.
This is a classroom application, not a quotation from Schell.

TODO: Student names an observation that would challenge this prediction.

## Implementation

Changed engine.js (one-cell pushing and solver state), app.js (render changed walls,
undo and hints; trace includes pushes), index.html/style.css (instructions,
marked walls and editor tool), levels.js (three boards), tests/engine.test.cjs,
and local metadata/documentation. All changes are in this student's folder.

The player enters a pushed wall's old square and stops. Walls cannot enter the
exit, another wall, or leave the board. Up to three sliding walls are supported.
Solver searches board layouts as well as player positions; search-limit results
are explicitly unknown. The rule map records these implementation choices.

Checks: `python3 scripts/minigames.py check --owner rezhao` passed;
`python3 scripts/minigames.py test --owner rezhao`: 14 tests passed (12 engine + 2 UI-handler integration tests). New push
tests were run first and failed against the original engine. All three boards
are solvable; challenge boards require pushing and allow a bad push to remove
all routes. These are rule/reachability results, not human play observations.

Repository `.venv/bin/python -m unittest discover -s tests -v`: 43 passed.
System Python lacked anthropic; the existing project environment resolved it.
Offline/headless setup check with .venv passed Python, Git, Pyxel, tests, fixture;
it reported GitHub CLI authentication failed in the sandbox. GitHub identity
was independently verified with authorized network access earlier. Setup
verification remains partial; no live provider calls were made.

UI-handler integration checks passed for push rendering, undo, reset, hints, completion, board-code roundtrip, CRLF input, and preserving the game on rejected imports. These use a small document stub and do not verify visual layout or real browser input.

Browser checks: TODO. Browser automation rejected local file URLs under its
security policy; changed interactions, undo/reset, completion, editor/exchange,
hints, and narrow-screen controls have not been visually verified.

## Playtest observations

Planned test: give a new player the variation with only its on-screen
instructions. Watch whether they pause before a push, notice a blocked route,
and use undo/reset. Record which board, hints, resets, completion, and an action
or remark; then ask “What were you trying to do?” and “What changed your
understanding?” Human experience evidence is pending.

TODO: Confirm reference board design/exchange and observation of classmate play.
TODO: Record anonymous player labels, board, version and order played, hints
requested, restarts, completion, and one revealing action or remark. Separate
observations from interpretations. No names, emails, or other personal data.

## Interpretation and revision (student writes)

TODO: Compare the evidence with the prediction. Mention prior familiarity,
practice effects, sample size, or other limits. Describe the revision made or
one next test. A single player's response supports a question, not a general claim.

## AI assistance and human decisions (student writes)

TODO: State what Codex generated, what you checked, and one design decision you
retained or changed. Include any remaining known issues.

## Independent review

Independent read-only rules-reviewer subagent reviewed engine, app, tests,
levels, instructions and local evidence map. README and evidence-map findings
were resolved. A suspected exchange bug was withdrawn after evaluating the
actual source; exchange roundtrip is covered by an integration test.
Final reviewer result: “No findings.” All 14 variation tests passed.
Visual browser checks and human playtests remain pending. This is code review,
not human experience evidence or approval. Student/instructor retain approval.
