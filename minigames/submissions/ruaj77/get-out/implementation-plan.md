# Switch & Door implementation plan

The engine plan and completion record below describe approved Phase 3. Phase 4
extends the UI and Phase 5 adds one board; their checklists/results are appended.

Goal: implement RuaJ77's approved engine-only variation, with a one-time switch
and a door that can first serve as a stopping point.

Design: retain the existing `create`, `step`, `observe`, `legalActions`, and
`solve` API. Extend snapshots with boolean `doorOpen`. Freeze snapshots and their
board/position arrays. Existing history restores a saved snapshot; Reset calls
`create(initialBoard)`. BFS keys include position and door state, not move count.

Scope: only this personal directory; no new level, rendering, animation, editor,
trace integration, commit, push, or PR. Human experience evidence stays TODO.
The detailed user specification is the authority for this plan.

## Steps

- [x] Verify `gh api user --jq .login` returns `RuaJ77`.
- [x] Add/fetch instructor `upstream/main`; create `ruaj77/get-out` from that base.
- [x] Run course scaffold with owner `ruaj77`, principle `perception`.
- [x] Add deterministic tests in `tests/switch-door.test.cjs`; watch new behavior fail.
- [x] Validate zero T/D or exactly one of each; create immutable closed-door state
      and expose `doorOpen` through detached observations.
- [x] Implement closed-door collision, immediate switch activation and continued
      sliding; prove repeated crossings do not toggle and saved snapshots restore.
- [x] Update BFS key to `row,column,doorOpen`; prove a route needing the same
      position with both door states, shortest paths, current-state solving,
      terminal behavior, and unreachable exits.
- [x] Preserve and run the seven copied reference engine tests.
- [x] Update `submission.json`, `experiment.md`, and this copy's `README.md`;
      record rule evidence in this copy's `rule-source-map.md`.
- [x] Run owner check/test, reference tests, and repository deterministic tests.
- [x] Get independent read-only rules review; resolve actionable findings.
- [x] Verify branch/file scope and that reference assets and original tests
      match `upstream/main`; report actual checks and deferred UI work.

## Verification notes

Node's default process-isolated test runner in this cloud session reports only
file-level tests. Use `--test-isolation=none` to see and execute individual tests;
also run the requested course commands without editing shared tooling.

No separate Undo/Reset API is needed: the copied app already saves complete
snapshots and recreates initial state. Tests exercise those patterns at engine
level; browser interaction remains untested and UI work is deferred.

The repository-wide rule map describes the unrelated Garden Door Python game.
Keep it unchanged and record this variation's rules locally instead.

## Completion record

Observed RED: 21 missing-feature failures. Movement/state GREEN: 28/29, with
the solver revisit test still RED. BFS door-state key GREEN: 29/29. Reference
tests: 7/7. Owner check/test: exit 0. Broader Python suite: host dependency
import initially blocked; temporary frozen-dependency environment passed 43/43.
Independent rules review: no findings. Scope: 12 new personal files, unchanged
reference/UI/levels/original tests, no new commits. No browser/human tests.

## Phase 4: UI integration

Design: preserve the original layout and style, render symbols/shapes/labels
from `state.doorOpen`, and keep only the existing game snapshot/history and
editor draft in UI state. Do not change the engine or teaching levels.

- [x] Verify branch, personal scope, engine/tests and record preservation hashes.
- [x] Write browser tests first; observe failures for new UI behavior.
- [x] Add closed/open door and inactive/active switch indicators and labels.
- [x] Connect activation, Undo/Reset feedback and trace to actual snapshots.
- [x] Add T/D editor tools and exchange labels, preserving invalid-board behavior.
- [x] Verify existing current-state Hint handling and all movement input methods.
- [x] Run 29 engine tests, owner commands, 43 Python tests and 17 Chromium UI tests.
- [x] Inspect closed/open and mobile screenshots; check true keyboard focus.
- [x] Finish independent read-only review and final preservation/scope checks.

Test note: the initial focus assertion used programmatic focus after a mouse
click, which does not activate Chromium's keyboard-focus heuristic. The test
now uses actual Tab navigation, and the existing focus styling passes.

No runtime dependencies, fifth puzzle, new game rules, commit, push, PR or merge.
Physical-device and screen-reader checks and human experience remain manual.

Independent Phase 4 review: no findings; reviewer independently passed all
17 browser and 29 engine tests and confirmed preservation hashes/file scope.

## Phase 5: one fifth puzzle

Design: use a simple 7 × 7 partitioned board with one switch and door. The
existing geometry must require a successful closed-door stop, switch activation
and open-door entry on every winning route. Keep engine/UI rules and original
four levels intact. No walkthrough, human observations or PR work.

- [x] Verify branch/scope and record hashes for approved source/tests.
- [x] Evaluate one 7 × 7 candidate exhaustively before integrating it.
- [x] Write 18 deterministic tests RED, including adversarial verifier fixtures.
- [x] Implement actual-engine transitions with two historical event flags;
      check all reachable wins and assess dead ends by reverse reachability.
- [x] Run nine helper tests GREEN before installing the board.
- [x] Write six fifth-level browser tests RED while the selector lacks Level 5.
- [x] Append The Door Is a Tool without changing the first four level objects.
- [x] Run 47 Node tests, 23 Chromium tests, owner commands and 43 Python tests.
- [x] Update README/rule evidence and prepare an honest human playtest plan.
- [x] Finish independent review and final preservation checks.

Observed proof: 23 augmented states / 17 base states; 43 successful edges;
seven-move shortest solution; zero winning states missing required events;
no early activation transitions and no reachable losing dead ends. No full
winning sequence is disclosed. Human discovery/satisfaction remain untested.

Independent Phase 5 review: no findings. Reviewer passed 47 Node tests and
confirmed eight baseline hashes, original level preservation, proof counts
and all 43 transition events with separate cell-by-cell instrumentation.
Primary browser suite passed 23 cases; reviewer startup in default sandbox
was permission-blocked and is not counted as a second browser pass.

## Phase 5B: implement the selected Candidate C

The student approved this specific board after self-playing the previous
Level 5. Keep the title/instruction, engine/UI and original four levels intact.

- [x] Verify scope/branch and save hashes for eight preserved source/test files.
- [x] Before replacing the board, record the old layout and designer self-play
      observation, decision and prediction in `experiment.md`.
- [x] Update permanent Node/browser expectations first: four Node and three
      browser cases fail against the previous layout, position and metrics.
- [x] Replace only Level 5's board with the exact approved seven-row Candidate C.
- [x] Add installed-level verification against the approved layout and metrics;
      retain the generic exhaustive algorithm and all adversarial tests.
- [x] Verify 7 × 7, six walls, eleven moves, 33 augmented states, 65 transitions,
      zero bypass wins and zero dead ends with submitted code only.
- [x] Pass all 48 Node tests and 23 Chromium cases, including exact coordinates
      and Reset to the new initial position (6,0).
- [x] Pass required owner check/test commands and all 43 repository Python tests.
- [x] Finish independent review and final preservation checks.

No rule/UI/solver changes or new levels. Independent human observations stay
TODO; the revised experience is a prediction awaiting the student's next play.

Independent Phase 5B review: no findings; 48 Node tests passed and all 65
transition classifications were independently checked. Eight preservation
hashes and original four levels/reference match. Primary Chromium suite: 23
passed; reviewer inspected browser tests without claiming another run.
