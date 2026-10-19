# Get Out experiment: yvnvii

Principle: entry

## Decisions

After watching a classmate, I chose to show the player's move count next to
both the fewest possible moves for the board and the fewest moves left from
the current position. Both counts come from `engine.solve`: the board target
is computed when a board loads, and the remaining count is recomputed during
play. On completion, the game says whether the player matched the board
target. This tests Schell #1 (make the goal easy to understand) and #4 (sense
of solvability). The remaining count also acts as a progress or hot/cold
signal, testing #3: a lower shortest-path count means the current position is
closer in moves to a solution, though it does not show which move to make.
Boards, rules, and hints are unchanged.

## Possible outcomes

**Prediction:** Players who finish above the fewest-moves count will undo or
reset and try to match it.

**Alternative:** Players may accept their first solution, or may not notice or
care about the comparison. That would suggest the count is not a useful prompt
for replay, or that its presentation needs to be clearer. If players do replay
but cannot reduce their count, the number may create pressure without helping
them find a better route. Players may also treat the fewest-left number as a
guaranteed monotonic progress bar; changes in that number would show whether
the signal helps them judge moves or confuses them.

## Playtest

**Prior reference-game observation (student report):** A classmate tried to
solve each puzzle in as few moves as possible but had no way to know whether
they had found an optimal solution.

**Variation playtest observation (student report):** Player A solved a puzzle,
then tried again until they found a route matching the fewest-moves count. The
board, exact counts, and whether they used undo or reset were not reported.
This is an observed result for this playtest, not a prediction.

**Plan:** Ask a player to solve a board while thinking aloud if comfortable.
For a follow-up, watch whether a player notices the move counts, whether they
undo or reset after a non-optimal completion, whether they use the fewest-left
signal to compare candidate moves, and whether they can explain what the counts
mean. Ask what they were trying to do and what changed their understanding.

## Next decision

The reported playtest matches my prediction: Player A replayed after solving
until they found a route at the fewest-moves target. I would keep that target
for now. In a follow-up, test whether the live fewest-left count helps a player
compare moves before finishing, or whether it mainly motivates replay after a
completion. If players ignore it, find it distracting, or read it as a
monotonic progress bar, revise its label or explanation and test again. A
small number of playtests is exploratory.

## Implementation and checks

The variation updates the move-count display and completion announcement in
`app.js` and `index.html`, with counter layout styling in `style.css`. It uses
the existing solver for both counts; it does not change the solver, boards,
movement rules, or hint behavior.
`python3 scripts/minigames.py check --owner yvnvii` passed; `python3
scripts/minigames.py test --owner yvnvii` passed all 7 tests; `node --check` and
`git diff --cached --check` passed. Separate undo/reset, hint, and narrow-screen
checks were not documented beyond the classmate playtest above.

## AI assistance and human decisions

Codex implemented the requested displays and comparison and ran the automated
checks. I chose the design principles and prediction, reported the classmate's
playtest result, and chose to keep the board target for now while testing the
fewest-left signal further.

## Independent review

An independent Codex reviewer found no correctness blocker and confirmed the
branch changes only this student's game folder. The reviewer verified that the
board target is solved on load, the fewest-left value is solved from the
current state, and completion compares against the board target. No changes to
rules, boards, or hints were found.

The review noted a minor accessibility risk: the changing counter values are
not in a live region, so screen-reader users may not be notified of updates.
This remains a known limitation; browser or narrow-screen interaction checks
were not repeated by the reviewer.

Review checks: `node --test
minigames/submissions/yvnvii/get-out/tests/engine.test.cjs` passed all 7 tests;
`node --check minigames/submissions/yvnvii/get-out/app.js` and
`git diff --check upstream/main...HEAD` passed. The submission boundary check
also passed.
