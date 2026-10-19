# Get Out: Shifting Rows

Open `index.html` in this folder in a browser.
Use arrow keys, WASD, swipe, or the direction buttons to slide until a wall
or edge. After a successful slide, the bottom row becomes the top and every
other row moves down one. All contents, including the player, travel with
their row. Blocked directions leave the board unchanged. Crossing the exit wins.

Undo restores the previous board and player position; Reset restores the
starting puzzle. One hint uses the solver with the shifting rows.

## Verification

From the repository root, with Node 22+ available:

```sh
python3 scripts/minigames.py check --owner scarlettleon7
python3 scripts/minigames.py test --owner scarlettleon7
```

Manual browser checks remain: move once and observe bottom-to-top rotation;
Undo and verify the original rows return; Reset; request a hint and follow it;
complete a puzzle and try the next one; check direction buttons at phone width.
For a short smoke test, load this code through Exchange a board:

```text
S.E
...
```

Move right: the player reaches the exit, both move to the second row, and
completion is announced. Undo restores the start; Reset restores the board.

Human predictions, observations and interpretation remain in experiment.md.
