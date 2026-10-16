# Get Out! — Think Before You Peek

Owner: `lfg2131` · Principle: `hints` · Status: draft; revised human test pending.

## Design and playtesting

### Decisions

I want players to discover and understand solutions rather than follow answers.
My first intervention applies Schell's Chapter 14 / Lens 58 — The Puzzle by
replacing immediate next-move hints with three optional requests:

1. **Think:** a question about stopping positions or exit alignment.
2. **Notice:** a truthful feature of a solver-verified route, without naming the
   next direction; a truthful generic fallback covers other cases.
3. **Reveal:** clearly labeled direct help giving the solver's next move.

Moves and undo restart progression; blocked moves preserve it. Request totals
survive moves/undo; reset or board load starts a fresh counter and trace.
Completion disables hints; unreachable states offer undo/reset guidance. Hints
remain optional and never change the board or move the player.

**Actual observation — initial informal test, Player A:** The rules were easy
to understand. The beginning was much too easy; later puzzles required somewhat
more thinking but were still insufficiently challenging. Player A never used
hints and wanted more puzzles and significantly harder beginning and ending
challenges. No completion statistics, move counts, timings, or verbatim comments
were supplied.

**Interpretation:** This test did not establish whether progressive hints were
useful because the participant never needed assistance. This fits possibility C
below; it does not establish that hints are unnecessary or that other players
would find these boards easy.

**Next design decision:** Increase difficulty and variety to ten boards,
preserving Think → Notice → Reveal and the original sliding rules, exit
crossing, editor, exchange, controls, undo/reset, and offline play. The candidate
`get_out_challenge_levels.js` was not found in Downloads, so independently
generated layouts provide the sequence instead. Verified shortest lengths are
7, 7, 8, 8, 9, 9, 10, 11, 12, and 15 moves. See
[puzzle-design.md](puzzle-design.md) for stopping relationships and detours;
solution length alone does not establish human difficulty.

This is a **second intervention**: changing puzzles after changing assistance.
More hint use would not establish that the hint design improved. Difficulty,
familiarity, and board order could change usage independently. A fresh human
playtest is necessary.

### Possible outcomes

**Original prediction:** Some players will solve or make meaningful progress
after Think or Notice without needing Reveal. An explanation of how a stopping
point changed their plan would support understanding more strongly than
completion alone.

- **A — All three immediately:** early clues may be too vague, irrelevant, or
  difficult to apply.
- **B — Finish without explaining clues:** completion may reflect following
  directions or trial and error rather than understanding.
- **C — No hints:** the board may be too easy or familiar; an unused feature
  cannot establish its usefulness.
- **D — Frustration with extra requests:** disclosure may add friction without
  enough reasoning benefit. Confirm through actual comments and questions,
  rather than infer feelings from traces.

Only Player A's supplied feedback is observed; these remain possible
interpretations, not additional results.

**New hypothesis:** More demanding puzzles will create opportunities to observe
whether players use Think, Notice, or Reveal and whether those hints improve
their reasoning. Look for explained plans after clues and transfer to unfamiliar
boards. Increased usage alone is insufficient.

### Playtest

**TODO — prior course activities:** manually play the reference, initially
without hints; note discoveries and the effect of its immediate answer. Design
a board, verify with **Check & play**, save its code, exchange with a classmate,
play theirs, and observe them playing yours without coaching. The informal
feedback does not establish completion of these activities.

For the revised sequence:

1. Give anonymous **Player B** unfamiliar opening, middle, and late boards,
   beginning at the opening. Provide on-screen instructions without coaching or
   requiring think-aloud. Do not assume they complete every board.
2. Record version, board codes, order, prior exposure, hint stages and subsequent
   actions, successful/blocked moves, undo, resets, and completion. Keep actual
   decisions or voluntary remarks separate from interpretations of clue use.
3. Download traces before resets/board changes clear them. Keep anonymous notes;
   traces do not show whether someone understood a clue.
4. Ask **“What were you trying to do?”** and **“What changed your understanding?”**
   Record actual answers without leading questions.
5. To isolate hint design later, compare immediate and progressive hints using
   comparable unfamiliar boards of the same difficulty, different players or
   alternated order across pairs. Replaying known solutions introduces practice
   effects; matching shortest lengths alone does not match human difficulty.

For each attempt, supply these currently unfilled fields: player/version/code/
order; prior familiarity; actions and hint stages; completion and actual remarks;
both follow-up answers; then interpretation, competing explanation, and next
decision. Do not invent statistics, quotes, feelings, or outcomes. A small
classroom sample remains exploratory.

