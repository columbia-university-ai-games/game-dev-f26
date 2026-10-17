# Get Out experiment: jarrettchen217

Principle: perception

## Design and playtesting

### Decisions

In my own play, the reference felt easy to predict two or three moves ahead: unproductive directions often became apparent quickly. I wanted movement to change the board, making planning depend on both position and remaining walls. Breakable surfaces in Fall Guys inspired the mechanic. I connect this to Schell Chapter 14 / Lens 58 through a change in perspective: a wall can be both an obstacle to remove and a stopping point to preserve. The introductory sequence teaches breaking walls before later boards challenge the assumption that breaking them always helps.

The mechanic is my selected variation, not a rule attributed to Schell. The principle ID remains perception; gradual teaching supports that experiment.

### Possible outcomes — predictions for the next test

I expect players to learn the rule in the introductory boards, then reconsider their approach when removing a wall eliminates a needed stop. If they can explain the failure and deliberately choose another route, that would support the intended perspective shift. Alternatively, they may restart through trial and error or find the trap arbitrary; that would suggest the sequence or feedback needs revision.

These predictions were articulated after development and self-play. They are not presented as a recorded pre-build hypothesis or as observed peer behavior.

### Playtest — actual self-play

During my own play, I developed the expectation that breaking a wall would help me advance. Puzzles 8 and 9 challenged that expectation: breaking a wall from an unsuitable approach could leave the current state without a route to the exit. I restarted and wanted to overcome the challenge. In puzzle 9, I found the two crowded corner areas misleading.

These are my own impressions as the designer, not evidence of another player's experience. I did not supply exact action sequences, hint counts, restart counts, or completion counts. The game supports Undo as well as Reset; my account of restarting does not mean Reset is the only recovery option. Wall state changes during the collision action, with the animation conveying the change afterward.

### Playtest — recorded peer observations (2026-10-13)

Player A, a classmate, played the reference and then my one-use-wall variation during an approximately twelve-minute recorded session. Selected player comments are paraphrased from the transcript:

- Player A asked whether the new wall was one-use, showing that its changed behavior was noticed.
- Player A initially described the variation as easier than the reference, but later described a situation as difficult. These are changing impressions, not a measured difficulty comparison.
- When the hint option was introduced, Player A said they preferred to think first.
- Player A asked what a particular stopping position was useful for, noting that it would not normally be possible to stop there. This is relevant to the design question of treating walls as useful stopping points, rather than only obstacles.

These observations suggest that the mechanic drew attention to stopping positions and planning. They do not yet establish independent mastery or transfer. The session included some verbal assistance; Player A played the reference first, and the recording lacks screen capture and exact level/action/hint/reset/completion counts. Speaker attribution and unclear wording remain transcription limitations.

### Remaining activity and next test

Player A's reference and variation play are now observed. I have not completed the separate activity of designing and exchanging board codes with a classmate, and this recording does not establish that exchange.

TODO: Complete the reference board design/exchange activity. For a follow-up variation test, give a player an unseen board after the introductory sequence and observe stopping-point predictions and use of remaining walls without route assistance. Record the board/version, actions and Hint/Undo/Reset events. This is a future plan.

### Next decision

Keep the mechanic provisionally and test whether an unfamiliar player experiences an understandable challenge. If failures seem arbitrary, revise the teaching sequence or feedback before adding difficulty. A possible later experiment is a breakable wall that does not need to be consumed, testing the new assumption that every breakable wall is essential. This is a proposed extension, not an implemented feature.

## Current submission status

The branch contains nine built-in puzzles. Submission validation, 17 game tests, 43 project tests, JavaScript syntax, diff whitespace, and the local boundary check passed in the submission audit. Fork CI passed at 62f5f0f. The review-ready check was blocked by report TODOs. This remains a draft because the separate reference board design/exchange activity has not been completed; a recorded peer playtest is now documented, while board-code exchange remains incomplete.

