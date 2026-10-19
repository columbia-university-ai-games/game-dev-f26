# Misdelivered Stamp: rules and evidence

The stamp rules below are **assumed**: explicit designer choices supplied by the student, not claims about the source game. Ordinary sliding, walls, blocked actions and exit crossing remain the reference rules. Changes stay in the student copy.

| Rule | Evidence | Implementation | Check |
| --- | --- | --- | --- |
| Up to two reachable non-start/non-exit floor stops carry Stop/Turn/Detour author labels; exchange preserves labels and accepts legacy board text. | assumed: selected stamp design | stamps.js validate, parse, encode | validation, reachability, roundtrip tests |
| Only a normal slide ending on an unjudged stamp offers opening. Skip is free and revisiting offers it again. A guess is consumed once per stamp per round. | assumed | stamps.js move, open, skip, guess | stop/cross/skip/revisit and one-guess tests |
| An unmatched guess is recorded before preview. Recent three distinct normal stops, excluding the current position, form the uniform random destination pool; no pool falls back to start. Teleport and Undo add no normal stops. | assumed | stamps.js candidates, guess, deliver | candidate order/dedup, RNG boundaries, event-order tests |
| Preview locks movement, another guess, Undo, Reset and editing until confirmed. Teleport changes position only, increments misdeliveries, never wins or opens another stamp. | assumed | stamps.js guards, deliver; app.js controls | pending-lock, teleport/win/offer tests; browser |
| Undo restores one position change at a time: teleport first, then the preceding slide. It never restores a spent guess or deletes actual-stop/judgment history. | assumed | stamps.js undo | two-step undo and audit retention tests |
| Reset clears round moves/stamps/stop history, but keeps reset count and judgment audit; changing/importing/editing/reloading starts a new session. | assumed | stamps.js reset; app.js load | first/retry statistics and reset tests |
| Author highlights all possible incoming blocking faces; player highlights the actual incoming blocking face. Exit sightlines depend only on geometry, never on author label. | assumed | stamps.js geometry | label-independent geometry tests; browser |
| Sliding alone can win. Hints solve the current position without requiring optional guesses. Solver recognizes a winning return to an exit after a non-winning teleport onto it. | code: reference escape rule; assumed: teleport-only non-win | engine.js solve terminal check; stamps.js hint | inherited engine tests; exit-position solver regression |

The course Designer’s guide and `hints` exercise inform the question about supporting discovery with small interventions. These are an application of Schell Chapter 14/Lens 58, not a quotation. Matching an author label is never presented as proof of understanding.
