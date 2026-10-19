# Get Out experiment: avarose444

Principle: parallelism — meaningful route choices within one puzzle.

## Prediction (student writes before building)

Student's supplied design intention: “I want to explore the puzzle-design
principle of giving players meaningful choices.” “One shorter but more
difficult, and one longer but easier.”

I expect some players to prefer the longer, guided route because it feels more
predictable. Alternatively, players might choose the shorter route because they
enjoy experimentation. These outcomes would suggest whether clarity or discovery
is more motivating.

## Design and playtesting

- **Decisions:** I created two routes to explore meaningful choices in puzzle
  design. The LEFT route is shorter but requires discovering the directions,
  while the UP route is longer but provides instructions. This explores how
  uncertainty and information affect perceived difficulty.
- **Possible outcomes:** I expect some players to prefer the longer, guided
  route because it feels more predictable. Alternatively, players might choose
  the shorter route because they enjoy experimentation. These outcomes would
  suggest whether clarity or discovery is more motivating.
- **Playtest:** I would ask another player to attempt both routes and observe
  which they choose first, where they hesitate, whether they use Undo, and how
  quickly they solve each.
- **Next decision:** If most players prefer the guided route, I would consider
  adding a hint to the shortcut. If players enjoy discovering the shortcut, I
  would preserve the uncertainty. Automated tests passed, but human playtesting
  is still pending.

## Implementation

One original 7×7 board replaces the four teaching boards in `levels.js`.
LEFT starts a five-move shortcut; UP starts a seven-move guided detour.
Both reach the same exit, sharing no intermediate stopping positions.
`index.html` explains the choice before play and supplies the easy route.
The manifest title and README describe the variation. No movement, collision,
exit, solver, undo, reset, hint, or editor rules changed. `engine.js`, `app.js`,
and `style.css` are identical to the reference. No timed challenge or new pieces.
The player can reconsider with Undo or Reset. Original shortest-path hints
remain available, including for the shortcut. The easy route's extra guidance,
not path length alone, is intended to make it easier.

### Actual automated checks

- `python3 scripts/minigames.py check --owner avarose444`: passed.
- `python3 scripts/minigames.py test --owner avarose444`: 10 tests passed,
  including three new route tests (two legal initial choices, five-move shortest
  solution, seven-move alternative without shared intermediate stops).
- `.venv/bin/python -m unittest discover -s tests -v`: 83 tests passed.
- `.venv/bin/python -m course_game.setup_check --offline --headless`: passed
  after rerunning outside the network-restricted sandbox. Partial Setup
  Verification only; no live model call or cloud credits used.

### Remaining manual checks

Browser tool reported “No browser is available.” No browser interaction or
visual layout has been verified in this session.
TODO: In a browser, complete both routes, Undo after winning, Reset, request
a hint, use touch/direction controls at a narrow screen width, and open both
workshop guides after a move (move count should stay unchanged; focused guide
arrow keys should not move the player). Check board editing and exchange.

## Playtest observations

TODO: Invite a peer to choose a route without coaching. Record anonymous
player label, version, route chosen, hints, resets, completion, and one
revealing action or remark. Ask what made the choice meaningful. No human
playtest has been observed or reported yet.

## Interpretation and revision (student writes)

Human observations are pending. The planned next decision is recorded above;
no outcome or revision is claimed yet.
Check whether full directions make the longer route too automatic, whether
the shorter route offers satisfying discovery, and whether players value the
tradeoff. Prior familiarity and practice effects limit comparisons.

## AI assistance and human decisions (student writes)

Codex implementation record: Codex scaffolded the copy, authored and searched
for a board with two distinct routes, wrote route tests and interface text,
and ran the checks above. The student requested the two-route tradeoff and
minimal changes. PR preparation uses the student-supplied design and playtesting plan above.
TODO: Student supplies their own AI disclosure, what they personally checked,
and the design decision they retained or changed.

## PR preparation verification (2026-10-18)

- Submission validation passed; all 10 game tests and 83 Python tests passed.
- Offline setup diagnostics passed Python, Git, Pyxel, deterministic tests and
  the scripted fixture, but GitHub CLI authentication verification failed in
  this network-restricted environment. Overall setup is incomplete.
- Fetching the class base failed because github.com could not be resolved.
  Scope can only be checked against the locally cached upstream/main.
- Human playtesting and browser interaction checks remain pending.

## Independent review

A separate review agent inspected the submission against the reference and ran
all 10 game tests. No concrete game defects were found; the route claims are
supported by tests. Student and instructor retain approval decisions. Human
playtest evidence remains separate from rule tests.