Historical implementation and verification records follow. Their earlier test counts and board descriptions refer to earlier versions, not additional current results. Assistant checks establish technical behavior; they do not establish human learning or enjoyment.

## Implementation

Student-selected change: “加入新墙的类型 - 一次性墙.”

Codex changed engine.js (F collisions and board-aware solver), app.js (rendering and collision trace), index.html/style.css (crack symbol, instructions, editor), and levels.js (one new experiment board). Manifest and README describe this variation. Rule evidence is in docs/rule-source-map.md; new tests are in tests/engine.test.cjs.

An F wall stops a slide once, then becomes floor. Adjacent collisions consume it and count as an action without movement. Undo/reset restore walls. Reaching E still wins mid-slide.

Four new rule tests were run before implementation and failed because F was unsupported. After engine implementation, all 11 engine tests passed. Final checks: `python3 scripts/minigames.py check --owner jarrettchen217` passed; `python3 scripts/minigames.py test --owner jarrettchen217` passed all 12 Node tests. The existing `.venv/bin/python -m unittest discover -s tests -v` passed all 43 Python tests. Initial system-Python run could not import anthropic; the existing project venv resolved that environment issue.

Automated browser interaction checks in Chrome: consuming F renders floor, Undo restores F and prior move count, Reset restores the initial board, hint after consumption recommends down, and sample completion is five moves. F painting and editor Cancel checked. Imported `SF.E / ####` consumes adjacent F without displacement and counts one move. Export preserves the original F layout. At 390×844, content width equals viewport width and direction buttons consume F correctly. Both guides preserve move count; arrow input focused in the designer guide does not move the player. No browser console errors observed. These are assistant checks, not human playtest evidence.

Offline setup diagnostic passed after using the existing project venv and running outside the network-restricted sandbox. No live model was called. Offline success remains partial Setup Verification.

## AI assistance and human decisions

Codex implemented the engine, solver, interface, levels, tests, documentation, and collision animation. I selected the one-use wall mechanic, requested the gradual introductory sequence and later trap boards, and supplied the self-play interpretation above. Earlier implementation records and independent reviews document technical verification. Selected peer responses from the later recorded session are summarized above. No human animation preference is claimed.

Known limitations: large custom boards with many F walls can make solver search expensive; reduced-motion behavior was checked from source only. My familiarity with the design limits what my own play can establish about an unfamiliar player's experience.

## Independent review

An independent read-only rules reviewer inspected the reference/student differences, rule map, engine, UI, tests, levels, and metadata. One should-fix finding requested exact code line references in the map. Those references were added; reviewer rechecked the map, rendering adjustment, and additional experiment-board test, independently reran all 12 Node tests, and reported “No findings.” The reviewer did not perform browser checks or approve a gate. Student self-play and the later recorded peer session are documented above; the earlier reviews supplied technical evidence only.

## Advanced board extension

Student request: “可以多加几个然后built in到第六第七个map里,这样可以方便我们去看, 去研究”.

Added puzzles 6 and 7 in levels.js, keeping the first five unchanged. Both are 7×7 with one F and shortest solutions of 10 moves. The solver verifies each is unsolvable if F is replaced at the start with either permanent wall or floor. This verifies dependence on the new mechanic, not greater human difficulty. A new test failed before implementation (only five levels present).

No human comparison of puzzles 6 and 7 was supplied. The next-test predictions above do not establish their relative human difficulty.

## Fragile-wall trap boards

Student requested built-in puzzles where removing the fragile wall can prevent completion. Added puzzles 8 and 9 without changing the rule engine. Each starts solvable; a specific wrong-side collision creates an unsolvable current state. Undo/Reset can recover. Tests verify both safe solutions and the losing traces (8: right; 9: right/up/down). The ninth board remains solvable after right/up, becoming unsolvable specifically after the F collision. Tests were run before adding each board and failed on missing levels.

