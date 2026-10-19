# Get Out: Wall Jumping

Open index.html in a browser. Use arrows, WASD, swipe or direction buttons.
An adjacent maximal wall block can be jumped only if it contains exactly one
wall cell. Land immediately beyond it and stop. Blocks of two or more walls,
or a single wall without an in-bounds landing, cancel without spending a move. With an open
adjacent cell, the original slide still stops before a wall or at the edge/exit.
Landing on the exit wins. Undo, reset, hints and editor use the same engine.

From the repository root:

```
python scripts/minigames.py check --owner annniway026
python scripts/minigames.py test --owner annniway026
```

See experiment.md for evidence and outstanding human checks.
