# Get Out: Moving walls

Open `index.html` in this folder. Use arrows, WASD, direction buttons or swipe.
Moving walls (written as `*` in board codes) first alternate between their placed tile and its right neighbor
on each directional attempt. Then the ball slides and stops against their new positions. They never drift or wrap. The destination must be empty floor. Walls
wait at another wall, the player, start or exit. `#` walls stay fixed.
A turn counts when either you or a wall moves. Undo restores both; Reset
restores the initial board. Hints search both player and wall positions, with
a 10,000-state limit that reports uncertainty if exhausted.

All four puzzles have multiple moving walls. The first has seven.
Arrow keys move walls and change their color: red at the left position,
green at the right. Blocked walls keep their color. Tiles show no star icon.
Undo restores position and color; Reset or changing levels restores red. Add more with Design a puzzle → Moving *
or put `*` into an exchanged board code. Original boards using `#` still work.

From the repository root:

```
python3 scripts/minigames.py check --owner alexhekmat
python3 scripts/minigames.py test --owner alexhekmat
```

See `experiment.md` for evidence and `docs/rule-source-map.md` for conventions.
