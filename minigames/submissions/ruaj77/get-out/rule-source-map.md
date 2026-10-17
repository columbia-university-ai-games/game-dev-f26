# Switch & Door: rule and source map

The root `docs/rule-source-map.md` concerns the Garden Door Python starter, not
Get Out. This map records RuaJ77's requested variation without editing shared
course documentation. The student specified the intended rules before building;
`code` labels below now identify their implemented behavior and passing
deterministic checks. The human-experience hypothesis remains untested.

| Rule | Evidence after implementation | Acceptance test in `tests/switch-door.test.cjs` |
| --- | --- | --- |
| Legacy boards use S/E/#/.; mechanic boards have exactly one T and one D | `code`: `engine.js:10` (validation), student's Board Symbols specification | validation and legacy compatibility |
| Initial doorOpen is false; state and arrays are immutable | `code`: `engine.js:5` (freeze), `engine.js:25` (initial state) | initial state and frozen snapshots |
| Closed D blocks movement before its cell; open D is passable | `code`: `engine.js:38` | closed collision and open traversal |
| Entering T immediately opens D, continues the slide, and never toggles | `code`: `engine.js:40`, student's one-time trigger specification | mid-slide trigger, same-slide door, repeated crossings |
| Undo restores a full saved snapshot; Reset recreates the closed initial state | `code`: `engine.js:25`, `engine.js:44`; Phase 4 `app.js:117` and `app.js:127` retain the snapshot/recreation patterns | snapshot restoration and reset initialization; Phase 4 browser tests verify indicators and counters |
| BFS distinguishes row/column/doorOpen and solves from the current snapshot | `code`: `engine.js:54` | revisit position with changed door state and current-state shortest paths |
| Walls/borders stop, crossing E wins, terminal and blocked states do not move | `code`: `engine.js:28`, `engine.js:34`, `tests/engine.test.cjs:5` | original seven reference tests plus switch/door victory cases |

The board is fully visible, as in the original `observe` API. Door state must
also appear in observations so legal actions and visible state agree. No model
player, files, credentials, or solver answer is added to a player's boundary.

## Test-first evidence

Before implementation, 21 new tests failed due to absent T/D support or door
state. After movement/state changes, the position-revisit solver test still
failed: expected `['down', 'up', 'right']`, got `null`. After updating the BFS
key, all 29 tests passed (seven original, 22 new).

Acceptance trace for `['SD.E', 'T###', '####']`: initial `(0,0,false,0)`;
`down` → `(1,0,true,1)`; `up` → `(0,0,true,2)`; `right` → `(0,3,true,3)` and
victory. A closed adjacent door refuses `right` initially with no state change.
This also proves why position alone is insufficient for solver identity.

Assumptions: snapshots passed to the API come from `create`/`step`; this increment
does not add a serialized-state import API. No human perception claim is proven.

## Phase 4: UI evidence (rules unchanged)

| UI contract | Evidence | Browser test file |
| --- | --- | --- |
| Door/switch glyphs, classes, labels and legend derive from authoritative state; editor previews the initial configuration | `code`: `app.js:13`, `app.js:19`, `app.js:61`; `style.css` Switch & Door block | `tests/test_ui_browser.py`: initial indicators, activation, Undo/Reset and editor draft tests |
| Activation is announced even when the slide also wins; Undo mentions the door only when it changes | `code`: `app.js:90`, `app.js:117`, `app.js:127` | activation/victory, later Undo and reset tests |
| Hint retains the current-state solver and unreachable-state message | `code`: `app.js:131` | hint tests before/after activation, Undo/Reset and unreachable current state |
| Editor validates before replacing the playable board; exchange keeps initial symbols | `code`: `app.js:79`, `app.js:142`, `app.js:149`; `index.html` T/D tools | editor, failed import and exchange tests |
| Trace records actual activation and previous/restored door state | `code`: `app.js:94`, `app.js:122`, `app.js:154` | downloaded trace and reset-clearing tests |
| Existing inputs and keyboard focus remain usable at 375px | `code`: `app.js:104`, `app.js:110`; `style.css` original focus/media rules plus inset editor focus | keyboard, on-screen, simulated swipe and narrow-layout tests |

