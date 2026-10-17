# Get Out experiment: howrdwng

Principle: progress

## Prediction

I added a visible trail of stopping positions. This uses the Chapter 14 / Lens
58 idea that a puzzle should give understandable feedback without giving away
the answer. I expect a player to notice repeated routes and try a different
direction sooner. If the dots are ignored, feel cluttered, or are mistaken for
the correct path, that would challenge the design.

## Implementation

`app.js`, `index.html`, and `variation.css` add a small dot to each stopping position
and a truthful explored-stop count. Undo keeps the trail because the stop was
still explored; reset and changing puzzles clear it. The trail is hidden while
editing. Movement, collision, exit, hint, undo, and solver rules are unchanged.

Checks on October 17, 2026: `python scripts/minigames.py check --owner howrdwng`
reported one valid submission, and `python scripts/minigames.py test --owner
howrdwng` passed 7/7 tests. A Chromium browser check confirmed the two-stop
trail, undo, reset, hint, three-move completion, editor, invalid-import error,
and a 390 px layout without horizontal scrolling.

## Playtest observations

Player A tried the variation and reported that the puzzle felt difficult, while
the play flow felt simple. This is qualitative feedback from one player. The
session did not record hint, reset, or completion counts, so no
claim is made about efficiency or whether the trail improved performance.

## Interpretation and revision

The feedback suggests keeping the overall play flow simple, even though the
puzzle itself feels challenging. It does not yet show
whether the exploration trail helped with that difficulty. In the next test I
would watch whether a player uses the dots to avoid repeating routes. If the
difficulty causes abandonment, I would test a short optional clue; if the dots
are mistaken for a solution path, I would reduce their visual weight or revise
the label. One player's response is exploratory evidence, not a general result.

## Independent review

An independent reviewer checked the full student folder, manifest,
experiment write-up, branch boundary, and game behavior. It found no new runtime
logic bug. It confirmed the owner check, 7/7 engine tests, and JavaScript syntax.
It also identified that the copied README still pointed to the instructor game;
those paths now point to this variation. The reviewer kept the qualitative
player feedback separate from browser and rule evidence.
The student and instructor retain approval decisions.
