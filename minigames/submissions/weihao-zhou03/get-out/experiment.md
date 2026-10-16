# Get Out! The Pursuit: Moving Gates and a Turn-Based Hunter

Adds a hunter to the moving-wall puzzles so that walls control both the
player's route and the pursuit. Includes three pursuit boards and three
walls-only practice boards. Open `index.html` in
`minigames/submissions/weihao-zhou03/get-out/` to play; no build or API key is
required.

## Design and playtesting

### 1. Decisions

I changed the static obstacles into moving gates, added Wait, and then
combined them with one pursuing monster. Each turn follows this order:
player slide or Wait -> gates move -> hunter takes one step. Gates provide
stopping points and block the hunter. Either actor can temporarily hold a
gate by occupying its next target.

This connects to Schell Chapter 14, Principle 10 (perceptual shifts), and Lens
58: an obstacle can become a useful tool. Combining gate timing with pursuit
also applies Principle 7 (combining ideas). The IF YOU WAIT preview,
lethal-Wait warning, and Undo/reset support planning and experimentation.

### 2. Possible outcomes

I expect players to use gates as cover and deliberately time their waits.
If players repeatedly guess or misunderstand the conditional hunter preview,
I would simplify the first encounter or revise the instructions. If they
understand the rules but find captures or repeated waiting frustrating, I
would adjust the spawn positions or gate timing.

### 3. Playtest

In my earlier self-play of the moving-wall version, the game felt harder than
the reference. Moving blocks sometimes left me stuck in corners, while their
movement and previews were generally easy to understand. Wait helped advance
the pattern.

After adding the monster, the game felt harder and less forgiving. I felt I
needed to consider each move more carefully and plan ahead, because moving
without a plan could easily lead to a dead end. There felt like less room for
error during an attempt than in the version without a monster. Undo and Reset
still allow recovery. These are qualitative author observations; specific
completion and capture counts were not recorded.

I would ask Player A to try Borrowed shelter and watch whether they use gates as cover and time their waits.

### 4. Next decision and validation

I would keep the hunter and moving gates. If repeated captures or waiting
feel frustrating, I would adjust the hunter's spawn or gate timing.

Local checks: 43 rule tests passed. Browser checks verified capture,
Undo/reset, and the 11/9/16-turn safe routes.

Some positions require Undo/reset.
All changes stay within my own submission folder.
