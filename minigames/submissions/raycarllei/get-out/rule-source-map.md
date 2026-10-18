# Gradual challenge evidence

| Behavior | Evidence | Implementation and check |
| --- | --- | --- |
| Movement, walls, border, exit crossing, hint solver | code: copied instructor reference | `engine.js`, unchanged; `tests/engine.test.cjs` |
| Record the start and the destinations of successful moves, once each | assumed: design choice based on the progress exercise in `minigames/EXERCISES.md` | `notebook.js`; `tests/notebook.test.cjs` |
| Blocked moves and passed-through tiles add no stopping position | code: `engine.js` returns the same state on a blocked move; trace records final destination | `notebook.js`; first notebook test |
| Undo keeps exploration history; Reset/new board clears it | assumed: history describes experienced stops | `app.js` loads a fresh trace on reset/board change; notebook tests and browser checks |
| Optional overlay does not change moves, legal actions, board, hints or outcomes | code: notebook only reads copied coordinates and trace | unchanged engine; input-immutability and solver-completion test |
| Undo explains retained exploration history at the moment of use; a hidden notebook does not announce its count | assumed: contextual explanation of retained exploration history | `app.js` Undo handler and `index.html` notebook callout; desktop/phone browser regression |
| Seven teaching boards progress from 3 to 9 optimal moves, with three bridge boards and explicit lesson cues | assumed: sequence design responding to the student report of boredom versus getting stuck; tests measure route length and solvability | `levels.js`; progression and reachable-state tests in `tests/pacing.test.cjs` |
| Hints reveal a question, then a useful stopping point, then one legal move, only on request | assumed: graduated support based on the student's requested smoother transition and the hints exercise | `pacing.js`, `app.js`; hint tests and browser checks |
| Repeated blocked moves or revisits offer help without moving the player or changing the board | assumed: repeated actions trigger an optional offer of support | `pacing.js`, `app.js`; loop and blocked-attempt tests |
| Players may step back or skip ahead; changing boards clears hints, counts, and exploration history | assumed: explicit control lets players adjust challenge without performance-based locking | `app.js`; browser progression/reset/editor checks |

The notebook marks reached destinations from the move trace. Optional hint
support is handled separately by `pacing.js`.
