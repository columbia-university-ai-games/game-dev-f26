# Switchback — Get Out variation

Open `index.html` directly in a browser; no build or account required.

Move with arrows/WASD, swipe, or direction buttons. Slide until a wall, closed gate or border stops you. Entering **T** immediately swaps A/B gates, including during a slide. **A starts closed; B starts open**. Leaving a switch does not retrigger it. Reaching E wins even mid-slide.

Try the tutorial, then **A useful closed door**. **My classroom original** preserves the supplied screenshot board. Gates use letters, solid/dashed borders, text labels and color. Movement is animated continuously, with gate changes shown at switch crossings (reduced-motion preferences are respected). Undo restores gate phase; reset starts A closed and cancels an in-progress slide. Hints search position and phase using the same engine as play.

The board editor and exchange codes support `S E # . T A B`. Codes start in the initial phase and do not save ongoing progress. T/A/B codes require this variation and will be rejected by the shared reference. Copy a code before closing or reloading.

Run tests: `node --test tests/*.test.cjs`.

See `experiment.md` for predictions and the human playtest plan; `docs/rule-source-map.md` for rule evidence. This classroom adaptation retains attribution to Eric Zimmerman's *Get Out!* and the course's original interface. No book artwork or prose was added.
