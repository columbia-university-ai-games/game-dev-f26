# Get Out experiment: lwg0320

Principle: sequence

## Prediction (student writes before building)

TODO: Describe one design change, the player behavior you predict, and what
observation would make you question that prediction.

## Implementation

The student copy adds numbered exits. Exit 1 must be touched first, then 2,
continuing through the last exit; touching any other number ends the run.
Correct and incorrect exit contacts stop the slide. The solver tracks both the
player's position and the next required number, so hints only suggest a route
that obeys the new rule. The editor and board-code exchange use digits for exits.

Changed files: `engine.js`, `levels.js`, `app.js`, `index.html`, `style.css`,
`README.md`, and `tests/engine.test.cjs`. `python3 scripts/minigames.py test
--owner lwg0320` passed all 8 rule tests; `python3 scripts/minigames.py check
--owner lwg0320` passed. In the browser preview, the `1 → 2 → 3 → 4` route won,
`1 → 2 → 1` lost, reset and undo worked, the hint suggested the first move, and
the numbered editor's new board passed Check & play. A narrow-viewport layout
check remains TODO.

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

TODO: Record reviewer role, issues found, tests or browser checks repeated,
and your resolution. A fresh Codex review can check code; human play supplies
experience evidence. The student and instructor retain approval decisions.
