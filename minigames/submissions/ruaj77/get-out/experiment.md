# Get Out! — Switch & Door: ruaj77

Principle: `perception` — A Change in Perspective.
Reference: Schell, Chapter 14, Lens #58: The Puzzle (course third edition).

## Design decisions (student supplied)

The variation connects Schell Chapter 14, Lens #58: The Puzzle to
**A Change in Perspective (`perception`)**: a closed door can be a useful
stopping point as well as a barrier. The student chose a one-time switch and
stateful door, preserving the sliding rules and original four levels. Level 5,
**The Door Is a Tool**, uses the final Candidate C layout. Designer self-play
led to the board revision; no further gameplay changes follow this playtest.

## Prediction (student supplied before building)

"Introducing a switch-controlled door will encourage players to reconsider
obstacles as potentially useful tools rather than simply barriers."

Intended player experience, supplied by the student: Players may initially
focus on opening the door, but eventually discover that the closed door can
be strategically useful.

Central insight: "A closed door is not merely an obstacle. It can also serve
as a useful stopping point."

A specific counter-observation was not recorded before building. Possible
outcomes considered in the later playtest plan are preserved below; they are
possibilities, not observed results. The engine fixtures verify the rules;
they do not establish the intended player experience.

## Phase 3 engine implementation (approved by student)

This increment changes only the personal game engine and supporting tests and
documentation. It adds `T`/`D` validation, a frozen `doorOpen: false` initial
snapshot, closed-door collision, immediate one-time switch activation,
continued sliding, and door-state observations. Saved snapshots restore
position, move count, victory and door state; recreating the initial board
resets them. BFS distinguishes position and door state and still finds a
shortest path from the current snapshot without mutating it.

No fifth level, UI rendering, animation, editor tools, or trace integration
is added. The original four levels, browser assets, and seven copied reference
tests are preserved. See `rule-source-map.md` for rule evidence.

Automated checks observed:

- Test-first run: 29 tests, 8 passed and 21 failed because T/D and door state
  were unsupported. After state/movement changes, 28 passed and the solver
  revisit test still failed (`null` instead of down, up, right). Adding door
  state to BFS keys made all 29 pass (7 original + 22 new).
- `python3 scripts/minigames.py check --owner ruaj77`: valid submissions: 1.
- `python3 scripts/minigames.py test --owner ruaj77`: exit 0; default cloud
  Node runner reports two file-level tests. The explicit individual-test run
  with `--test-isolation=none` above verifies all 29 tests.
- Instructor reference engine suite with `--test-isolation=none`: 7 passed.
- Plain `python3 -B -m unittest discover -s tests -v` initially ran 34 tests
  successfully but could not import `test_providers` because the host lacked
  `anthropic`. This was an environment dependency issue, not a rule failure.
- With frozen course dependencies in a temporary environment, all 43 repository
  Python tests passed. Command: `UV_PROJECT_ENVIRONMENT=/tmp/ruaj77-course-venv
  UV_CACHE_DIR=/tmp/ruaj77-uv-cache UV_PYTHON_DOWNLOADS=never
  PYTHONDONTWRITEBYTECODE=1 uv run --frozen python -B -m unittest discover -s tests -v`.
  No dependency manifests or shared configuration were changed; SDK tests use
  mocked transports, not live model calls.
- Scope verification: all 12 new files are inside this personal directory;
  all seven instructor reference files match fetched `upstream/main`.
  Copied `app.js`, `index.html`, `levels.js`, `style.css` and original engine
  tests match the reference byte-for-byte. Branch is `ruaj77/get-out`, with
  no new commits. `origin` is the personal fork and `upstream` the class repo.

Browser interactions were not tested during Phase 3; Phase 4 results follow.

## Independent human playtest observations — Player A

These are actual human observations supplied by the designer after the
playtest, separate from designer self-play and automated testing. One player
played **Level 5 — The Door Is a Tool (Candidate C)**.

