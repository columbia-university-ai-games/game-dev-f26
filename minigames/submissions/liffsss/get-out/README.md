# Get Out: A clue before the answer

Open `index.html` in a browser. No installation or network connection is needed.
Use arrow keys, WASD, swipe, or the direction buttons. A move slides until a
wall or border; crossing the exit during the slide wins. Undo, reset, board
design and board-code exchange work as in the course reference.

## Progressive hints

Choose **Hint 1: question** for a question about stopping points. Ask again for
a wall, border or exit feature relevant to a shortest route from your current
position. The third request reveals the next direction. You choose whether
to request each level; no clue is shown automatically.

The clue stays visible until a successful move, undo, reset or puzzle change.
A blocked move keeps it. A position with no route gets an undo/reset message
instead of a false direction. Download trace records the levels requested so
you can compare those requests with subsequent actions. It cannot measure
frustration or understanding.

## Design and checks

The design prediction, test plan, actual evidence and remaining checks are in
`experiment.md`; the same reflection belongs directly in the PR description.
From the repository root:

```sh
python3 scripts/minigames.py check --owner liffsss
python3 scripts/minigames.py test --owner liffsss
```

## Sources

Adapted from this course's original Get Out browser interface and teaching
boards. Eric Zimmerman, *The Rules We Break*, exercise 11, Get Out!, pp. 90–97,
is the source exercise. Hint design follows the course's application of Jesse
Schell, *The Art of Game Design*, third edition, Chapter 14 and Lens 58: The
Puzzle. No book pages or artwork are included.
