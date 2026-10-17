# Get Out: Gravity

This variation adds four-direction gravity, jumping, limited air steering, spikes, lava and trampolines. It keeps the reference game’s 7×7 grid, visual style and character.

All game changes are in `minigames/submissions/jianyangg/get-out/`.

## Design and playtesting

### Decisions

I took inspiration from Growtopia’s jumping and hazards. Moving changes gravity automatically, and the character rotates to match. Gravity stays fixed until landing. While airborne, the player can move one block sideways relative to gravity.

Tapping Space produces a small hop. Holding it longer increases jump height, up to a limit. Trampolines provide extra height and appear as flexible planks that bend and recoil when used.

My chosen principle is **a change in perspective**, connected to Schell Chapter 14 and Lens 58: The Puzzle. I want players to treat walls as possible floors and choose landing positions based on what they can do next.

Players start with five hearts. Spikes cost one heart and reset the current level. Lava blocks movement and costs one third of a heart per contact; remaining in contact does not cause repeated damage. Contact triggers a small rebound, and landing on lava again counts as a new contact. Hearts do not refill between levels. Running out restarts the run from level 1.

I left out a countdown timer so players have time to consider their next landing.

### Possible outcomes

I expect players to become more deliberate as they learn the gravity rule: looking for a useful landing surface, choosing a direction, and using their sideways movement to adjust the route. I hope discovering a useful new “floor” feels satisfying.

A different outcome would be repeated guessing or attempts to change gravity while airborne. That could suggest the controls or gravity lock need clearer teaching.

Players might understand the controls but finish without considering different landing positions. That would suggest the routes are too obvious. Finishing without jumping is not automatically a problem: gravity-based solutions and alternative jump routes are intentional.

### Playtest

In my final playthrough (Player A), the game felt fine. Level 1 helped me understand gravity. Level 2 introduced lava and changing direction in mid-air through sideways movement. Figuring out the right combination of moves was not as straightforward, but the level still felt pretty easy, so I did not hit lava much.

What changed my understanding was level 3. On the route I was trying, simply moving up would prevent me from reaching the goal. I had to use the trampoline to jump instead of changing gravity, which was interesting.

These are observations from my own playthrough. Exact heart losses, reset counts and completion times are not included in these observations.

A peer playtest is still pending. I’ll ask Player B to try the three levels in order using the on-screen instructions, without coaching. I’ll record:

- Landing choices and repeated mistakes.
- Attempts to change gravity while airborne.
- Use of jumping, sideways steering and trampolines.
- Heart losses, level resets and completion.

Afterward, I’ll ask: “What were you trying to do?”, “What changed your understanding?” and “Was anything difficult to execute after you knew what to do?”

I’ll keep their actions separate from my interpretation and ask about their experience rather than assuming that hesitation means planning or that completion means satisfaction.

### Next decision

I’ll keep the difference between jumping and changing gravity in level 3. Level 2 still felt easy to me, so I’ll use the peer test to see whether its landing choices are too obvious for someone new.

If players understand the controls but clear the boards too easily, I’ll revise the stopping positions and exit approaches to create more meaningful landing choices.

If they can explain a route but repeatedly miss the movement, I’ll make execution more forgiving. If they misunderstand gravity locking or jump height, I’ll improve the teaching and feedback.

If they discover useful landing surfaces and apply that understanding on later boards, I’ll keep that structure and test it with another player.

I’ll retain five hearts and keep the timer off during testing so I can evaluate the layouts without changing several things at once.

## Validation and known limitations

- Final variation tests: 45 passed, 0 failed.
- Submission validation: passed with `--ready` for `jianyangg`.
- Damage-free route through each board: verified for all three boards using the matching engine and solver.
- Independent review: completed; no unresolved material findings.
- Known gameplay or visual problems: level 2 felt pretty easy in self-play. No unresolved issues were identified in the automated rule and rendering checks; dedicated touch and narrow-screen checks remain pending.
- Peer playtesting is pending. Automated checks establish rule behavior and reachability, not player satisfaction.
