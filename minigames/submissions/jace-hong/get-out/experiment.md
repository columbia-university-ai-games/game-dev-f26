# Get Out experiment: jace-hong

Principle: perception

## Prediction (student writes before building)

If I change the boards so that every shortest route starts by moving away from
the exit, I expect a player to try the toward-exit move first on most boards,
then find the reversal, because the door looks like the goal and a slide toward
it feels like progress. Board 1 should teach the reversal, so boards 2 and 3
should get faster.

What would make me question this: the player moves away from the exit right
away on board 1 (the trick is too readable), or the player gets stuck and calls
it unfair (the shift was not signaled enough).

## Implementation

- `levels.js`: three new boards replace the four teaching boards. On each,
  every shortest route starts with a move that increases the distance to the
  exit. The toward-exit first move costs 2 extra moves on board 1 and 4 on
  boards 2 and 3. Board 3 also needs a second move away from the exit partway
  through.
- `stats.js` and `app.js`: when a board is solved, the status line shows the
  first slide, total moves, and the solver's shortest move count.
- `index.html`: loads `stats.js`.
- No rule changes. `engine.js` (slide rule and solver) is unchanged.
- `node --test minigames/submissions/jace-hong/get-out/tests/engine.test.cjs`:
  9 tests pass, including one that every shortest route starts away from the
  exit and one for the completion stats.
- `python3 scripts/minigames.py check --owner jace-hong` and
  `test --owner jace-hong` pass. All three boards were played in a browser at
  phone width, by touch and keyboard.

## Playtest observations

### Observed (one player, P1, one session)

- Board 1: first move Down, toward the exit. Solved in 5 (shortest 3), no resets. After seeing "5 moves vs shortest 3" on the completion screen, P1 replayed it unprompted, went Left first, and got 3/3: "Oh, you have to use that top-left block as a stopper first."
- Board 2: first move Up again, toward the exit, despite Board 1. Got stuck in the middle after 4 moves and reset. Second try: studied the walls, went Right, solved in 5 (shortest). "My thumb just automatically goes toward the E."
- Board 3: deliberately started away from the exit ("Not falling for the first move again"), but moved toward the exit too early mid-path and skipped the second reversal. Finished in 8 (shortest 6), after one reset.
- Fairness: "Board 2 felt the best. Board 3 caught me in the middle because I thought the trick only applied to the very first move, which was annoying for a second but fair once I saw the path."

## Interpretation and revision (student writes)

### What this suggests

The result mostly matched the expected outcome, with two differences I did not predict.

1. One board was not enough to override the instinct. P1 went toward the exit on Board 2 as well and only changed after a reset. The perceptual shift took two exposures, not one.
2. P1 learned a narrower rule than I intended: "the first move goes the wrong way," not "any move can." Board 3's mid-path reversal was a second perceptual shift. P1 still called it fair, so it landed on the good side of Schell's double-edged sword, but only just.

Neither alternative appeared cleanly. P1 never called a board unfair (Alternative A), and never read the trick before experiencing it (Alternative B). One confound: the completion stats acted as a hint. On Board 1, the insight came from the move counter after solving, not during play.

### Next decision

- Keep Boards 1 and 2. Board 2 was the strongest board, and the repeated instinct is useful evidence that the shift needs practice.
- Change: add a board between 2 and 3 whose first move goes toward the exit but which needs one reversal mid-path, so the player learns the idea applies anywhere before Board 3 combines both.
- Next test: run the same boards with the completion stats hidden, to see whether players find the reversal without the counter's feedback.
- Checks: check, test, and check --ready for jace-hong pass; all boards are solver-verified. Known limit: one player, one session.

## AI assistance and human decisions (student writes)

Built with Claude Code (Anthropic) instead of Codex, by preference. Claude
searched for boards with the solver and drafted board prompts. I kept the
boards. I changed the prompts: Claude's drafts ("Sometimes the door is behind
you") told the player the trick, which would have made the first-move
prediction impossible to test. The prompts now only restate the rules.

## Independent review

A fresh Claude Code reviewer, separate from the session that wrote the code,
checked the diff against the reference. Findings: no blocking issues. The scope
is only my folder, `engine.js` is identical to the reference, and the away-first
test fails if any shortest route starts toward the exit. One should-fix: the
first move it reports includes a slide the player later undid. I kept that
behavior, because the first direction a player tries is what this experiment
observes, and relabeled it "First slide tried". The reviewer re-ran `check` and
`test` for jace-hong, and both pass. I rewrote this folder's README.md to
describe the variation instead of the reference game.
