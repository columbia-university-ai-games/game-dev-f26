# Misdelivered Stamp: design and verification

**Zixuan Yang · UNI: zy2786**

## Design question and prediction

Does a cost for mismatching an author’s intention invite closer observation, or make an optional clue something to avoid? A recipient may deliberately reach a stamp, inspect the geometry and explain a useful relationship. Alternatively, they may bypass stamps, guess labels, or give a reasonable explanation that differs from the author’s category. These outcomes would call for different revisions.

The course guide’s useful-hint exercise, informed by Schell Chapter 14/Lens 58, is the design starting point. Stop/Turn/Detour describe author choices, not exclusive truths. Matching is not a comprehension score. A uniform three-way guess has expected agreement 1/3; two stamps provide descriptive counts only.

## Planned player session and next decision

Author B marks a board and privately states the intended idea at each stamp. Player A receives the shared label definitions and the consequence explanation, then plays without coaching. Record stamp arrivals, opening/skipping, pauses around highlights, first judgments, Undo, Reset and subsequent moves. Ask why the author marked the stop and compare the explanation with the stated intention. These are proposed observations, not measured player outcomes.

If players avoid stamps, test a consequence-free first mismatch. If agreement is low but explanations are reasonable, revise definitions. If immediate Undo dominates, reconsider the position-change cost. Frequent Reset calls for clearer one-guess-per-round feedback. A later marked-board comparison with and without the consequence, using comparable unfamiliar boards and reversed order across pairs, could test risk more directly. One session cannot attribute avoidance to risk alone.

## Rule evidence and boundary

All new stamp rules are marked **assumed** designer choices in `rule-source-map.md`. The central tests were written before implementation and initially failed because `stamps.js` did not exist. Ordinary slides, blocked actions and crossing the exit preserve the reference behavior. Stamp/session state is owned by the pure rules module; UI handlers request validated transitions.

The student solver adds one winning-successor check. This is needed if a non-winning teleport lands on a previously visited exit: a later normal leave-and-return route must still be recognized by hints. A regression test reproduces that case. Optional stamps never need to be judged to follow an escape hint. Author labels do not affect geometry highlights or normal escape routes.

Actual normal-slide stops remain in the candidate history after Undo; teleport and Undo add no stops. A mismatch is audited before the preview. Confirmation samples uniformly from at most three distinct candidate positions. The recorded judgment survives both steps of Undo. Reset clears the round while retaining session judgments, trace and Reset count; board load/edit/reload starts a new session.

## Local checks

- Submission validation passes; all 24 game tests pass.
- All 83 repository tests pass in the locked Python environment.
- Browser workflows pass at 320/390/1280 px with no page errors or horizontal overflow: optional opening, skip/revisit, matching, mismatch preview locks, one- and three-candidate delivery, two-step Undo, Reset and first/retry audit, atomic invalid import, board/stamp exchange, legacy text, local returned-trace summaries, author placement/removal/label changes, label-independent highlights, crossing without opening, no chained stamp offer, keyboard/touch, hints, both guides and all four escape routes.
- Trace export includes judgment audit and Reset events; author exchange excludes session results. The trace reader checks structure and judgment consistency, not tamper-proof provenance or human understanding.
- Levels match the reference. Source edits are confined to `minigames/submissions/alicey66/get-out/`. An independent read-only review found no remaining concrete defects and reran all 24 game tests successfully.

Known limits: overlapping labels, a small number of decisions, page-session-only statistics, and a random consequence layered onto a deterministic puzzle. The preview can contain a single position, so an early mismatch may be deterministic. Human observations and remote CI are separate from local code checks.
