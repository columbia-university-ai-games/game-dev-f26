# Get Out: Push your way out

Open `index.html` in this folder to play. No build or installation needed.

Use arrows, WASD, swipe, or direction buttons. You slide until a wall or edge.
On collision, orange B blocks are pushed to the next obstacle or edge; the
player stops directly behind the block. Blocks cannot enter walls, other blocks,
or the exit. Reach the exit to win. Undo restores player and block positions;
Reset restores the starting board. Hint finds a route with current block positions.

Ten levels require pushing, with shortest solutions increasing from 2 to 11 moves.
This is a solver-based difficulty measure; human difficulty still needs playtesting.

The first teaching board can be solved with Right, Down.
Use Design a puzzle → Pushable block to paint more blocks. Board codes use
S = start, E = exit, # = wall, B = block, . = floor. Copy your code before closing.

From the repository root, verify with:

```sh
python3 scripts/minigames.py check --owner anonymousanemone
python3 scripts/minigames.py test --owner anonymousanemone
```

This is a student variation of the course's original Get Out browser boards.
Human playtest evidence remains TODO in experiment.md.
