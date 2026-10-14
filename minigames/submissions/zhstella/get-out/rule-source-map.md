# Fog of War: rule and source map

The shared `docs/rule-source-map.md` describes The Garden Door, not Get Out.
This map stays inside the student's permitted submission folder.

| Rule | Evidence | Verification |
| --- | --- | --- |
| Show the player's clipped 3 × 3 neighborhood, including diagonals and walls; no line-of-sight occlusion | `code`: `fog.js:6` reveal, `fog.js:15` create. Radius and diagonal behavior are implementation defaults, not tested player preferences | `tests/fog.test.cjs`: starting visibility, interior wall and diagonal coverage |
| Reveal the neighborhood of every tile crossed on a successful slide; keep all discoveries | `code`: `fog.js:22` step | Intermediate-path coverage, immutability and persistent-memory tests |
| Undo reverses position and move count but keeps explored tiles; reset and new boards start fresh | `code`: `fog.js:37` undo, `fog.js:15` create; wired through `app.js` | Undo, reset, rectangular-board and post-win undo tests |
| Unknown tiles appear as `?` in the player observation; legal actions depend only on the visible neighboring cells | `code`: `fog.js:42` observe; `app.js` paintCell uses masked board values | Masked/detached observation test, browser cell labels |
| Sliding, collisions, move counts, crossing the exit and terminal states are unchanged | `code`: copied `engine.js` create/step/solve; copied engine tests | Parity tests across all reachable teaching-board positions |
| Optional hints use the full-map solver; editor, export and trace download may reveal the full board | `code`: `fog.js:51` solve; `app.js` editor/export/download; explicit notices in `index.html` | Hint non-mutation test and browser checks |

No model player is connected. The full board belongs to the local rules and
solver; a future partial-information player should receive `GetOutFog.observe`
only, not the underlying state, source files, solver or authoring tools.

Human engagement and frustration remain untested hypotheses, not code evidence.

## Test-first evidence

Before implementing `fog.js`, the original observation was compared against
`['S.????', '..????', '??????']` for a 3 × 6 board. It failed because the
original returned the complete map including the exit. The new fog test suite
was also run before the module existed and failed with MODULE_NOT_FOUND.
After implementation, all 16 owner tests pass (7 reference rules, 9 fog tests).
The initial `assumed` implementation rows were updated to `code` only after
the implementation and its corresponding tests existed. The defaults' effect
on human experience remains an assumption.
