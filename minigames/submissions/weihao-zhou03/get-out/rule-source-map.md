# The Pursuit: rule and source map

Scope: this student's browser minigame. Shared Python rules, tools and the
reference game are not modified. The student chose moving blocks, one step
per player action, multiple directions/obstacles, then one pursuing monster.
Detailed pursuit/hold/preview choices are local design proposals, not facts
from Schell or human play evidence.

`code` below labels implemented mechanical behavior established by tests.
It does not establish fairness, difficulty, comprehension or enjoyment.

| Rule | Implemented evidence |
| --- | --- |
| Slide until a fixed/moving wall or border. Live exit wins mid-slide. Contact with the hunter during a slide kills immediately before later phases. | `code`: `engine.js:96` step; static rules and pursuit slide-contact/live-exit tests. |
| One accepted slide/Wait advances every gate, then one hunter step. A blocked or invalid input changes nothing; Wait exists with gates or a hunter, but not on entirely static boards. | `code`: `engine.js:96`, `engine.js:121`; refused input, static compatibility and gate-before-pursuit tests. |
| Each gate bounces at rail ends and pauses if its target contains either actor. Other gates continue; gates cannot crush either actor. | `code`: `engine.js:68` advanceWall; both-actor holds, independent gates, reachable-state separation tests. |
| One hunter walks one cell along a shortest open path to the player's final position. Fixed/moving walls block it; ties are Up, Right, Down, Left; no path means staying. | `code`: `engine.js:79` chase; shortest-step/tie and closing-passage tests. |
| Pursuit reaching the player loses. Won/lost states freeze and have no legal actions. Undo/reset restore both actors and all gate phases. | `code`: `engine.js:96`, `app.js:188`, `app.js:189`; capture/terminal tests and browser loss lifecycle checks. |
| Observations detach all actor/gate data. H preview is the exact result IF YOU WAIT, after gate movement; it warns when that Wait kills. Movement can change the pursuit route. | `code`: `engine.js:127`, `app.js:41`, `app.js:94`; detached observation, Wait agreement, lethal-Wait tests and browser warning checks. |
| Exact safe solving keys player cell, each gate index/direction, and hunter cell; captured states are excluded. Initial OPTIMAL is fixed during an attempt and includes Wait. | `code`: `engine.js:140`, `engine.js:143`, `app.js:34`, `app.js:159`; safe-detour, distinct hunter-phase, acceptance and browser target tests. |
| Rails are disjoint, straight and contiguous, 2-20 cells, at most three. Initial actors cannot overlap; the monster starts on floor away from S/E and current gates. | `code`: `engine.js:6`; invalid rails, spawns, overlap and reachable-separation tests. |
| Search admission: with a hunter, floorCells^2 * product(2 * railLength) <= 1,000,000; without one, rows * columns * product(2 * railLength) <= 120,000. Reject larger inputs before searching. | `code`: `engine.js:64`; large-phase refusal tests. |
| Exchange preserves the initial monster and all rail phases; old wall-only/plain codes still load. Pursuit trace includes initial/final hunter, capture cause, every gate and Undo restoration. | `code`: `puzzle-code.js:5`, `puzzle-code.js:9`, `app.js:214`; exchange tests and actual browser trace download. |
| Hunter painting moves one spawn; Clear on it removes it; Cancel preserves the active attempt. Custom load verifies safe solvability before replacing the current game. | `code`: `app.js:109`, `app.js:201`; browser editor, cancel, custom reset and invalid-import checks. |

The earlier map had no pursuit rule. Proposed rows were added before the
engine change and labeled assumed design choices. Ten tests in
`tests/pursuit.test.cjs` then failed because the hunter was absent (undefined
actor/loss/preview data, no capture, no validation). Those tests pass after
implementation. The new `code` evidence is mechanical. The author subsequently
reported greater perceived difficulty, more careful planning and less room
for error in the hunter version; see `experiment.md`. Whether the extra
pressure is satisfying and how another player responds remain open questions.

Current tests: 43 across `tests/engine.test.cjs`,
`tests/moving-walls.test.cjs`, `tests/multiple-walls.test.cjs`, and
`tests/pursuit.test.cjs`. The latter also tests three safe acceptance routes
and reachable small-puzzle invariants. Earlier single/multi-wall regressions
remain, including a concrete wall-only forward dead end.

Three hunts reuse the earlier layouts: 2/3/3 moving gates, 8/15/16 fixed walls,
shortest safe escapes 11/9/16. Every acceptance route includes a hunter-held
gate; the final route uses all three moving gates as brakes. Their Practice
counterparts retain 10/9/12. No layout has a route if all moving gates are
removed. These are tested mechanical facts, not human difficulty rankings.

The playing-agent boundary remains the pure exported create/step/observe/
legalActions/solve API. No model, credentials, file access or hidden world
object is added to the player. Observation contains only the fully visible
board, phases, actor cells and conditional targets shown in the UI. Losing
moves are legal risks; blocked/invalid moves advance no phase.
