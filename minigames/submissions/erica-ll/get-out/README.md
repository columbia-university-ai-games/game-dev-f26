# Get Out! — One-way portals

Open `index.html` directly in a browser. No install or network connection is
needed. Move with arrow keys, WASD, swipe, or the on-screen direction buttons.
You slide until a wall or the board edge stops you; crossing the exit wins.

## Portal rules

The portal pairs are fixed in the teaching levels. Enter an **IN** wall to
teleport onto its matching **OUT** wall; the move ends there. Each pair uses the
same color at both ends, with solid **IN** and dashed **OUT** borders to show
their roles. An **OUT** wall blocks entry from every direction, like a regular
wall, but the player can move away from it after teleporting. Level 1's pair is
optional, level 2's blue pair is required, and level 3 adds a pink pair that
sends you back toward the upper passage. Undo and reset work as usual. Custom
boards and the editor retain the original non-portal rules.

## The three boards

1. **A door that does not help:** reach the exit by the same shortest route as
   the original rules; the nearby blue portal is a side possibility.
2. **The only way through:** the solid barrier has no route without the blue
   one-way pair.
3. **A useful route and a bad detour:** the blue pair is required; the pink
   pair sends an entering player back toward the starting side, requiring them
   to route through the blue pair again.

## Checks

From the repository root, run:

```sh
python3 scripts/minigames.py check --owner erica-ll
python3 scripts/minigames.py test --owner erica-ll
```

The portal and board rules are covered by `tests/engine.test.cjs`.