| Observation | Reported result |
| --- | --- |
| Completion | Successfully completed the puzzle |
| Hints requested | 0 |
| Resets | 0 |
| Exact number of moves | Not recorded |
| Perceived difficulty | Moderate |
| Significant confusion | None reported |
| Closed door used as a stopping point | Yes |
| Conscious recognition of its strategic usefulness during play | No |
| Recognition of its importance | During post-game reflection and discussion |

Successful use is not recorded as deliberate strategic use: Player A did not
consciously recognize the door's usefulness while playing. No verbatim player
quotes or additional action sequence were supplied. Play order, prior puzzle
familiarity, earlier-level experience, Undo use, session duration and answers
to the two planned neutral questions were not recorded. Fairness and
satisfaction were not separately recorded. No additional participant or
reference-versus-variation comparison was reported.

## Interpretation (student supplied)

The original prediction was that players would recognize the closed door as
a strategically useful stopping point. This playtest **partially supported**
that prediction: Player A successfully used the intended mechanic, but did
not consciously understand its importance during gameplay. Recognition
occurred during post-game reflection and discussion instead.

This suggests that the mechanic functions correctly, while successful use
does not necessarily demonstrate understanding. The evidence comes from
**one player** and should not be generalized. With prior familiarity and play
order unrecorded, practice effects cannot be assessed. Computational proof
establishes mechanical requirements, not conscious insight or satisfaction.

## Next design decision (student supplied)

**Retain Candidate C.** The designer found its difficulty appropriate; Player A
considered it moderate, completed it successfully and reported no significant
confusion. All mechanical design constraints remain computationally verified.
No further gameplay or interface changes are being implemented.

For future iteration, test whether additional players recognize the closed
door's strategic usefulness during gameplay rather than only in post-game
reflection. This is a proposed next test, not a result or a scheduled session.

## AI assistance and human decisions

The student supplied the title, principle, hypothesis, intended experience,
exact switch/door rules and scope limits. Codex scaffolded the personal copy,
implemented the engine and UI, helped compare candidate boards, and added and
ran deterministic, exhaustive and browser checks. Independent Codex reviewers
checked rule changes; those reviews were not human playtests.

The designer personally checked the original and revised puzzles, found the
original seven-move board slightly too easy, selected Candidate C for more
meaningful exploration and spatial reasoning without new mechanics, then
found its difficulty appropriate. Exact designer statements are preserved in
the final self-play section below. The designer supplied Player A's actual
observations, the interpretation and the decision to retain Candidate C.
Codex organized that supplied material into this report and drafted PR text;
it did not observe Player A or generate missing playtest evidence. The student
retains design decisions and submission approval; the instructor controls merge.

## Phase 3 independent review

An independent read-only Codex rules reviewer reported "No findings" after
reading the student specification, engine, tests, local rule map and supporting
documentation. They independently ran all 29 individual Node tests and
confirmed the copied assets/levels/original tests and instructor reference
were unchanged. No issues required resolution.

At the end of Phase 3, human play evidence was not yet collected and was
separate from code review. Browser interactions were also untested then. The student and instructor
retain approval decisions; no commit, push, PR, or merge was performed.

## Phase 4 UI integration

The approved engine, both existing test files, four teaching levels, and
manifest were preserved. This stage modifies `app.js`, `index.html`,
`style.css`, `README.md`, this report, the local implementation plan and rule
map, and adds `tests/test_ui_browser.py`.

The UI derives door and switch appearance exclusively from engine state:
closed doors are solid with `D×`, open doors are dashed with `D✓`; switches are
oval with `T○`/`T✓`. Labels and a conditional legend communicate state without
color alone. Editing shows the initial closed/inactive draft configuration.
The reference visual style and movement input methods are retained.

Activation feedback accompanies the normal move/victory message. Undo
restores snapshots, all visible indicators and counters, with door-specific
feedback only when that value changes. Reset recreates initial state and
clears history/trace. Hints retain the existing current-state solver call.

Switch and Door editor tools accept T/D. Check & play and import reject
missing/duplicate pairs or unsolvable boards before replacing the playable
board. Exchange exports the initial row format; activation is not exported.
Trace events record actual before/after door values, activation and Undo
positions/counters; trace JSON adds final door state without changing rules.

