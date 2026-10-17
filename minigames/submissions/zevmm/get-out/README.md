# Get Out! Sliding Walls

Open index.html in a browser. No build, account, or model connection is needed.

Orange dashed M walls keep moving after you bump them. Player slides use the original 0.22-second easing animation; walls glide between squares over 0.9 seconds. The engine still resolves each player action immediately. Move around an active wall and hit it from another direction to redirect it mid-slide. Dark # walls stay fixed. The player stops at the usual spot, before the wall.

Walls stop against borders, walls, the player, or the exit. They do not push other walls; walls targeting the same cell both stop. The first puzzle introduces the new type; four original teaching boards retain fixed walls.

## Controls

- Arrows, WASD, swipe, or direction buttons slide the player.
- Pause walls freezes motion. Resume walls or a direction continues time.
- Wait one beat advances the walls one square and pauses.
- Undo restores the state before your last successful action, including headings, and pauses. Reset restores the initial layout and stops all walls.
- Hints pause time and suggest a direction or waiting one beat. The solver searches player/wall positions and headings; its search limit produces an explicit message.
- Leaving the browser tab pauses the clock.
- Design a puzzle includes separate Fixed wall and Sliding wall tools. Board codes use S, E, #, M, and .; imported boards are checked with the same solver.

## Local checks

From the repository root:

```sh
python scripts/minigames.py check --owner zevmm
python scripts/minigames.py test --owner zevmm
node --test minigames/submissions/zevmm/get-out/tests/app.test.cjs
```

Engine tests cover mid-slide redirection through ordinary player actions, persistent movement, collisions, detached observations, solver waiting, and solvability. App tests use a simulated DOM and clock to check the 900 ms cadence, redirection, undo/reset, hints and pausing. Visual browser and peer playtests remain TODO in experiment.md.

## Sources

This is a student variant of the course's browser adaptation of Eric Zimmerman's Get Out!, exercise 11 in The Rules We Break. The course's original boards and interface are retained. The moving-wall design comes from the student's request. The local rule-source-map.md records evidence and implementation assumptions. Book artwork and prose are not bundled.
