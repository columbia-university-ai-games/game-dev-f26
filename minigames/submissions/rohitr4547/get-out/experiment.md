# Get Out experiment: rohitr4547

Principle: perception

## Prediction

Starting point: the swap-sides rule from rajvardhan19's variation (class PR
#12, co-developed by rajvardhan19 and rohitr4547). When a slide misses the
exit, the ball and the exit trade places.

Design change, in the student's words from the build requests: "adding an
obstacle which shows up from the start and this obstacle can show up at any
random location to block the path from the start to the end ... while
preserving the change of swapping locations of the start and end points. The
obstacle needs to have an icon possibly of a traffic sign indicating no
movement through that path." Then: "this obstacle should be ensured to keep
changing its position from turn to turn. The previous logic of start and end
changing has to be maintained."

My prediction: with the swap alone, once you find a route you can kind of
just replay it. With the roadblock jumping every turn that stops working, so
I expect players to slow down and actually look at the board after each move,
at where the ball is, where the exit went, and where the sign landed. I also
think a few people will figure out that the sign stops you like a wall and
start using it to stop on purpose. That's the moment I'm hoping for.

What would make me question this: if players start mashing keys, keep hitting
New roadblock looking for an easy layout, or just follow hints, then the jumps
are reading as random noise and not as something you can plan around.

## Implementation

**Rule change.** A no-entry roadblock, drawn as a red no-entry traffic sign,
stops a slide exactly like a wall. It is on the board from the first move.
After every move that misses the exit, it jumps to a new square on the new
shortest way out. The swap rule is unchanged.

**Where it jumps.** From the new ball and exit positions, the game finds the
shortest way out as if there were no roadblock. It orders the floor squares
the ball would slide across on that route with a seeded shuffle, then picks:

1. the first square that breaks that route;
2. otherwise any route square;
3. otherwise any other floor square.

It never uses the ball's, exit's, or start square, and never stays on the
square it just left, unless no other free square exists. A blocked move does
not move it.

**Why seeded, not truly random.** A truly random jump could make the board
unsolvable mid-game and would make hints meaningless. With a seed, the choice
depends only on the seed, the ball, the exit, and the previous square. It
looks random to the player, but the solver can plan around it. The game only
uses seeds that leave a way out.

**Seeds in the app:**

- Each teaching board has a fixed seed, so every playtester sees the same
  sequence. Reset replays it.
- **New roadblock** picks a new random seed that leaves a way out.
- Custom and imported boards get a random seed.

Choices made while implementing, for the student to confirm or change:

- The roadblock jumps after every move, but not on blocked moves.
- It acts like a wall rather than doing something new.
- Teaching boards use a fixed sequence for comparable playtests.
- Board codes no longer carry a roadblock; the game always places it.
- A board with no solvable sequence plays without a roadblock and says so.

Effect on the four teaching boards (shortest route; 100 seeds per board):

| Board | Swap only | Fixed seed | Seeds that leave a way out | Route range over 100 seeds |
|---|---|---|---|---|
| 1. Find your feet | 4 | 6 | 83 | 5 to 11 |
| 2. Take the long way | 5 | 7 | 100 | 5 to 9 |
| 3. Change direction | 7 | 7 | 94 | 5 to 11 |
| 4. A useful detour | 3 | 9 | 100 | 3 to 10 |

In random play on the teaching boards, the roadblock changed square on
10,009 of 10,009 moves that missed the exit.

Changed files, all in this folder (starting from the swap variation):

- `engine.js`: the roadblock is part of the game state; `create(board, seed)`;
  `step` moves it after each move; a distance table per board makes each jump
  a lookup; `solve` searches ball, exit, and roadblock; new `solveWithin`
  (search with a budget) and `solvableSeed`.
- `tests/engine.test.cjs`: 10 roadblock tests (19 total). They fail against
  the swap-only engine; the 9 swap tests pass unchanged.
- `app.js`, `index.html`, `style.css`: the animated roadblock piece, status
  and trace messages about each jump, New roadblock, fixed seeds for teaching
  boards, bounded seed search, and hints that give up on huge boards rather
  than freezing.
- `serve.py`: a local launcher. Run
  `python3 minigames/submissions/rohitr4547/get-out/serve.py` from the
  repository root to serve the game on 127.0.0.1 and open it in a browser.
- `README.md`, `submission.json`: describe the moving roadblock. `levels.js`
  is unchanged.

Checks run (no human playtest yet):

- `python3 scripts/minigames.py check --owner rohitr4547`: 1 valid submission.
- `python3 scripts/minigames.py test --owner rohitr4547`: 19 of 19 pass.
- `python3 -m unittest tests.test_minigame_tools`: OK.
- Headless Chrome against the game served by `serve.py`, 24 of 24 pass:
  - the roadblock and sign shown at start, with an accessible label;
  - the first move still swaps, and the roadblock jumps;
  - the status line and trace report the jump;
  - undo restores the ball, exit, and roadblock;
  - reset replays the same sequence;
  - the roadblock changes square on every move that misses the exit (41 moves
    across four boards);
  - all four boards completed by following hints;
  - board 1 always starts the same;
  - New roadblock always starts on a different square;
  - a slide stopped by the roadblock is reported;
  - a board code with `X` is rejected, and the editor has no roadblock tool;
  - phone width (375 px) has no horizontal scroll;
  - no console errors.
