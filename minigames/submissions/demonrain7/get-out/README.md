# Get Out! — Trace Chaser

A personal variation by demonrain7. Slide to the exit while an enemy replays
every tile you crossed, in chronological order. It follows your turns rather
than taking a shortcut toward you. The four course boards remain the puzzle
sequence; the chase ramps up through earlier spawning and faster movement.

## Play

Open `index.html` in a browser, or serve the class repository with
`python3 -m http.server 8000 --bind 127.0.0.1` and visit
`http://127.0.0.1:8000/minigames/submissions/demonrain7/get-out/`.
No installation, model calls, or API keys are needed to play.

- Arrow keys, WASD, swipe, and direction buttons slide to a wall or border.
- The enemy spawns at the original start after successful slides. Blocked
  directions do not count. It begins replaying your complete tile-by-tile path.
- It advances even when you are deciding what to do. Touching the enemy during
  a slide, or letting it reach your tile, causes capture.
- Reaching the exit wins immediately and stops the chase. If you finish during
  your head start, the enemy does not spawn. The first board permits this.
- Undo restores the entire state before your last successful slide: player,
  trail, spawn counter, enemy location, and partial time toward its next step.
- Reset begins a fresh attempt with the same board and difficulty.
- Pause freezes both movement and time. Guides, editor, exchange, trace
  inspection, and a hidden tab also pause the chase. Closing tools resumes it.

| Board | Enemy spawns after | Enemy speed |
| --- | --- | --- |
| 1 | 3 successful slides | 2 tiles/second |
| 2 | 2 successful slides | 3 tiles/second |
| 3 | 1 successful slide | 4 tiles/second |
| 4 | 1 successful slide | 5 tiles/second |

The student requested twice the original enemy speed on every level.
These values remain tuning choices requiring human playtesting. The student
chose Combining Ideas (principle `pyramid`),
combining route planning with avoiding a trace chaser. The staged head start
and speeds also apply the Learning Sequence idea.

## Hints and board exchange

A hint finds a shortest safe **immediate** route from the current player and
enemy positions. The engine treats each player slide as instantaneous. The
enemy can move while you read or think, so a hint is not a promise about
reaction time. No immediate route does not prove there is no route after
waiting for the enemy to move. Captured states have no hint or legal moves.

The editor and board codes retain `S`, `E`, `#`, and `.`. Custom boards use the
current level's chase settings, displayed above the controls. Select an earlier
level before importing if you want a longer head start. Unsolvable or invalid
imports preserve the current game. Board codes contain layout only.

Trace downloads include the starting board, difficulty, attempted player moves,
spawns, real-time enemy movement, capture, hints, manual/automatic pauses, undo, and
the final enemy state. Reset begins a new trace. Use anonymous playtester
labels in written observations.

## Rules API

`engine.js` is dependency-free and shared by the browser and Node.

```js
const game = require('./engine.js');
let state = game.create(board, {spawnMoves: 2, tilesPerSecond: 3});
state = game.step(state, 'right');
state = game.advanceTime(state, 500); // elapsed unpaused milliseconds
const observation = game.observe(state);
const route = game.solve(state);
```

`step`, `advanceTime`, and `observe` do not mutate their input. Observations
include the visible board, full trail, enemy location/progress, difficulty,
move count, terminal flags, and legal directions. No playing model is connected.
The browser synchronizes elapsed time before applying an input; pause and
visibility changes discard paused time rather than catching up on resume.

## Checks

From the repository root:

```sh
python3 scripts/minigames.py check --owner demonrain7
python3 scripts/minigames.py test --owner demonrain7
```

Tests cover reference movement plus tile traces, 3/2/1 spawning, real-time
catch-up, fractional timing, corner following, crossing collisions, terminal
states, reset initialization, detached observations, validated settings,
and safe immediate routes for every curriculum board. Browser verification
checks actual timer behavior, pause/resume, undo, reset, hints, workshop tools,
completion, board exchange, and narrow-screen controls.

The rule map is in `docs/rule-source-map.md`, and the independent review handoff
is in `docs/review-summary.md`. Human playtesting remains in `experiment.md`.

## Sources

The reference is a classroom adaptation of Eric Zimmerman's Get Out!, exercise
11 in *The Rules We Break*, with original course boards and interface. The
ten classroom questions apply Schell's Chapter 14 and Lens 58; they are
original classroom interpretations. The trace chaser and curriculum settings
are the student's requested variation, not rules attributed to those books.
