# Get Out! Progressive hints

Help arrives one step at a time. Choose **Ask a question**, then **Get a clue**,
then **Show a move**. Each step is optional. You still make every move yourself.
The question and clue appear before the exact direction. Clues use the current
board and position, including custom boards.

A successful move or Undo starts a fresh hint sequence. Blocked moves keep
it. Reset and new boards clear it. Canceling the editor or rejecting an invalid
board preserves it. A position with no route gets recovery advice. A completed
board offers no more hints. The trace records each revealed level and position;
the completion hint count counts levels revealed.

The reference movement rules, solver, move counter, and teaching boards are
unchanged. No route-history markers are used in this variation.

See [Design and playtesting](experiment.md#design-and-playtesting) for the
student's prediction, reported playtest results, and next test.

## Play

Open this folder's `index.html` directly. No installation or account is needed.
Or, from the repository root, run `python3 -m http.server 8174` and open:

<http://127.0.0.1:8174/minigames/submissions/oscarodonnell1/get-out/>

That local address works on the computer running the server.

- Move with arrows, WASD, swipe, or the direction buttons.
- Slide until a wall or edge stops you. Crossing the exit wins.
- Undo reverses a successful move. Reset begins a new attempt.
- Use the hints only when you want help. Stop requesting help at any level.
- Open **Inspect your move trace** to review or download the actions and hints.

## Make and exchange a board

Choose **Design a puzzle**. Paint walls, a start, and an exit. Choose
**Check & play** to verify solvability. Use **Exchange a board → Get current
code** to copy your board. Paste a partner's code and choose **Load code**.

Boards use `S`, `E`, `#`, and `.`. They must be rectangular, with 2-20 rows and
columns and exactly one start and exit. Invalid or unsolvable imports preserve
play. Progress stays in memory; save the board code before closing the page.

The Designer's guide and Codex starter guide remain available in the game.

## Checks

From the repository root:

```sh
python3 scripts/minigames.py check --owner oscarodonnell1
python3 scripts/minigames.py test --owner oscarodonnell1
```

Tests cover the reference rules, staged help, blocked and successful moves,
terminal and unreachable states, and valid move hints from every reachable
teaching-board position. Browser checks and limitations are in `experiment.md`.

## Sources

- Jesse Schell, *The Art of Game Design: A Book of Lenses*, third edition,
  Chapter 14, Principle 8, p. 263; Lens 58, p. 265.
  [Book chapter](https://doi.org/10.1201/b22101-14).
- Eric Zimmerman, *The Rules We Break*, exercise 11, **Get Out!**, pp. 90-97.
  [Author's game sheets](https://theruleswebreak.com/gamesheets.html).
- Course adaptation: original teaching boards and interface, explicit
  wall/border and mid-slide exit rules, solver, editor, exchange, and trace.
  The reference remains in `minigames/get-out/`.

Book pages and player identities are not included in this submission.