### Phase 4 automated results

- Existing personal engine tests: 29/29 passed with `--test-isolation=none`.
- `python3 scripts/minigames.py check --owner ruaj77`: valid submissions: 1.
- `python3 scripts/minigames.py test --owner ruaj77`: exit 0 (two Node test files).
- Repository Python deterministic suite with frozen dependencies: 43/43 passed.
- `python3 -B -m unittest discover -s minigames/submissions/ruaj77/get-out/tests
  -p test_ui_browser.py -v`: 17/17 real Chromium browser tests passed.

Browser tests were added and run before UI implementation. The existing hint
tests passed; tests for the missing visuals, editor tools and trace fields
failed. After integration, the keyboard focus check was corrected to navigate
with Tab: programmatic focus after mouse input is not `:focus-visible` in
Chromium. The complete browser suite then passed.

Completed browser checks: closed/open door and inactive/active switch labels
and glyphs; activation including same-slide victory; Undo/Reset visuals,
position/counters/history; hints before/after activation, after Undo/Reset,
and at an unreachable current position; valid/invalid editor boards; legacy
and T/D exchange; preservation after failed import; arrow/WASD/on-screen
controls; simulated swipe pointer events; downloaded trace JSON; keyboard
Tab focus; and 375px-wide layout without horizontal overflow. Closed/open
and narrow-editor screenshots from Chromium were inspected.

Not performed: physical-phone swipes, manual screen-reader testing,
cross-browser checks, and human playtesting or perception observations.
Human playtest observations and interpretation had not yet been supplied at
this stage; the current evidence is recorded above. No fifth level was added;
browser fixtures are test boards only. No commit, push, PR or merge was made.

Phase 4 independent read-only review: "No findings." The reviewer independently
ran all 17 Chromium UI tests and all 29 engine tests, confirmed preservation
hashes for the engine, existing tests, levels and manifest, and verified the
branch and personal file scope. Student/instructor approval remains theirs.

## Phase 5: original fifth puzzle (superseded by Phase 5B)

Level 5 is **The Door Is a Tool**, a 7 × 7 board with eight walls and exactly
one S, E, T and D. Introductory instruction: "Cross the switch to open the door.
Think carefully about your stopping points." The shortest winning solution
is seven moves. The winning move sequence is deliberately not included.

The geometry partitions the board through the door. Reaching the switch
requires first using the closed door as a genuine stopping obstacle. Reaching
the exit then requires entering the opened door. These are consequences of
the existing rules, not scripted goals, new mechanics or additional restrictions.

### Exhaustive verification

`verify-level5.cjs` uses the approved engine for every forward transition.
It records position, current door state, whether a successful slide stopped
at the closed door, and whether the player entered the open door. It ignores
blocked inputs; an exit ends a slide and cannot count as a door stop merely
because a door lies beyond it. Same-slide activation/traversal is handled.
Visited augmented keys avoid infinite loops while preserving both historical
events. Undo and Reset are controls, not forward verification moves.

All reachable states, rather than one selected solution, were explored:

| Measurement | Result |
| --- | --- |
| Reachable augmented states, including initial/winning | 23 |
| Position/door states | 17 |
| Closed / open augmented states | 7 / 16 |
| Successful directed transitions | 43 |
| Blocked inputs ignored | 45 |
| Winning augmented states | 1 |
| Winning states without switch activation | 0 |
| Winning states without a qualifying closed-door stop | 0 |
| Winning states without open-door traversal | 0 |
| Shortest length from augmented BFS and game solver | 7 / 7 |
| Activation transitions before a qualifying stop | 0 |
| Reachable nonwinning dead-end states | 0 |

One winning augmented state can be reached by multiple routes; it does not
mean only one winning sequence exists. Reverse graph reachability verifies
that every reachable state can still reach a win. There is no prematurely
activated losing state in this board. Undo/Reset remain available if players
want to reconsider a decision. This analysis cannot establish understanding,
deliberate strategy, perceived fairness or satisfaction.

Reproduce the proof with:

```sh
node minigames/submissions/ruaj77/get-out/verify-level5.cjs
```

