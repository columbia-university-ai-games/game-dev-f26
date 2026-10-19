## Get Out: Misdelivered Stamp

**Zixuan Yang · UNI: zy2786**

Open `minigames/submissions/alicey66/get-out/index.html` in a browser. The first two boards include example stamps. All PR changes are in this submission folder.

## Design and playtesting

### Decisions

I changed board exchange into a small negotiation over the author’s intention. The author places up to two stamps and chooses Stop, Turn, or Detour; the player can open a stamp after stopping on it, or leave it alone. The game compares labels rather than declaring an interpretation correct. A position can reasonably fit more than one label. Geometry highlights use the same rules for every label, so they offer context without encoding the author’s answer.

A mismatch records the judgment, then previews a position change to one of the last three distinct normal stops, excluding the current position. This adds a cost to opening a stamp while leaving escape independent of stamp collection. I drew on Schell Chapter 14/Lens 58 through the course guide’s useful-hint exercise. My question is whether risk encourages closer attention to an author’s clue or makes that clue something to avoid.

### Possible outcomes

I expect some players to plan a stop, inspect its geometry, and explain why the author marked it. Others may skip stamps after seeing a mismatch. That would suggest the risk competes with the exchange of ideas. Low agreement with a reasonable explanation would point to ambiguous labels; high agreement without a useful subsequent move could reflect guessing. With three choices and only two stamps, match counts are descriptive, not evidence of learning. First judgments and retries after Reset are reported separately.

### Playtest

I would ask Author B to mark a board and state the intended idea privately, then watch Player A try it without coaching. Both receive the same short label definitions and risk explanation. I would record stamp arrivals, opening or skipping, pauses around highlights, first judgments, Undo, Reset, and the next moves. Afterwards I would ask, “Why do you think the author marked that stop?” and compare the explanation with the author’s intention. These are planned observations. A later comparison with a similar unfamiliar board without the position-change consequence, with order reversed across pairs, could examine the role of risk; this first session alone cannot establish that risk caused avoidance.

### Next decision

If players avoid stamps, I would test a consequence-free first mismatch. If their explanations are sensible but labels disagree, I would revise the definitions before adding labels or accepting multiple answers. Frequent immediate Undo would prompt a review of the position-change cost; frequent Reset would prompt a review of one-guess-per-round feedback. I would keep the feature only if the discussion reveals more than label guessing.

Local checks pass: 24 game tests, 83 repository tests, and browser checks at 320/390/1280 px. Tests cover exchange, preview locks, candidate selection, two-step Undo, Reset audit, returned-trace summaries, and all four escape routes. Known limits are label overlap, small samples, session-only statistics, and the tension between randomness and a deterministic puzzle. Stamp codes require this variation; original board text still loads. Remote CI is checked separately on the PR.
