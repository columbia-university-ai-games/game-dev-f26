# Get Out experiment: nc3244

Principle: progress

## Prediction (student writes before building)

TODO: Describe one design change, the player behavior you predict, and what
observation would make you question that prediction.

## Implementation

Student choice: mark visited points. The variation marks the starting point and each successful slide endpoint with a dot and floor tint, and shows a distinct-stop count. Crossed squares are not marked. Undo retains exploration; reset, level changes, and valid imported boards start fresh. Editor mode hides the markers; cancel restores them. Markers describe exploration, not distance to victory.

Changed app.js, index.html, and style.css. Movement rules and solver are unchanged. Validation: course submission check passed; all 7 engine tests passed; app.js syntax check passed. Manual browser checks remain pending: move, blocked move, undo, reset, hints, completion, editor cancel, import, and narrow-screen controls.

## Playtest observations

Creator self-play, visited-stopping-points variation: the student reported that marks helped avoid revisiting stops and made it easier to spot an unexplored route. Board, hints, resets, completion, and play order were not reported. This is a self-reported observation, not an independently observed classmate playtest.

Peer test plan (proposed): give Player A an unfamiliar board without coaching. Watch whether they use marked stops to avoid repeats and choose unexplored routes. Ask what informed their next move. Record repeats, hints, resets, completion, and a revealing action or remark. No peer observations yet.

## Interpretation and revision (student writes)

The student reports that markers helped distinguish explored stops from unexplored routes. This supports trying the design with another player; creator familiarity and one self-report limit the evidence.

Proposed next decision, pending student confirmation: keep the markers if another player uses them to plan exploration. If they mistake marked squares for progress toward the exit or avoid useful revisits, revise the explanation or marker presentation and test again. Movement rules are unchanged.

## Known limitations

A classmate playtest and student confirmation of the proposed test plan and next decision are pending. The original pre-build prediction was not supplied and must not be reconstructed as if recorded before implementation. Browser interaction checks are pending; automated rule checks do not establish player experience.

## Independent review

A separate Codex reviewer compared the variation with the reference and found no concrete code defects. Reviewed start/end-point marking, blocked moves, undo retention, reset/new-board clearing, and editor cancel preservation. Reviewer repeated course submission validation, all 7 engine tests, and app.js syntax checks successfully. Engine, solver, levels, and rule tests match the reference. Browser rendering and narrow-screen checks were not independently performed and remain pending. Student and instructor retain approval decisions.
