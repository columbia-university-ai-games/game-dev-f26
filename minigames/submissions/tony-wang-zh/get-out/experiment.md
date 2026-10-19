# Get Out experiment: tony-wang-zh

Principle: parallelism

## Prediction (student writes before building)

Design change: the player now controls two tiles (the original player tile and the exit) and the goal is still to make them meet. The movement mechanism stayes the same (aka has to be stopped by wall). The expectation is that because there will be more moving pieces, the same level will take longer for the player to finish. 

## Implementation

Changed `engine.js`, `app.js`, `index.html`, `README.md`, and
`tests/engine.test.cjs`. Each directional action advances the player and exit
together. Each actor stops independently at a wall or board edge; the player
escapes if both occupy the same square during that slide. Hints and the solver
now track both positions.

Checks run: `python3 scripts/minigames.py check --owner tony-wang-zh` and
`python3 scripts/minigames.py test --owner tony-wang-zh` (7 tests passed).
Browser checks remain to be done.

## Playtest observations

It turns out one can just push one of the two tiles to a corder and then move the other tile towards it. Some puzzles are trivialized this way. 

## Interpretation and revision (student writes)

The player behavior and the expectation was rather the opposite. This might mean this idea was flawed to start with, or that it requires completely different board design. Or, this might mean different board disigns are required to make the new version more engaging, because the baord for the original game are designed in such a way that, the placement of the exit tile and the mvoement mecahnism of the player tile forces the player to be strategic about their movement.s

## AI assistance and human decisions (student writes)

Codex generated code changes for the deliverable. I manually play the game after each iterations. One problem was the green coloring of the board grid was not moving with the exit sign and that has to be fixed. 

## Independent review

TODO: Record reviewer role, issues found, tests or browser checks repeated,
and your resolution. A fresh Codex review can check code; human play supplies
experience evidence. The student and instructor retain approval decisions.