Student self-play and interpretation of puzzles 8 and 9 are recorded above. The recorded peer comments above are not assigned to these exact levels; no level-specific fairness or frustration result is claimed.

## Verification of built-in puzzles 6–9

Metadata check passed. All 15 engine tests and all 43 project Python tests passed using the existing venv. Independent read-only reviewer rechecked levels, tests, README, and this report, independently ran all 15 engine tests and reported no findings.

Chrome checks: all four new puzzles are in the selector. Puzzles 6/7 complete in 10 moves and Next advances correctly. Puzzle 8 completes in 7 moves; initial right followed by hint reports no route, and Undo restores F plus a valid next-move hint. Puzzle 9 completes in 9 moves; right/up/down followed by hint reports no route, Undo restores F and a valid hint, and Reset restores its original layout. Last puzzle has no Next button. Page left at puzzle 6 with zero moves for student study. These assistant checks do not supply human playtest evidence.

## Progressive fragile-wall introduction: replacement puzzles 1–5

Student request: “可以intuitive的把前面1-5关都替换一下, 让玩家能够get used to 这个fragile的逻辑”, followed by “fregile的墙可以越来越多这种”.

Replaced only the first five boards and their prompts; kept puzzles 6–9 and all rules unchanged. F counts are 1/1/2/2/3. Lessons are stop/pass, stop/turn, two independent walls, combining turn/continuation, then a three-wall route. Introductory shortest routes use 2/2/3/4/8 actions. Solver enumerates every reachable state on boards 1–3 to verify they never become unsolvable, giving early learning room for mistakes. Board 4 can lose a stopping point and become unsolvable; Undo recovers. Board 5 combines three walls while remaining solvable at every reachable state, as independently checked by the reviewer. Both prompts remind players of Undo. All five shortest routes consume every F before completion.

Two new teaching tests failed before the replacement. The original five-step experiment board remains in a fixed rule test, rather than being tied to the changing first level.

The gradual sequence was requested by the student. Its effect on an unfamiliar player remains a next-test prediction, not a demonstrated transfer result.

## Teaching-sequence verification

Scaffold metadata check passed; 17 Node engine tests and 43 project Python tests passed. Independent reviewer found no functional issues and noted README should distinguish puzzle 4's recoverable trap from puzzle 5's forgiving layout. Documentation clarified. Reviewer independently enumerated all 30 reachable states of puzzle 5 and found each solvable.

Chrome checks: each introductory shortest route completed in 2/2/3/4/8 moves with all F consumed; Next advanced through all five to puzzle 6. First collision stopped at the expected cell; Undo restored the wall. On puzzle 5, consuming one wall left two, Undo restored three, Reset restored three, and hint recommended down. At 390×844, content width matched viewport width and direction buttons worked. Browser restored to puzzle 1 at zero moves. Independent learning and transfer remain unverified; the later peer comments are summarized separately above.

## Fragile-wall collision animation

Student asked to optimize fragile-wall collision animation after publishing the initial branch. Presentation only: player DOM is preserved on F consumption so its slide transition continues. The wall splits into four pieces and fades outward after the 220ms slide, over 320ms; adjacent collisions begin immediately. Further moves clear old effects, and Undo/Reset restore board visuals. CSS hides effects for reduced motion; fallback cleanup removes overlays even when no animation event fires. Engine state and action timing are unchanged.

Chrome checks observed four shards and the delayed effect class for moving collisions, immediate effect class plus unchanged position for adjacent collision, correct move count, rapid continuation to completion, Undo restoring F with no residual overlay, and Reset restoring F with no residual overlay. At 390×844, content width remained 390 and shards rendered. Reduced-motion behavior was checked from source only: this browser tool exposes no media emulation. Independent reviewer found no issues and confirmed JavaScript syntax plus all 17 engine tests. No human preference evidence for animation timing and feel was supplied.
