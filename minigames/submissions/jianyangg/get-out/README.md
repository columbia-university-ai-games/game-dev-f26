# Get Out: Gravity

Four gravity directions, five hearts, no timer. Moving toward a wall makes that direction your gravity. Once airborne, gravity stays locked until you land.

## Play

Open `index.html` in a browser. No dependencies or model calls are needed.

- Arrow keys / WASD: move and change gravity while grounded. In flight, perpendicular directions steer one cell; parallel directions do nothing.
- Space (not Up): jump away from the surface your feet point toward. Tap for a one-cell hop. Holding continues the ascent up to three cells, or four from a spring plank. Releasing ends the boost window.
- Q / E, or Local left / right: steer relative to your feet. Hold a direction to steer as soon as the path clears. One successful sideways move per flight; a held direction never changes gravity automatically on landing.
- Spikes are solid: touching them loses one heart. The character turns grey with crossed-out eyes at the impact, then the current level resets.
- Lava is solid: each contact costs one third of a heart and starts a small automatic rebound. The character turns red and shakes slightly. You cannot stand on lava; repeated returns cause repeated damage. Steer sideways during a rebound to escape.
- Next level: carry remaining health forward. Zero hearts automatically restarts level 1 with five hearts.
- Reset level: reset position without restoring health. Restart run: begin again at level 1 with five hearts.

The on-screen controls support touch. Exchange a gravity board accepts rectangular 2–20 cell boards and checks for a damage-free route before starting a separate practice run. S = start, E = exit, # = wall, . = empty, ^ = spike, ~ = lava, T = solid trampoline. Reference board codes with only S/E/#/. also work.

## Checks

From the repository root:

```sh
python3.11 scripts/minigames.py check --owner jianyangg
python3.11 scripts/minigames.py test --owner jianyangg
```

`engine.js` owns discrete physics and contacts. `campaign.js` owns health across levels. `solver.js` searches the same rules for damage-free paths. `app.js` connects the controls; `air-steering.js` and `jump-hold.js` track held inputs. `board-view.js` keeps the original character and grid mounted so movement animates smoothly between collision positions. `damage-reaction.js` owns the timed hit poses; `block-art.js` draws the block artwork; `spring-motion.js` bends and recoils the wooden plank without changing collision rules. Self-play observations are recorded in `experiment.md`; an independent peer playtest is pending. Level 1 keeps the reference board. Levels 2–3 are new 7×7 layouts: a longer detour around a recessed exit, then a fall into a shaft. Level 2’s verified route uses at least four intermediate landing positions; that is a layout check, not a human difficulty score. The final board offers a damage-free gravity-and-steering route and a trampoline-jump alternative. Starting positions are safe, and jumping is not required for the gravity route. These boards are prototypes; completing them does not establish that the puzzles are challenging or that the controls are clear.
