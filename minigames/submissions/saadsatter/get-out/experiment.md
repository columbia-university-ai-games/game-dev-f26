# Get Out experiment: saadsatter

Principle: entry

## Prediction and Description

I added an optional stopping-point preview so players can see where a slide will end before committing to a move. A dashed ring and text show the destination, and blocked directions are explained.

I expect new players to use the preview to check their assumptions, then become better at predicting stopping points without it.

If I observed players that rely on the rely on the preview instead of learning the movement rule then that would question the prediction.


## Implementation

Changed `app.js`, `index.html`, and `style.css` to preview a slide's destination
on direction-button hover/focus. Optional preview mode lets touch players select
a direction, inspect its destination, then press Slide selected direction.
A dashed ring and text identify the destination; blocked directions are explained.
Preview calls the existing pure `step` function without assigning its result,
so inventory/state, move count, trace, and game rules are unchanged. Actual moves,
undo, reset, completion and editing clear stale previews.

Class `main` was fetched and verified during draft preparation; the branch
had no unrelated commits or tracked differences from that base. Human playtest and learning-transfer evidence

## Playtest observations

One player play tested the feature and didn't realize the new feature was enabled or how to use it.


## Interpretation and Next Step (student writes)

This is not what I predicted, because I assumed people would read the directions but old users wouldn't need this feature and wouldn't read the instructions since the game play is the same unless you click the arrow keys on the screen.

My next step would be, change the core game mechanic to include this feature. So one arrow press on the keyboard will show the dotted lines and another would confirm for the first few levels.


## Independent review

A separate Codex reviewer inspected the variation against the reference.
Engine, levels, and engine tests are unchanged. Preview uses the pure `step`
function without assigning state. Review found that the commit button became
enabled outside preview mode, but lost its selection on direction-button blur.
Resolved by enabling commit only in explicit preview mode. The checkbox label
and README now clarify that keyboard arrows and swipes still move immediately.

## Checks recorded during draft preparation (2026-10-12)

- `python3 scripts/minigames.py check --owner saadsatter`: passed (1 submission).
- `python3 scripts/minigames.py test --owner saadsatter`: all 7 tests passed;
  movement, immutability, blocked actions, exit crossing, terminal states,
  shortest paths, unreachable/invalid boards, observations, and solvable levels.
- Course unittest discovery: 34 tests passed; one module failed to import
  because `anthropic` is not installed. This is not a full-suite pass.
- Offline/headless setup diagnostic: incomplete; reported GitHub authentication,
  Pyxel, and deterministic-test failures. Scripted fixture passed; no live model
  call was made. Separate authenticated GitHub identity lookup succeeded.
- Browser UI check was attempted but blocked by the browser file-URL policy.
  No browser interaction or narrow-screen pass is claimed.