### Next decision

The current decision keeps hints unchanged while testing challenge and fairness.

- **Expected outcome:** retain early clues if they prompt explained progress;
  test transfer on another unfamiliar board.
- **A:** revise one ignored clue toward a more usable relationship, then retest.
- **B:** ask for a plan on a fresh related board; revise clues if success still
  depends on Reveal without explanation.
- **C:** inspect familiarity and individual layouts before making boards harder
  again or changing hints.
- **D:** improve early-clue usefulness first; consider an optional direct-reveal
  shortcut only as a separate later experiment if friction persists.

If apparently harmless choices repeatedly cause confusing recovery, revise that
layout first. Retain detours players can explain as fair discoveries. No revised
human result is claimed; the student supplies notes and the next interpretation.

## Implementation and technical checks

Historical evidence for the four-board revision is preserved in
[commit d5e6652](https://github.com/columbia-university-ai-games/game-dev-f26/blob/d5e6652/minigames/submissions/lfg2131/get-out/experiment.md).
Owner validation, 22 minigame tests, JavaScript syntax, 43 repository tests,
offline/headless diagnostics, and desktop/mobile Chrome checks passed on the
final runs. Initial Python dependency and setup authentication failures were
resolved before those passes. Offline diagnostics were partial Setup
Verification; no live provider call occurred. Historical review found no
substantive issues. These results do not substitute for checks of this revision.

### Current checks: ten-board revision

| Executed check | Actual result |
| --- | --- |
| `python3 scripts/minigames.py check --owner lfg2131` | Passed: one valid submission. |
| `python3 scripts/minigames.py test --owner lfg2131` | All 28 tests passed; zero failures. |
| `node --check` for all four game scripts and four test files | All eight passed. |
| `uv run --frozen python -m unittest discover -s tests -v` | All 43 repository tests passed. |
| `uv run --frozen python -m course_game.setup_check --offline --headless` | Passed; partial Setup Verification, no live provider call. |

Independent stopping-graph traversal verifies the ten minimum lengths, winning
replays and solver consistency at all 200 reachable positions (190 nonterminal).
Every position retains a route. Tests check 600 hint outputs, including terminal
responses, and retain arbitrary custom-board/trap coverage. Navigation tests
exercise all ten levels, labels, final completion, selection, undo/reset, hint
counts and trace clearing. Layout checks establish closer-looking but suboptimal
choices and several detours/choice points in the finale.

Headless Chrome passed at 1280 × 900 and 320 × 740 with touch: all ten puzzles
completed without hints, each board's three hint stages matched the hint API,
and undo/reset and terminal controls worked. Desktop Next traversed the sequence;
mobile selection, touch buttons and a real swipe worked. JSON trace download,
editor/cancel/wall painting, export/reload, invalid imports, custom trap recovery,
both guides, reduced motion and accessibility attributes passed. All boards fit
without horizontal overflow; no page errors or external requests occurred.
Offline local-file play exercised the finale's hints. Layout/route diagrams and
desktop/mobile screenshots were inspected. The in-app browser was unavailable;
a separate temporary Playwright/Chrome session supplied these browser checks.

A fresh reviewer independently checked movement/BFS, all positions and hint
stages, navigation, documentation and scope. No substantive findings or fixes
were required. It confirmed `engine.js`, `app.js`, `hints.js` and `style.css`
unchanged from the previous revision. It noted shared circuit motifs and a
partly forced opening in the finale as human-testing limits; later choices and
reused wall stops support planning, without proving perceived difficulty.

Known limits: clues describe one shortest route; on simple boards a clue may make
the answer obvious. Progress/traces remain in memory until downloaded. Complete
screen-reader-only usability and human difficulty/usefulness of the new sequence
remain unverified. Player B should assess whether repeated circuit ideas feel
sufficiently varied and whether the late setups reward planning rather than
repeated guessing.

## AI assistance and human decisions

The student supplied the original design, predictions, questions, actual
qualitative feedback, and decision to increase difficulty. Codex generated
code/tests and replacement board candidates, structured documentation, and
arranged independent technical review. Solver/layout analysis is design evidence,
not human observation. No runtime model, paid service, or network is required.

**TODO — student:** confirm reference/exchange activities; conduct Player B's
test; supply anonymous notes, interpretation, and a retain/revise decision.
Keep PR #28 draft until the revised evidence and ready check are complete. The
student retains accountability; the instructor controls merging. No gate
approval or merge was performed.