- Speed on random 20 × 20 custom boards: finding a seed took at most 1.7 s,
  and a hint at most 55 ms.

## Playtest observations

One player so far. Player A tried the moving-roadblock version of the
teaching boards. Player A co-designed the swap rule in #12, so they already
knew the swap and the reference boards. They weren't new to the game, only to
the roadblock. No trace file was saved, so the move counts below are their
rough count, not exact numbers.

What happened:

- Player A tried most of the four boards and solved each one they tried.
- Each solve took roughly 20 moves. The shortest routes on those boards (with
  their fixed seeds) are 6 to 9 moves.
- The roadblock's jumps felt random to them the whole time. They didn't get
  to the point of predicting where it would go next.
- They did stop against the sign on purpose, using it as a stopping point.
- They didn't use hints, undo, reset, or New roadblock.
- Their suggestion: playing longer on one board would give them a proper idea
  of how to deal with the roadblock.

## Interpretation and revision

With one player, the prediction half held.

- **The part that held:** Player A used the sign as a stopper on purpose.
  That's the "the thing blocking you is something you can use" moment the
  whole design is built around, so the core idea can land.
- **The part that didn't:** I predicted players would start reading the board
  after each jump. Instead the jumps felt random to Player A the whole time.
  That's my Alternative 1. The rule is deterministic, but that doesn't help
  if a player can't see it.
- **Difficulty:** the boards are solvable without help (no hints), but about
  20 moves against a shortest route of 6 to 9 looks like trial and error more
  than planning. That fits the jumps feeling random.
- **Their suggestion fits the data:** if the jumps can be learned, it would
  show up on one board played several times, not across four different
  boards. Reset already replays the same jumps on a board, so this is easy to
  test.

Limits: one player, who already knew the swap rule and the boards; rough
self-reported move counts; and no trace data. This raises questions more than
it answers them.

Revision: keep the moving roadblock, since the useful-obstacle moment showed
up. Next test: a new player plays one board several times with the same jumps
(Reset), with the trace saved. If their move count drops toward the shortest
route, the rule is learnable, and the fix is to encourage replaying, for
example a "play again, same jumps" button after a win. If it stays around 20,
the jumps really do read as random, and I'd add a faint preview of where the
sign will land next.

## Design decisions

The ideas were mine: the swap (with rajvardhan19 in #12), adding an obstacle
with a no-entry traffic sign, having it show up from the start, and then
having it move every turn while keeping the swap.

One decision I changed along the way: the first version put the roadblock in
one random spot for the whole puzzle. That blocked the route once, but after
that you could plan around it like a wall. I changed it so it moves every
turn, because that's what actually forces you to re-read the board.

One decision I kept: the jumps are seeded instead of truly random. I wanted
it to feel random, but truly random jumps could make a board unwinnable
halfway through, and the hints would be wrong.

Known issues so far:

- Routes get longer (board 4 goes from 3 to 9 moves with its fixed seed),
  so the boards may now feel much harder.
- The jump is predictable in principle but not to a player, so it may read as
  random. That is the main thing the playtest should check.
- Some seeds leave no way out (17 of 100 on board 1). The game skips them,
  but a custom board can end up with no roadblock.
- On very large custom boards, a hint may report "no hint found quickly".
- Not tested with a screen reader alone.

## Independent review

Two separate, read-only review passes, each given the change summary and the
repository's `rules-reviewer` checklist.

**Review 1** covered an earlier version where the roadblock stayed put. It
fuzzed thousands of boards and found no rule errors. Its six should-fix items
were fixed before that design was replaced by the moving roadblock.

**Review 2** covered the moving roadblock. It confirmed the rule invariants:

- the roadblock never lands on the ball, exit, start, or a wall;
- it never reuses the previous square;
- blocked moves don't move it;
- the solver's search key is sufficient;
- undo restores it.

Issues found and resolved:

- **Blocking:** the solver was far too slow on 20 × 20 boards (one solve took
  155 s). Each jump re-ran a full search. A per-board distance table now makes
  each jump a lookup, and hints and seed search have a budget. Worst case is
  now about 1.7 s to start a 20 × 20 custom board, and 55 ms per hint.
- New roadblock could run up to about 1,000 solves. It is now bounded.
- Teaching boards gave no message if no seed worked. The status line now says
  when a board plays without a roadblock.
- The roadblock could vanish if no other square was free. It now stays put.
- A Hint during the swap animation jumped the pieces. Hint now waits.
- A near-vacuous determinism test was replaced. New tests cover different
  seeds, a move blocked by the roadblock itself, staying put, boards no seed
  can solve, and the search budget.

After the fixes: 19 of 19 rules tests, course check, tooling tests, and 24 of
24 browser checks pass. Code review does not replace human play evidence.

My resolution: I'm keeping the fixes from both reviews, especially the speed
fix, since a frozen page on a big custom board would wreck a playtest. I'm
not keeping every choice as-is, though. The playtest says the jumps feel
random, so next I'm testing replay on one board, then a preview of where the
roadblock will land if replay doesn't help.
