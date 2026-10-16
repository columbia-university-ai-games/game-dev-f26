# Get Out experiment: alsjoee

Principle: progress

## Prediction (student writes before building)

“Mark every square where the player has stopped, so players can see which positions they’ve already explored. This tests Schell’s ‘give a sense of progress’ principle — I predict players will repeat fewer dead-end moves.”

See the student-supplied alternative outcome in Design and playtesting below.

## Implementation

Changed app.js, style.css, and index.html to show a small green dot on the start and each reached stopping position. Passing squares are not marked. Undo preserves exploration; reset and loading a board clear it. Editor mode hides marks and Cancel restores them. Labels explain that exploration is not distance to victory. Movement, solver, and winning rules are unchanged.

Validation:
- `python3 scripts/minigames.py check --owner alsjoee`: passed.
- `python3 scripts/minigames.py test --owner alsjoee`: all 7 tests passed.
- `node --check minigames/submissions/alsjoee/get-out/app.js`: passed.
- Root unittest suite: 34 tests passed; provider test module could not import because the environment lacks anthropic.
- Offline setup diagnostics: incomplete (GitHub authentication check in sandbox, Pyxel engine, and root deterministic tests failed). Direct authenticated GitHub API access succeeded with network approval. No live model calls were made.
- Browser automation unavailable. TODO: manually verify new marks, unmarked passed-through squares, Undo retaining marks, Reset/new-board clearing marks, editor Cancel restoring marks, hints, completion, and narrow-screen controls.

These checks do not establish the prediction about human behavior.

## Design and playtesting

**Decisions**
- Changed: every stopping position the player reaches (including the start) gets a dot. Undo keeps dots; Reset or a new puzzle clears them.
- Principle: Schell Ch. 14, "give a sense of progress" (Lens 58). In the base game it's hard to tell whether you're exploring or going in circles, so I wanted the board to show what's already been tried.

**Possible outcomes**
- Expected: players check the dots before moving and avoid re-sliding into positions they've already explored → the design gives real progress information.
- Alternative: players ignore the dots, or read "more dots" / "dots near the exit" as progress when they aren't → the markers show *activity*, not *progress*, and may mislead.

**Playtest**
- Plan: give a new player the four boards without explaining the dots. Watch whether they glance at dots before a move, whether they repeat a dotted position, and afterward ask "Did the dots change any decision?"
- Observed (Player A = me, the designer, self-test, n=1):
  - Used the dots to choose a move: 0/4 puzzles.
  - Avoided an already-dotted position: 0/4.
  - Dots made it feel like I was closer when I wasn't: 3/4 (Take the Long Way, Change Direction, A Useful Detour).
- Not yet observed: no outside player has tried it. Self-test is biased (I know what the change is for), so this is weak evidence.

**Next decision**
- My interpretation: I ignored the dots because they only showed where I’d stopped, not which directions I’d already tried, so they didn’t help me pick a move.
- Next change: mark which directions have been tried from each dot, then test with an outside player.
- If an outside player *does* use the dots, keep the change and test on harder boards; if they also ignore them or feel false progress, the next step above stands.
- Checks: reference rule tests (`node --test`) run by Codex; changes limited to `minigames/submissions/alsjoee/get-out/`.

## Independent review

Independent read-only Codex review compared the variation with the reference and found no concrete functional regressions. Submission validation and all seven engine tests passed again. Review confirmed the stop-set lifecycle and unchanged movement/solver code by inspection. No new DOM behavior tests or browser checks were run; visual, accessibility, and narrow-screen verification remain TODO. Student-supplied self-test observations above are separate from automated checks. No gate approval or merge was performed.
