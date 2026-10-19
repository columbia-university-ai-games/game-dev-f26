# Get Out! Wrong Way First

A variation of the class Get Out! puzzle by jace-hong. Principle: a change in
perspective (Schell, *The Art of Game Design*, ch. 14, Lens 58: The Puzzle).

## What changed

Three new boards replace the teaching boards. On each one, every shortest route
starts by sliding *away* from the exit. Sliding toward the door first still
works, but costs extra moves: 2 on board 1, 4 on boards 2 and 3. Board 3 also
needs a second move away from the exit partway through. The slide rule and
solver are unchanged.

When you solve a board, the status line shows the first slide you tried, your
total moves, and the shortest route's move count. The playtest observes these.

## Play

Open `index.html` in a browser. Move with the arrow keys, WASD, swipe, or the
direction buttons. You slide until a wall or the border stops you; reach the
exit to win. Undo, reset, and one-hint buttons work as in the reference game.

## Checks

From the repository root:

```sh
node --test minigames/submissions/jace-hong/get-out/tests/engine.test.cjs
python3 scripts/minigames.py check --owner jace-hong
```

The tests check that every board is valid and solvable, that every shortest
route starts away from the exit, and that the completion stats are correct.

## Sources

- Eric Zimmerman, *The Rules We Break*, exercise 11, Get Out!, pp. 90–97.
- Course adaptation in `minigames/get-out/`, which this copy extends.
- Built with Claude Code (Anthropic) instead of Codex, by preference.
