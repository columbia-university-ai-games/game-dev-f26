# Get Out experiment: joshitareddy

Principle: perception

## Prediction (student writes before building)

Design intention supplied before building: hide which walls are breakable so a
player must hit walls to discover a route, with an optional exact-strength hint
when stuck.

TODO (student): Predict one behavior you expect to observe and one observation
that would make you question the design.

## Implementation

`engine.js` selects breakable walls, assigns 1–3 hits, keeps them hidden until
hit or revealed by a hint, and searches wall health as part of the solver state.
`levels.js` now has seven puzzles. The last three require breaking a wall,
preserving a wall as a stopping point, then combining both decisions. `app.js`,
`index.html`, and `style.css` present the interaction and exact remaining-hit
hints. `docs/rule-source-map.md` records the rules. `tests/engine.test.cjs`
covers discovery, damage, destruction, refusal, hints, level strategy, rising
solution lengths, and routes that require repeated hits.

Automated result: `python3 scripts/minigames.py test --owner joshitareddy`
passes (15 tests). The repository suite also passes 43 tests with
`uv run --frozen python -m unittest discover -s tests -v`, and the offline,
headless setup check passes. Browser smoke testing completed the combined final
level in 10 moves with one required wall destroyed and the stopping wall left
intact. Reveal hints, undo, reset, hidden-wall restoration, and terminal control
locking were also checked in Chrome.

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

Rules reviewer found that an unsolvable source board could exhaust generation
fallbacks and return the rejected random layout. The engine now rejects that
board instead, and the reviewer's exact two-wall case is a regression test.
Focused checks were repeated after the fix; the independent re-review reported
no remaining findings. Human play supplies separate experience evidence, and
the student and instructor retain approval decisions.
