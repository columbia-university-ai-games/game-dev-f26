# Get Out experiment: erica-ll

Principle: perception

## Prediction (draft from the requested design; student can revise)

I predict players first notice the teleport walls, and try them out to find there effects and usage on level 1. Then, moving on to level 2, they will figure out that only with the teleportation that they can successfully get out. I would question
this if players mistake the OUT wall for a return portal, fail to discover the
required blue pair, or cannot tell how to recover after using the pink pair.

## Implementation

Revision from player feedback: entering an IN wall now teleports the player
onto its matching OUT wall and stops the slide there. OUT walls block movement
from every direction unless the player has just teleported onto that tile; the
player can then move away normally. Both ends of each pair now share a color;
solid IN and dashed OUT borders distinguish their roles. Added engine tests for
landing, blocked approaches from all four directions, and leaving an OUT tile.
The three authored level routes are unchanged. The submission metadata check
passed on a clean temporary copy. In the working tree it currently reports a
stray `.DS_Store` beside the game folder; that unrelated file was left
untouched. Node is not installed, so the JavaScript tests and browser play have
not been checked here.

## Playtest observations

The player used the teleport portals, but instead of what I expected, that in and out both "sits" the icon right on top of themselves, the icon slides right pass them, treating them like an empty slot instead of a wall, or functionally similar to a "start".
The player is therefore confused by the design, and the playtesting ended up with they spending time on figuring out the future pathway that I did not intend to design.

## Interpretation and revision (student writes)

Evidence show that the portal blocks lets the icon freely slides through them. Also, when there are two pairs of teleport in the scene, the same pair of ports are not color-coded with the same color. It confuses the player which corresponds to which, which is not an intended design choice.

## AI assistance and human decisions (student writes)

Codex generated three new levels with new "teleport" blocks, that teleports the icon from the "IN" block to the "OUT" block, but instead of stopping the icon right on the blocks, the icons are automatically "pushed" in the direction of user input before entering "IN" blocks, until the icon hits a wall.

After this playtest feedback, Codex changed the movement rule so teleporting
ends on the OUT tile, blocked OUT-tile approaches act like walls, and both
ends of each pair use the same color.

## Independent review

Reviewer: Codex, independent code review (static inspection).

### Findings

- The revised movement rule is implemented consistently in `engine.js`: entering an IN endpoint lands on its paired OUT endpoint and ends the move; an OUT endpoint blocks other approaches, while movement away from it works. The engine tests include these cases. The level definitions also retain three authored boards, with level 1's portal optional and levels 2–3 requiring the blue pair.
- I found no blocking defect in the authored portal routes or their movement logic by inspection. The endpoints in the supplied levels are wall cells, and the level-three pink detour sends the player back to the upper passage as described.
- The written prediction and exercise label are for `perception`, but the implemented change is primarily a portal-rule clarification and visual pairing change. The report also contains only a brief earlier playtest account; it does not identify the board/version or record the player's actions and completion. This limits what can be concluded about whether the revised colors and rule text improve discovery.

### Checks and follow-up

I inspected the engine, level data, app rendering/undo wiring, and existing engine tests. I did not run tests or open the game in a browser, so runtime behavior and visual contrast remain unverified in this review. The existing automated tests cover landing on OUT, blocked approaches from four directions, and leaving OUT; they do not check the rendered color/IN-versus-OUT distinction.

Resolution: no code change requested from this review. For the next human playtest, record the game revision, which board the player tried, whether they noticed and correctly identified the matching pair, and what happened after teleporting. Consider revising the prediction or explaining how this portal change tests the perception question. Human experience evidence and approval remain with the student and instructor.
