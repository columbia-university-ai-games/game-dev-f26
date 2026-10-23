# Original rules and evidence

All game rules below are `design`: intentional choices for this original project, not historical claims. Rationale/specification is here and in INTERFACE.md. Implementation/tests will be linked after the initial failing tests and engine exist. The user's Echo Fishery brief is a design reference; no commercial code/assets are copied.

| ID | Rule / reason | Evidence | Specification / test locator |
|---|---|---|---|
| R1 | A legal action advances exactly one fixed world tick; slow thinking is free | design | INTERFACE.md; core timing tests |
| R2 | Illegal actions and pure observation do not mutate the world; runner bounds repeated errors | design | INTERFACE.md; boundary tests |
| R3 | Boat movement uses continuous coordinates and swept public-reef collision | design | INTERFACE.md; geometry tests |
| R4 | Weak/strong sonar produce aging snapshots and world sound; neither tracks hidden entities | design | INTERFACE.md; echo tests |
| R5 | Beacon position, sound profile and delay create limited spatial/temporal opportunities | design | INTERFACE.md; sound tests |
| R6 | Fish and predator respond to perceived sound, with decaying interest and target-switch hysteresis | design | DESIGN.md; sound tests |
| R7 | Steady/strong/slack trade time, tension and sound; the shown cue resolves current action | design | INTERFACE.md; fishing tests |
| R8 | Predator attacks a previously announced fixed corridor; recovery permits escape | design | INTERFACE.md; danger tests |
| R9 | Cut-and-evade is atomic and sacrifices the current fish; no invulnerability | design | INTERFACE.md; danger tests |
| R10 | Captured cargo is distinct from delivered cargo; only an explicit port return banks it | design | INTERFACE.md; outcome tests |
| R11 | Final legal return is resolved before night expiry; empty return is not task success | design | INTERFACE.md; outcome tests |
| R12 | Shared public projection drives human, baseline, model, important audio and replay | design | INTERFACE.md; parity tests |
| R13 | Model calls, invalid outputs and runtime limits are counted outside fixed game time | design | INTERFACE.md; runner tests |
