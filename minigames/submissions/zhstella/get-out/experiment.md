# Fog of War: Exploration-Based Puzzle

Owner: zhstella
Principle: `progress` — visible progress, applied as remembered exploration

## Design and playtesting

### Decisions

Student's stated design: “At the beginning of each puzzle, players can only
see the area immediately surrounding their character, while the rest of the
board is covered by fog. As players slide through the maze, previously hidden
areas are gradually revealed. Once an area has been explored, it remains
visible. The original sliding mechanics and win conditions remain unchanged.”

Student's design question: “Does gradually revealing the map make
puzzle-solving more engaging by encouraging exploration, or does limited
visibility make the puzzle unnecessarily frustrating?”

The course's Schell Chapter 14 / Lens 58 exercise on visible progress asks what
the player has learned so far. Here, remembered tiles show accumulated map
knowledge, not distance to victory. This is an application of the course
guide, not a quotation or claimed conclusion from the book. The Motivation
Atlas Discovery guide also suggests revealing hidden information bit by bit;
this folder is a separate Get Out submission, not an Atlas minigame.

Implementation defaults for the student to inspect: a one-tile radius including
diagonals, no wall occlusion, revealing every crossed tile's surroundings,
retaining discoveries on Undo, and starting fresh fog on Reset/new boards.
Full-map hints and designer tools are explicitly labeled as spoilers.

### Possible outcomes — proposed before human testing

The following predictions and test plan are drafts for the student's review;
they are not recorded observations or a student-authored interpretation.

- Expected: a player explores an unknown route, then uses the remembered
  walls to plan a later slide. If their explanation connects a discovery to
  a decision, that would support keeping persistent map knowledge.
- Alternative: a player repeatedly guesses, retraces routes, requests early
  hints or abandons the puzzle and reports frustration. Together, those
  observations would suggest that the current viewing radius offers too
  little information for useful planning.
- Another possibility: the player quickly uncovers most of the map and says
  the fog made little difference. That would suggest testing another board
  before attributing engagement to fog.
- More moves or more mapped tiles alone do not establish engagement or
  frustration; pair behavior with the player's own account.

### Playtest

Give an anonymous Player A an unfamiliar board and the on-screen rules, then
observe without coaching. Record board/code, version, order, moves, repeated
routes, hints, undos, resets, completion and one anonymous remark. Ask “What
were you trying to do?” and “What changed your understanding?”

For a reference/fog comparison, use different players on the same unseen
board, or counterbalance both board and condition order across players.
Replaying a known solution would introduce a practice effect. Note any use
of full-map hints, the editor or exported code; these reveal extra information.

Actual human observation: the student played the completed variation and
reported, “我试玩过了，我觉得非常好” (“I tried it and think it is very
good”). No move sequence, hint/reset usage, completion result, or comparison
with the reference was supplied, so this supports a positive first impression
but does not yet show whether fog encouraged deliberate exploration.

Classmate observation: **TODO — no classmate observations supplied.**
Original board design/exchange: **TODO — no board code or exchange evidence
supplied; the four original teaching boards are retained.**

### Next decision

Proposed decision rule: keep the current radius if discoveries lead to
explainable plans and players describe the exploration as helpful. If the
main pattern is blind repetition with reported frustration, test radius two
next, holding other rules fixed. If results differ across boards, test more
boards before changing the rule. A small classroom sample cannot establish
a general claim about engagement.

Student's decision after self-play: keep the current version and proceed to a
draft PR. The remaining useful test is an uncoached classmate playthrough that
records what discoveries informed decisions and where uncertainty felt
frustrating.

## AI assistance and human decisions

Codex scaffolded the personal folder, implemented the radius-one fog system,
wrote the automated tests and evidence map, ran browser checks, and organized
this report. The student chose the Fog of War concept, the design question,
and after playing decided the current version was good enough to submit for
review. Known evidence gap: no classmate playtest details or exchanged board
code have been supplied.

## Implementation and checks

- `fog.js` owns exploration state and exposes a masked player observation;
  the copied `engine.js` and `levels.js` remain identical to the reference.
- `app.js`, `index.html` and `fog.css` add fog rendering, accessible unknown
  labels, persistent Undo memory, exploration counts and spoiler notices.
- `tests/fog.test.cjs` covers visibility, complete slide paths, retained
  knowledge, undo, reset, refused actions, hidden mid-slide exits, detached
  observations, hint non-mutation and parity on all reachable teaching-board
  positions. See `rule-source-map.md` for evidence and the test-first failure.
- Owner manifest validation passed; owner tests: **16/16 passed**.
- JavaScript syntax checks passed.
- Browser checks passed: initial 4/49 mapped tiles and hidden exit; blocked
  move unchanged; sliding reveals 6 then 18 tiles; a full-map hint reveals no
  extra tiles; three-move completion reveals 24 tiles; undo retains all 24;
  Reset and Next puzzle return to fresh fog. Hidden cells expose no tile type
  through their DOM classes, child elements or accessibility labels.
- Editor shows the full board; Cancel retains current exploration; painting
  a wall and Check & play starts a fresh solvable custom puzzle. Board export
  includes the edit. A 2 × 6 imported board wins on a hidden mid-slide exit;
  an unsolvable import is rejected without replacing the current game.
- At 375px and 320px widths, no horizontal overflow was observed. Direction
  buttons measure 58 × 48px at 375px. Arrow keys and WASD moved the player;
  both workshop guides preserved move count, including an arrow key while
  focused inside the guide. Physical touch/swipe remains untested.
- Browser console inspection returned no errors or warnings. Trace download
  was triggered; its browser download-event watcher timed out, so the saved
  JSON was verified separately on disk: `fog-of-war`, radius 1, two moves,
  and 18 explored cells matched the visible play trace.
- General Python starter checks are separate from this browser game. With
  Python 3.12, 34 tests passed but provider-test import needs the absent
  `anthropic` package. Offline setup also lacks Pyxel; no live model calls
  were made. These are environment limitations, not requirements to play.

## Independent review

An independent read-only rules reviewer reported **No findings**, reran all
16 owner tests successfully, and confirmed the engine and teaching boards
match the reference byte-for-byte. The review covered the source map, fog
state, UI masking, reset/undo/import, full-map tools, tests and report.
Human experience conclusions and course approval remain with the student
and instructor.
