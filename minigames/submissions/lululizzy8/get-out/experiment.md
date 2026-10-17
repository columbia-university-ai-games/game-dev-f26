# Get Out experiment: lululizzy8

Principle: perception

## Prediction (student writes before building)

TODO: Describe one design change, the player behavior you predict, and what
observation would make you question that prediction.

## Implementation

**Thin ice.** The start square and every square the player slides over crack.
Sliding onto or across a cracked square drops the player through the ice: the
attempt restarts at the start (moves back to 0, falls +1, undo history cleared).
See `rule-source-map.md` for the rule-by-rule mapping.

- `engine.js`: state now carries `start`, `cracked`, `falls`, `fell`; `step`
  applies the fall rule; `observe` exposes cracked squares and falls; `solve`
  searches safe routes over (position, cracked set) with a size limit.
- `app.js`, `index.html`, `style.css`: cracked squares are drawn and labeled
  for screen readers, a FALLS counter, fall announcement and trace entry,
  a "stranded" message when every direction would fall, and thin-ice hint and
  Check & play messages.
- `levels.js`: boards 1–2 unchanged (thin ice does not affect their solutions,
  so they introduce sliding first). Boards 3–4 replaced: the reference boards
  had no thin-ice route. On the new boards the reference's 4-move shortest
  route falls through; the safe route is 8 moves.
- `tests/thin-ice.test.cjs`: 8 new tests, written before the engine change
  and confirmed failing first.

Checks run: `python scripts/minigames.py check --owner lululizzy8` (valid) and
`python scripts/minigames.py test --owner lululizzy8` (15 passed, 0 failed).
Browser check pending: TODO play all four boards, fall/reset, undo, hint,
editor Check & play, board exchange, narrow-screen controls.

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