All 17 real Chromium UI tests pass. No engine rule evidence changed; screen
reader, physical device, cross-browser and human-experience checks are untested.

## Phase 5: original board geometry (superseded by Phase 5B)

The fifth board in `levels.js` adds no new rule. It contains one S/E/T/D and
eight walls in 7 × 7. Original first four level objects remain identical to
the instructor reference. The existing engine and UI are unchanged.

| Design constraint | Evidence |
| --- | --- |
| A winning route exists | `code`: `verify-level5.cjs` augmented BFS and actual game solver both give length 7; `tests/level5.test.cjs` replays the result |
| Every win requires switch activation | `code`: all reachable winning nodes have `doorOpen: true`; zero counterexamples |
| Every win requires a successful closed-door stop before activation | `code`: `transitionEvents` excludes zero-distance inputs and exit termination; historical stop flag is checked on every winning node; zero counterexamples |
| Every win requires entering/crossing the opened door | `code`: `transitionEvents` scans actually entered cells, excluding the origin; historical traversal flag is checked on every win; zero counterexamples |
| Forward attempts cannot bypass the intended mechanics through loops | `code`: full `(row,column,doorOpen,stopped,traversed)` closure covers 23 reachable states and 43 transitions; `tests/level5.test.cjs` also rejects adversarial bypass boards |
| No reachable losing dead ends or activation before a qualifying stop | `code`: reverse graph reachability and activation-edge checks in `verify-level5.cjs`; tests assert both counts are zero |
| UI integrates the level without rule changes | `code`: `tests/test_level5_browser.py` passes six Chromium cases for selection/Next, collision/activation/traversal/victory, hints, Undo/Reset and 375px width |

The history flags exist only in the verifier. Undo/Reset are not graph edges;
move count is omitted from identity because it does not affect legal movement.
Necessity checks require at least one win, avoiding vacuous unsolvable proofs.
Blocked inputs (45 during exploration) do not satisfy the closed-stop condition.

Human-use assumption: a necessary closed-door stop may prompt a change of
perspective, but a player can perform it without recognizing its significance.
That hypothesis remains untested; the experiment report prepares observation
and neutral questions, with all actual human results left TODO.

## Phase 5B: approved Candidate C

Candidate C replaces only the fifth board in `levels.js`. The title/instruction,
engine, BFS solver, UI, controls/accessibility and original four levels are
unchanged. The previous board is preserved in `experiment.md` alongside
designer self-play feedback, separately from independent human observations.

| Current contract | Evidence |
| --- | --- |
| Exact approved 7 × 7 Candidate C with six walls and one S/E/T/D | `code`: `levels.js`; `verifyInstalledLevel` in `verify-level5.cjs`; `tests/level5.test.cjs` checks the exact board |
| Solvable in eleven successful moves | `code`: actual solver and augmented BFS agree on length 11; replay test reaches the original victory condition |
| All wins require activation, a successful closed-door stop before activation, and open-door entry | `code`: unchanged `analyzeBoard` and `transitionEvents` enumerate all 33 augmented states / 65 transitions; all three bypass counts are zero |
| Every reachable state can still reach a win | `code`: reverse reachability gives zero nonwinning dead ends; tests retain the zero-dead-end assertion and validate hints from all reachable position/door states |
| Correct rendered coordinates, reset position and eleven-move completion | `code`: `tests/test_level5_browser.py` checks T at (0,1), D at (3,5), E at (2,5), and S/reset at (6,0), then real Chromium collision/activation/traversal/Undo/hint/victory/responsiveness checks |

Counts: 21 position/door states, 11 closed / 22 open augmented states, 63
blocked inputs ignored and one winning augmented state. No activation occurs
before a qualifying closed stop. History flags remain verification-only;
there is no new runtime mechanic. CLI success additionally requires the
approved board/metrics to match, and never prints a winning move sequence.

The designer's prediction of increased exploration/discovery is untested for
the revised board. Independent human playtest results remain TODO.
