# Get Out experiment: jessicafu232

Principle: perception

## Prediction (student writes before building)

Requested change (student): add a "chaser" chasing us to the exit; every move we make, they also make a move, tending to follow us but not a beeline.

Prediction (student): "probably more careful planning; they need to make sure they don't get caught"

TODO (student): What observation would challenge this prediction?

## Implementation

Added one mechanic: a visible red C pursues after every successful slide. Two pursuit steps are followed by one wandering step, with deterministic ties so hints and replay stay consistent. C walks one floor cell and cannot cross walls. Capture at a stopping position ends play; exit wins first. Passing C mid-slide is safe. Spawn is the farthest reachable floor excluding S/E (absent when none exists). These exact details are assistant design choices for the requested tendency to follow.

Changed engine.js, app.js, index.html, style.css, README.md, submission.json; added tests/chaser.test.cjs and rule-source-map.md. Hints search the player, C and turn phase together. Undo/reset restore all chase state. Trace downloads include chase positions and capture.

Verification: new chaser tests failed before implementation (5/5), then all 14 game tests passed after independent review additions. Owner check passed. All four teaching boards have solver-verified safe routes. Browser tools reported no available browsers; visual movement, undo/reset UI, hint/completion UI and narrow-screen/touch controls remain TODO manual checks.

Required course checks were attempted: unittest ran 35 tests with 3 environment errors (Windows symlink privilege in two existing tests; missing anthropic dependency). Offline setup incomplete: Pyxel engine/dependencies and deterministic checks fail. No live calls or cloud credits used.

## Playtest observations

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

Independent read-only rules reviewer found two should-fix issues: copied README paths pointed at the instructor reference, and capture tests lacked landing on old C / passing C mid-slide cases. Updated personal paths and rules documentation, added those traces and wall/no-spawn checks. Repeated owner validation and all 14 game tests passed; app.js syntax passed. No blocking engine issue found. Browser and human experience checks remain TODO. Student and instructor retain approval decisions.

Reviewer recheck confirmed both initial findings resolved and requested the README test command include chaser tests; changed it to the owner-scoped scaffold test command that ran all 14 tests.

## Draft PR preparation checks (2026-10-12)

A fresh independent read-only review found no blocking engine/UI/test defect. Added precise undo/reset/hint source lines to the map and corrected the review summary test count from 12 to 14. Owner validation, all 14 game tests and app.js syntax check passed again. All candidate files are inside this student game folder; the branch has no unrelated commits. Human playtest observations, interpretation and student AI disclosure remain TODO, as requested.

## Chase maps and character update (2026-10-12)

Student requested new maps suited to the chaser and a red triangle with an angry face. Added three original maps after the four existing boards: Corner sprint introduces the unequal movement speeds; Ring road makes the choice of first corner matter; Close quarters has a six-slide escape route with a near encounter and wandering turns. Replaced the C marker with an inline SVG red triangle, angled angry eyebrows and a frown, and updated the legend/instructions. No movement or capture rule changed.

Owner check and all 15 game tests passed, including solver replay of all seven maps and an explicit Ring road safe-route/capture-route check; app.js syntax passed. New layouts were evaluated by deterministic solver traces; this does not establish human difficulty or enjoyment. Browser visual, narrow-screen and touch checks remain TODO; no human play observation is added.

Independent review of this update found stale C references in the instructions and a CSS comment. Replaced them with chaser/triangle wording. No blocking code finding; human and browser checks remain TODO.
