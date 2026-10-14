# Get Out experiment: rajvardhan19

Principle: perception

## Prediction (student writes before building)

Design change, in the student's words from the build request: "when the ball
moves we switch the position of ball and exit so the player has to think from
both sides (start and exit)".

TODO: Describe the player behavior you predict, and what observation would
make you question that prediction.

## Implementation

**Rule change.** When a slide misses the exit, the ball and the exit trade
places: the ball continues from the old exit position, and the exit waits
where the ball stopped. Moves therefore alternate between the start side and
the exit side. Kept from the reference: sliding to a wall or border, winning
when a slide reaches or crosses the exit (no swap on the winning move), and
blocked moves changing nothing (no swap, no move counted).

Three details were the implementer's reading of the request, for the student
to confirm or change: a winning slide does not swap, a blocked move does not
swap, and the ball always jumps to the exit's previous square.

Changed files, all in this folder:

- `engine.js`: state gains `exit`; `step` applies the swap; `observe` reports
  the current exit, and its board letters follow the moving exit; `solve`
  searches ball and exit positions together, so hints and **Check & play**
  follow the new rule.
- `tests/engine.test.cjs`: tests for the swap, a second move from the exit
  side, blocked moves and legal actions before and after a swap, sliding across
  the old exit square without winning, swap-aware shortest paths, and a
  walled-in exit that becomes unsolvable. The new tests were written before
  the engine change; 5 of 8 failed against the reference engine. One expected
  path was first written wrong and corrected after hand-checking: on
  `S.. / ... / ..E` the route is now right, up (the reference's was right, down).
- `app.js`, `style.css`: the exit is drawn as a moving piece. A swap shows the
  ball stopping, then both pieces trading places. Input pauses during that
  quarter second and a held key does not repeat moves. Square labels for
  assistive technology follow the moving exit. The status line and move trace
  report each swap, and the trace download format is `get-out-swap-trace-v1`.
- `index.html`, `README.md`: the rule card, discussion prompt, and README
  describe the swap.
- `levels.js` is unchanged. All four teaching boards remain solvable, with new
  shortest routes: 4, 5, 7, and 3 moves (reference: 3, 5, 7, 9). "A useful
  detour" becomes much shorter under the swap. A shorter route is not by itself
  evidence of lower human difficulty.

Checks run (no human playtest yet):

- `python3 scripts/minigames.py check --owner rajvardhan19`: 1 valid submission.
- `python3 scripts/minigames.py test --owner rajvardhan19`: 9 of 9 pass.
- `python3 -m unittest tests.test_minigame_tools`: 11 tests OK.
- Automated browser check in headless Chrome, 30 of 30 pass: first board solved
  (down, up, right, down) with the ball and exit verified after each swap; square
  labels after a swap; a key during the swap and a held key; undo,
  reset, hint, blocked move, guides leave the move count unchanged, import of a
  centre-exit board (unreachable in the reference, 3 moves here), rejection of
  a walled-in exit, editor view, phone-width direction buttons with no horizontal
  scroll, and no console errors.

The implementation and these checks were produced with Claude Code at the
student's request.

## Playtest observations

TODO: Record anonymous player labels, board, version and order played, hints
requested, restarts, completion, and one revealing action or remark. Separate
observations from interpretations. No names, emails, or other personal data.

## Interpretation and revision (student writes)

TODO: Compare the evidence with the prediction. Mention prior familiarity,
practice effects, sample size, or other limits. Describe the revision made or
one next test. A single player's response supports a question, not a general claim.

## AI assistance and human decisions (student writes)

TODO: State what Codex generated, what you checked, and one design decision you
retained or changed. Include any remaining known issues.

## Independent review

Reviewer: a separate, read-only Claude Code review task, given the change
summary and the rules-reviewer checklist. It did not write the change. It
reran the tests, ran this test file against the reference engine (5 of 8
failed there, as expected), and compared the solver with an independent model
on 4000 random boards (all lengths and unsolvable cases matched). No blocking
findings. Issues found and resolved:

- No test crossed the old exit square after the exit moved; a buggy engine
  could pass. Added that test and blocked/legal-action tests after a swap.
- During the swap animation a key acted on the position not yet shown, and a
  held key repeated real moves. Input now pauses for the swap; repeats are ignored.
- Square labels kept "exit" on the starting square. They now follow the exit.
- This README's check command and paths pointed at the reference game. Fixed,
  and the trace format, observation board, and test coverage are documented.
- `observe().board` kept a stale `E`. The board letters now follow the exit.

After the fixes: 9 of 9 rules tests, course check and tooling tests, and 30 of
30 browser checks pass. Code review does not replace human play evidence.

TODO: Record your own resolution of the review, including whether you keep the
three implementation choices listed under Implementation. The student and
instructor retain approval decisions.