### Tests and preservation

Eighteen new deterministic tests were run RED before the helper and fifth
level existed. Nine helper tests then passed before level integration,
including adversarial boards with bypasses, no traversal, and no solution.
All 47 Node tests now pass (29 previously approved plus 18 new).
Six Level 5 browser tests initially failed because Level 5 was absent;
all 23 Chromium tests now pass (17 approved UI regressions plus six new).

Browser checks completed for Level 5: selector entry and navigation from
original Level 4; all 49 cells and distinct switch/door indicators; closed-door
collision while moving; activation feedback and open-door passage; full
engine-solved completion with ordinary victory feedback; Undo restoring
closed state and position/counter; Reset restoring initial board/history;
legal hints before/after activation and after Undo/Reset; and usability at
375px width. Initial desktop and narrow screenshots were inspected.

Owner check/test commands passed. The repository Python suite passed all
43 tests using frozen dependencies. The engine, UI, existing test files and
manifest remain unchanged. Original four level objects match the reference;
all instructor reference files are unchanged. All source changes are personal.
No additional level beyond Level 5, commit, push, PR or merge was created.

### Prepared human playtest plan — historical Phase 5 plan

Design hypothesis supplied by the student:

"Introducing a switch-controlled door will encourage players to reconsider
obstacles as potentially useful tools rather than simply barriers."

Prediction: Players may initially focus on opening the door, but eventually
discover that the closed door can be strategically useful.

Alternative outcomes to consider:

- Players immediately recognize the usefulness of the closed door.
- Players activate the switch before understanding the door's usefulness.
- Players repeatedly attempt ineffective routes.
- Players fail to understand the mechanic.
- Players understand the mechanic but do not find the discovery satisfying.

After the student's approval, give anonymous Player A/B labels and show the
normal instructions, without coaching or revealing a winning route. Record
prior familiarity and whether the original four boards were played first.
Observe whether each player uses the closed door to stop, whether they seem
to use it deliberately, and whether they activate the switch. Record moves,
resets, hints and completion. Count resets separately because Reset clears
the current attempt's trace. Capture their explanation afterward; completion
or a mechanically necessary stop alone is not evidence of deliberate insight.

Ask neutral questions: "What were you trying to do?" and "What changed your
understanding?" Interpret remarks and observed actions together, without
equating a solver route with human experience. The sparse 23-state graph may
make trial-and-error completion possible; test whether the key insight is
noticed rather than assuming the seven-move target establishes difficulty.

At the end of Phase 5, actual human observations and interpretation had not
been collected. The later Candidate C observations and remaining unknowns are
recorded in the current sections above. Physical-device, screen-reader and
cross-browser checks remain unperformed. This plan does not establish which
protocol steps were followed in Player A's session; those were not recorded.

Phase 5 independent read-only review: "No findings." The reviewer independently
passed all 47 Node tests, confirmed all proof counts and eight preservation
hashes, checked the unchanged original four levels, and cross-checked every
one of the 43 augmented transitions using separate cell-by-cell event
instrumentation. They also checked the documentation and honest playtest plan.
Their attempted browser rerun in the default sandbox was blocked at Chromium
startup by socket permissions; it is not counted as a browser pass. The
primary agent's successful 23-case Chromium run used the authorized localhost
network permission. No source/Git mutation or approval was issued by review.

## Phase 5B: designer self-play revision to Candidate C

This section records **designer self-play feedback**, not independent human
playtesting. The designer personally played the initial Level 5, reported
that the game worked correctly, and found the puzzle slightly too easy.
The original geometry passed all mechanical constraints; the revision aims
to improve the experience, not repair a rule defect.

### Previous board (recorded before replacement)

```text
S..#E..
..##...
...D...
#..#...
..T#...
...#...
...#...
```

Previous measurements: 7 × 7, eight walls, seven-move shortest solution,
23 reachable augmented states and 43 successful transitions.

**Designer observation:** "After playing the initial version of Level 5,
I found the puzzle relatively easy to solve."

**Design decision:** "I revised the board layout to create more meaningful
movement choices while preserving the switch-and-door mechanic."

