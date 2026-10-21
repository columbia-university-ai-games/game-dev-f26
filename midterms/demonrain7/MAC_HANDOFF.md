AI-use disclosure: Codex prepared and revised this handoff from recorded Windows implementation and checks on October 12 and 17, 2026.

# Continue the Catacomb II checkpoint on a Mac

## Transfer and build

Use this modified checkout, including its adapter and tests. Copy the existing Windows `data/original/` directory to the same relative location on the Mac. Alternatively, extract your already downloaded `Catacomb_II_1991.zip` and copy the `.CA2` files from `Cataco2/`. Keep resources outside Git.

Level 1 requires `SOUNDS.CA2`, `EGACHARS.CA2`, `EGAPICS.CA2`, and `LEVEL1.CA2`. Keep the manual for rule checks. Original resource redistribution permission has not been established.

Prepare Xcode command-line tools and Homebrew:

```bash
brew install cmake sdl2 python
bash scripts/build-macos.sh
python3 scripts/catacomb_env.py
# Only when ready for an interactive window:
python3 scripts/catacomb_env.py --human
```

The script enables real-resource tests when `data/original/LEVEL1.CA2` exists. Build on the Mac; do not reuse Windows `build/` or `build-debug/`. Hosted macOS CI is separate from checking original data, graphics, sound, and input on the student's actual Mac.

## Handoff prompt

Continue my Catacomb II project from this modified checkout. Read `AGENTS.md`, `MIDTERM_README.md`, `docs/INTERFACE.md`, `docs/RULE_SOURCE_MAP.md`, `docs/VALIDATION.md`, and `docs/SUBMISSION.md`. Use English for code, UI, and technical documents.

Preserve the CatacombSDL C/SDL2 engine, original rules and data. Keep the binary-loading, startup parsing, and warp fixes; the observation/action adapter; browser controls; and opt-in developer tools.

Check architecture, compiler, CMake, SDL2, and Python. Build with `bash scripts/build-macos.sh` and record actual results. Fix platform compatibility while preserving rules. Look for resources in `data/original/` and the transferred archive before reporting them missing. Windows or hosted CI success does not prove this machine works.

Run tests headlessly without taking over the desktop. Use `ctest --test-dir build --output-on-failure`. If CTest did not run real-resource integration, run `python3 tests/test_live_game.py --exe build/catacomb --data data/original`. Run `python3 scripts/record_week4_demo.py` and inspect initial, charged-shot, released-shot, and nuke frames plus stderr. The reference already has green floor tiles and pink areas; do not redesign its artwork.

When I am ready, have me run `python3 scripts/catacomb_env.py --human` to check input, audio, doors, items, death, and the first-level exit. Record actual observations. Scope is level 1, original inventory, and death or any original exit ending the episode, matching the Week 3 proposal; see `docs/SCOPE.md`. The revised assignment is due November 7, 2026, at 11:59 p.m. America/New_York.

The implemented player receives only the current 320×200 PNG/HUD, status/ticks,
and permitted recent context. Keep source, hidden state, saves, filesystem tools,
debug tools, and evaluator paths out of its context. Follow `docs/PLAYER.md` and
`docs/EVALUATION.md` for the locked environment and real runs. Use `--player-only`
for human browser sharing; evaluated policies use the separate restricted runner.

Actions last at most 32 ticks; the world pauses between actions; the first picture includes one neutral tick. Observations and invalid commands do not advance state; terminal episodes reject steps. Model and baseline runs must share timing and information. There is no audio in observations. The fixed demonstration is not a competent baseline or model player.

Update the Mac validation record and commands. Use `docs/MIDTERM_CHECKLIST.md` to keep unfinished work explicit. Preserve copyright/license notices. Keep `.claude/`, credentials, resources, and runs ignored. Do not add Co-Authored-By or AI attribution to Git commits. Do not submit graded work, send messages, or publish original resources without an applicable user instruction.
