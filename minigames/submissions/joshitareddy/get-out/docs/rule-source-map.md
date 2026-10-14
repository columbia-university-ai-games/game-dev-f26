# Hidden breakable walls: rule and source map

This map covers the rule changed by this variation. The reference game's
movement, outcome, and editor rules remain documented in `README.md` and its
existing tests.

| Rule | Evidence |
| --- | --- |
| Standard and custom puzzle loads randomly select some existing wall cells as breakable and give each 1–3 hit points. They initially look and observe like ordinary walls. A collision reveals and removes one hit point; at zero the wall becomes floor. | `code`: `engine.js`, lines 50–68 and 70–93; `tests/engine.test.cjs`, lines 46–58 |
| Requesting a hint reveals the coordinates and remaining hits for every unbroken breakable wall. | `code`: `engine.js`, lines 98–114; `app.js`, lines 86–91; `tests/engine.test.cjs`, lines 60–65 |
| The solver searches position, wall layout, and remaining wall hits, so a route may include repeated wall-hit actions. Generation accepts only a solvable layout for a playable board. | `code`: `engine.js`, lines 46–68 and 115–133; `tests/engine.test.cjs`, lines 34–44 and 73–83 |
| Before winning, all four direction inputs are listed as legal so the action list cannot reveal whether an adjacent, visually identical wall is breakable. A collision with a solid wall still changes nothing. | `code`: `engine.js`, lines 95–106; `tests/engine.test.cjs`, lines 29–33 and 67–71 |
| Advanced levels designate hidden breakable cells and allowed 1–3 hit ranges. Their tests prove whether winning requires a wall to break, requires a stopping wall to remain, or requires both judgments, with increasing shortest solution lengths. | `code`: `levels.js`, lines 7–9; `engine.js`, lines 30–49; `tests/engine.test.cjs`, lines 85–132 |

## Acceptance trace

On `S##E / ....` with the first wall assigned three hits: `right` reveals two
hits remaining; a second `right` leaves one; a third breaks it; moving `right`
then stops beside the remaining solid wall. Hitting that solid wall changes
nothing. A hint requested before the first hit reveals the breakable wall and
its current hit count.

## Evidence status

These are original variation rules selected by the student, so their label is
`code`. Human experience claims remain untested until a peer playtest.