**Prediction:** "I expect the revised puzzle to require more exploration
and create a stronger moment of discovery when players recognize the
usefulness of the closed door."

The designer approved Candidate C, with the original title and instruction
retained. Its small exit alcove and less conspicuous alignment role were
selected to encourage a strategic detour and support the perception principle.
This rationale and prediction are not observed results for the revised board.

At this stage, independent Candidate C playtest evidence had not yet been
collected. Player A's later observations and the designer's interpretation
are recorded above; fairness and satisfaction were not separately recorded.

### Candidate C integration results

The title and instruction are unchanged. Current board:

```text
.T.....
.....#.
....#E#
.....D.
.......
#...#..
S.....#
```

The installed verifier rechecked the actual integrated board instead of
importing the temporary candidate study. It confirms six walls, an eleven-move
shortest solution, 33 augmented states (21 position/door states), 65 successful
transitions, 11 closed / 22 open states, 63 blocked inputs and one winning
augmented state. All wins require activation, a successful closed-door stop
before activation, and open-door traversal. All three bypass counts, early
activation edges and nonwinning dead-end counts are zero. Generic exhaustive
analysis is retained, while CLI success additionally checks the approved exact
Candidate C board and metrics. No winning sequence is printed.

Permanent Level 5 tests were updated before replacement: four Node cases
failed against the previous board/helper interface and three browser cases
failed against its old layout, reset position and victory counter. After
integration, all 48 Node tests and 23 Chromium tests passed. Browser checks
pin the exact board and switch/door/exit positions, then exercise collision,
activation, traversal, Undo, Reset to (6,0), legal hints, completion, selection,
Next navigation and 375px layout. The 17 prior UI regression cases also pass.

Required owner check/test commands passed. All 43 repository Python tests
passed using the existing frozen dependency environment. The first four
level objects remain identical to the instructor reference and solvable.
Engine, solver, UI, controls, accessibility, prior engine tests and manifest
hashes are unchanged. All source modifications are personal; no additional
level, commit, push, PR or merge was created.

At the end of integration, independent human playtesting had not occurred and
the designer had not yet played the revised board. The subsequent designer
self-play feedback is recorded below; it is not independent playtest evidence.

Phase 5B independent read-only review: "No findings." The reviewer passed all
48 Node tests, confirmed the installed CLI counts/constraints, independently
cross-checked all 65 transitions cell by cell across the 33 augmented states,
and verified eight preservation hashes plus the original four levels/reference.
They confirmed the previous board and correctly labelled designer feedback,
and that permanent verification has no temporary candidate-study dependency.
Browser test code was reviewed; the successful 23-case Chromium run was
performed by the primary agent, not repeated by the reviewer. No approval,
source mutation or Git mutation was issued by the review.

## Final designer self-play feedback and design approval

These statements are **designer self-play feedback**, supplied by the designer
after personally playing both versions. They are not independent human
playtesting results.

**Initial version — designer observation:** "I found the original 7-move
Level 5 slightly too easy."

**Design revision — designer decision:** "I selected Candidate C to provide
more meaningful exploration and spatial reasoning without adding new mechanics."

**Revised version — designer observation:** "After personally playing
Candidate C, I found its difficulty appropriate."

The designer approves retaining Candidate C as the final puzzle design for
now. This feedback supports the designer's assessment of difficulty; it does
not establish other players' understanding, deliberate strategy, or satisfaction.

Independent human evidence was still uncollected when this designer feedback
was saved. The subsequent Player A observations, interpretation and limitations
are now recorded separately above; no participant observations were inferred
from designer self-play or automated tests.

The implementation and designer feedback were saved to the personal fork in
commit `e77fc7ab36eda21b3f9ecabfaed8118f9afe77f6`. The reflection-only task left
the report update and PR text uncommitted for approval. The designer has since
approved committing the documentation, pushing the personal branch and opening
a Draft PR. Changing review status or merging remains subject to later approval.

## Final reflection validation

