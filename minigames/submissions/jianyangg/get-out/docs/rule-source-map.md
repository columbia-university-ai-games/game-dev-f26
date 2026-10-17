# Gravity Get Out: rule and source map

The shared Garden Door map concerns a different engine. This map covers only this variation.

| Rule | Evidence | Owning source |
| --- | --- | --- |
| Grounded direction input sets gravity automatically; gravity stays fixed in flight. | assumed: design specification, awaiting human play | engine.js: input |
| Holding a sideways control retries it until the path clears, without changing gravity on landing. | code: held-control tests | air-steering.js; tests/air-steering.test.cjs |
| Each flight allows one successful sideways move relative to gravity. | assumed: design specification | engine.js: input |
| Space jumps opposite gravity. A tap rises one cell; continued holding adds height up to three cells normally or four on a trampoline. Releasing ends the extension window. | assumed: bounded grid interpretation of the design | engine.js: tick |
| Spikes remove one heart and reset the current level. | assumed: design specification | engine.js: contact |
| Hazards are solid. Colliding with lava removes one third of a heart; contact triggers a small automatic rebound. Each new contact after a rebound costs another third of a heart; the player cannot stand on lava. | assumed: contact interpretation, awaiting human play | engine.js: contact |
| Five hearts start a run; health does not replenish between levels. Zero health restarts at level one with five hearts. | assumed: design specification | campaign.js |
| Walls, hazards, trampolines and the board boundary are solid; crossing an exit completes the level. No countdown. | assumed: variation specification | engine.js |

Tests provide code evidence of implementation, not evidence of player experience. All current boards must have a damage-free route according to the matching solver. No model player or Garden Door player interface is changed.

Level design checks: level 2’s verified route starts away from the exit and uses at least four intermediate landing positions in its verified route. Level 3 has a damage-free gravity-and-steering route without jumping, plus a verified trampoline-jump alternative. Its start has no adjacent hazards. Restricted searches exhaust the reachable state space; a budget limit is reported separately from an unreachable result (`solver.js`, `tests/level-design.test.cjs`). These checks do not establish human difficulty.

The plank’s compression and recoil are presentation only (`spring-motion.js`, `block-art.js`); its collision tile stays solid. The pixel-style hazard art does not change contact damage.

Hazard reactions: spikes show a grey character with crossed-out eyes at the contact position before the existing level/run reset becomes visible. Lava flashes the character red, shakes it slightly and offsets a small bounce away from the contact face. Presentation does not add damage; engine contacts own damage. Evidence: assumed, player-requested rule/feedback; `engine.js: contact`, `damage-reaction.js`, `board-view.js`.
