AI-use disclosure: Codex reconciled the student's actual Week 3 post with the revised midterm assignment. No instructor approval is inferred.

# Reconstruction scope and its course record

## Record of origin

The [revised assignment](https://courseworks2.columbia.edu/courses/258228/assignments/1749857) identifies the Week 3 header as the scope record of origin. The student's [September 26, 4:29 p.m. post](https://courseworks2.columbia.edu/courses/258228/discussion_topics/1669984), re-read October 19, names Catacomb II (1991, DOS), CatacombSDL, GPL code with separately licensed data, one early level, original movement/combat/doors, death or exit, and a player limited to screen/controller input.

Level 1 matches that proposal. The older syllabus still says scope is agreed in Session 2; no separate instructor confirmation was found in the inspected thread. We do not claim approval, but the newer brief does not require stopping this matching reconstruction to obtain an additional approval artifact. Record any actual instructor change request if one arrives. Language/engine choice needs no special permission under the revised assignment.

## Working scope

Reconstruct Catacomb II's original first level using original starting inventory, movement, combat, pickups, locked doors and exits. Death, any original level exit, or a separately reported evaluator limit ends an episode. Reuse the attributed C/SDL2 port and original resource format. Add a visual action interface, screenshot-based baseline, and model player compared with current-frame and bounded-history observations.

| Included behavior | Exclusion or adaptation and reason |
| --- | --- |
| Original level 1; 13 HP, keys 0, potions 3, bolts 3, nukes 2 | Levels 2–30 excluded to keep a complete bounded episode feasible to validate |
| Original collision, charge/release, facing, spells, pickups and enemies | New professions, skill trees, rebalanced enemies and dialogue NPCs excluded to preserve reference rules |
| Any original exit ends the episode | Full-game completion is outside the early-level scope |
| Fresh process per evaluated episode | Save/load, cheats and menus excluded to prevent out-of-episode controls and inventory resets |
| Original rendering/HUD | Only pixels and documented status/ticks reach the player; hidden map/coordinates/object lists would remove exploration |
| Native real-time human play | Agent/browser input uses bounded original ticks and pauses between requests so model latency is not a reaction-speed penalty |
| One neutral startup tick | Draws the initial player image; counted and disclosed |
| Visual agent observations | Audio omitted because this adapter transfers images; native human audio remains available |

P1 now implements the three **reachable starts within level 1** declared in [SITUATIONS.md](SITUATIONS.md). Each replays ordinary legal actions from a fresh process, identically for all policies, without exposing preparation in player history. Original inventory changes naturally along the prefix. No teleport, refill, enemy freeze or rule rebalancing is used. These evaluator choices carry `design` labels in [DESIGN_SPEC.md](DESIGN_SPEC.md).

The automated player controls the wizard. Original enemies remain unchanged. The requested discussion before any new NPC behavior still applies.

## Evidence and remaining limits

Source-rule fixtures and a 303-action debug-disabled replay demonstrate an original exit. They do not establish frame-by-frame DOS equivalence; that is a disclosed evidence limit, not an added assignment deliverable. See [RULE_SOURCE_MAP.md](RULE_SOURCE_MAP.md).

GPL notices are retained. Original resources require separately obtained lawful copies; permission to redistribute graphics/audio/map data is not established. Resolve recipient access and necessary publication permission before final delivery; see [ASSET_PROVENANCE.md](ASSET_PROVENANCE.md).

The optional Handshake contest is excluded. Course submission does not authorize contest entry or acceptance of promotional-license terms. The private repository and immutable candidate history are retained for development; the October 21 hand-in requires complete permitted source/artifacts in the public course folder `midterms/demonrain7/`, with a course PR URL submitted on CourseWorks. No new game or design direction is introduced by this delivery change.