The final documentation update preserves Candidate C, all five levels, the
engine, UI, tests and instructor reference. Fresh automated results follow;
human observations above remain a separate source of evidence. No new human
results are inferred from automated passes.

### Automated testing results for the final reflection update

- Individual Node suite: **48 passed, 0 failed, 0 skipped** with
  `node --test --test-isolation=none minigames/submissions/ruaj77/get-out/tests/*.test.cjs`.
- Chromium browser suite: **23 passed**, using
  `python3 -B -m unittest discover -s minigames/submissions/ruaj77/get-out/tests -p 'test_*browser.py' -v`.
  These are automated browser checks, not human playtesting.
- Repository Python suite: **43 passed** with the frozen temporary dependency
  environment and command recorded in the Phase 3 evidence above.
- `python3 scripts/minigames.py check --owner ruaj77`: **passed**, one valid submission.
- `python3 scripts/minigames.py test --owner ruaj77`: **passed**, three Node test
  files; the explicit individual run above verifies the 48 assertions.
- `python3 scripts/minigames.py check --owner ruaj77 --ready`: **passed**, one
  valid submission. Unknown observations are explicitly identified as unrecorded.
- `node minigames/submissions/ruaj77/get-out/verify-level5.cjs`: **verified**,
  exact approved Candidate C, shortest length 11, 33 augmented states and 65
  transitions. All required switch/closed-stop/open-traversal constraints hold,
  with zero bypass wins, early activation transitions or losing dead-end states.
- File hashes confirm that only this report and outdated README playtest
  references changed. Game source, tests, Candidate C and instructor reference
  are unchanged. The Node suite confirms that the original four levels still
  match the instructor reference. The full diff against fetched instructor
  main contains only this personal submission directory; `git diff --check`
  passes. At completion of the reflection-only task, no files were staged and
  HEAD remained the previously saved commit.

There are no identified assignment-specific documentation or test blockers.
The separate local Pyxel diagnostic limitation is recorded below.
Exact human move count, prior familiarity, play order and separate
fairness/satisfaction measures remain unrecorded. Physical-device swipes,
manual screen-reader checks and cross-browser testing remain unperformed.
These limitations are disclosed rather than replaced with fabricated results.
At completion of the reflection-only task, no new commit, push, PR or merge had
been performed. Subsequent submission operations follow the designer's explicit
authorization; Git history and the Draft PR record those operations.

### Separate local Pyxel diagnostic — unresolved environment limitation

The repository's Python/Pyxel example is separate from this static
HTML/JavaScript minigame, which does not use Pyxel. The root offline setup
diagnostic previously reported `FAIL Pyxel engine: TimeoutExpired` at its
30-second subprocess limit; the repository Python tests passed separately.

The designer requested one standalone reproduction in Codex Cloud. The actual
command used the existing frozen temporary environment and cache, without
changing shared dependencies:

```sh
timeout --signal=TERM --kill-after=5s 60s env \
  UV_PROJECT_ENVIRONMENT=/tmp/ruaj77-course-venv \
  UV_CACHE_DIR=/tmp/ruaj77-uv-cache \
  UV_PYTHON_DOWNLOADS=never PYTHONDONTWRITEBYTECODE=1 \
  uv run --frozen python -m course_game.engine_check --headless
```

**Result: timeout reproduced; not passed.** The 60-second external timeout
escalated to a forced kill after five further seconds; the command exited
with **137**. Captured output:

```text
Failed to create secure directory (/home/agent/.config/pulse): Read-only file system
pa_write() failed while trying to wake up the mainloop: Operation not permitted
```

The output reports filesystem/audio restrictions in the managed headless
environment; the precise cause of the hang was not established. No successful
engine completion was reported. No shared source, dependencies, tests or
workflows were modified, and no check was disabled or bypassed.

Fresh assignment-specific validation again passed: 48 individual Node tests,
23 automated Chromium tests, 43 repository Python tests, owner check/test,
ready validation, submission boundaries and exhaustive Candidate C verification.
The designer explicitly authorized a Draft PR with this unrelated local
diagnostic limitation disclosed. GitHub Actions results must be checked
separately; the local timeout does not predict hosted CI success or failure.
