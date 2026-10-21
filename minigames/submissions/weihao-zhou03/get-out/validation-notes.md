# Design and validation notes

Supporting implementation, self-play and local check records. The concise
PR reflection is in `experiment.md`.

## Design and playtesting

### Decisions

I first chose moving walls, one wall step per player turn, more fixed
obstacles, and multiple directions. I then asked for one monster that pursues
and kills the player, with attention to integrating the two mechanics.

The implementation makes gates both stopping points and cover. One turn is
slide/Wait, all gates move, then the hunter walks one shortest-path cell toward
me. Either actor can hold a gate on its next target. Contact, even during a
slide, kills the player; reaching the door alive wins immediately. There is no
real-time pressure. A clearly labeled IF YOU WAIT target and red lethal-Wait
warning make timing readable, while Undo/reset allow experimentation.

This develops Schell Chapter 14, Principle 10 (perceptual shifts), and Lens 58:
an obstacle can become a useful tool. The integration also applies Principle
7 (combining ideas): routing and wall timing now have to work together with
pursuit. Three hunts use the previous layouts, retained as optional wall-only
Practice. Safe optimal targets are 11/9/16 turns, with Wait included. These
rules and placements are design proposals to assess in play, not proven fun.

### Possible outcomes

- Expected: a player deliberately routes behind a gate or lures the hunter onto
  a target, then uses a purposeful Wait or direction change to escape. That
  would support keeping the gate/pursuit interaction.
- Alternative: a player moves or waits repeatedly without predicting either
  actor, or treats the dotted H as an unconditional next move. That would
  suggest simplifying the first encounter or improving the preview wording.
- Alternative: a player understands the rules but finds repeated captures,
  long waiting sequences or the optimal target frustrating. That would suggest
  changing a spawn/rail phase or shortening the relevant corridor, then testing
  a fresh board rather than adding more enemies.

### Playtest: author observations

**Actual author self-play, before the hunter revision:** the moving-wall
variation felt harder than the reference; moving blocks sometimes left me
stuck in corners. Movement and previews were generally easy to understand.
Wait helped advance the pattern. I wanted players to plan their route and
wanted a minimum-turn challenge. Specific completion, hint and board counts
were not recorded. This is qualitative author feedback about the earlier
version. It is not evidence about the new hunter.

**Actual author self-play, with the hunter:** after adding the monster, the
game felt harder and less forgiving. I felt I needed to consider each move
more carefully and plan ahead, because moving without a plan could easily
lead to a dead end. There felt like less room for error during an attempt
than in the version without a monster. Undo/reset still allow recovery.
These are qualitative author observations; specific board, completion and
capture counts were not recorded.

### Next decision

I would keep the hunter and moving gates. If repeated captures or waiting
feel frustrating, I would adjust the hunter's spawn or gate timing.

Known limits: some reachable positions have no safe forward escape; Wait can
be lethal and cannot repair every choice. The hint reports no safe route and
suggests Undo/reset. The map editor does not draw rails, and physical phone
swipes are unverified. Large phase combinations are rejected before searching.

## Technical checks

- 43 passing Node rule tests. Ten initial pursuit tests were written and all
  failed before hunter support; after implementation they pass. New acceptance
  and reachable-state checks cover safe routes, hunter/gate separation,
  conditional Wait previews and distinct hunter cells in the same gate phase.
- All six initial boards are solver-verified; hunt acceptance routes take
  11/9/16 turns and include hunter-held gates. Browser playback completed all
  three alive at their optimal targets.
- Browser checks: blocked inputs, correct Wait target, lethal-Wait warning,
  both slide/pursuit deaths, terminal controls, full-phase death Undo/reset,
  custom hunter editing/cancel/reset, roundtrip exchange, invalid/unsafe-import
  preservation, and old static imports passed. Trace download records both
  capture causes, hunter positions, all gates and restored Undo state.
- Keyboard slide/Wait, safe hint text, guide/text-entry key isolation, hunter
  removal, and the explicit blocked-hunter notice passed browser checks.
  Mobile flow labels remain inside the panel at 351px viewport width with no
  horizontal overflow; the default desktop viewport also fits. Independent
  review reproduced all 43 tests and found one keyboard-editor focus issue;
  that issue was fixed and browser-verified with Space placement. Follow-up
  review found no remaining findings. Current GitHub CI results are shown in the PR checks.
- Earlier shared Python checks had 32 passes and three local environment errors
  (Windows symlink privileges, missing anthropic); the optional Pyxel starter
  also lacks pyxel. Shared code and machine permissions remain unchanged.

Only this author's game folder is modified. Code review and solver checks are
separate from the author's qualitative self-play.
