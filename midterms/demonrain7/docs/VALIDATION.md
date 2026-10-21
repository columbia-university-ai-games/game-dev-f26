AI-use disclosure: On October 12, 2026, Codex implemented the changes and performed the checks below.

# Validation record — 2026-10-12

## Environment and build

Windows x64; MSVC 19.50 / VC toolset 14.50.35717; Debug CMake/Ninja build; SDL2 2.32.10 from its [official release](https://github.com/libsdl-org/SDL/releases/tag/release-2.32.10); local Miniconda Python. Upstream commit: `473d13629a2350e2498dd4a158e5bd0b36184160`.

The original resources are now present in `data/original/`. Source adaptation remains C/SDL2. No browser or interactive desktop was operated during this repair; native tests use dummy SDL video/audio drivers.

Local tools (other machines should use their own installations):

```text
D:\CODE\Env\VS_Code_BuildTools\Product\VC\Auxiliary\Build\vcvars64.bat
D:\CODE\Env\VS_Code_BuildTools\Product\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe
D:\CODE\Env\VS_Code_BuildTools\Product\Common7\IDE\CommonExtensions\Microsoft\CMake\Ninja\ninja.exe
D:\CODE\Env\miniconda\python.exe
```

`cmake --build build` passed. The resulting native executable and the two native test programs were used for the checks below. Local compilation details remain in ignored `.tools/build-validation.log`.

## Executed checks

Final local CTest pass at approximately 17:46 America/New_York:

```text
agent_protocol                         Passed
game_rules_and_observation_boundary     Passed
python_interface                       Passed
100% tests passed, 0 tests failed out of 3
```

The Python group contains 3 tests. Native groups have multiple assertions.

- Protocol: allowed commands, integer/button bounds, malformed requests, overflow, unsupported controls, conflicting consumables and atomic rejection.
- Real upstream rule functions with controlled fixtures: key pickup; no-key blockage; connected door consumes one key; wall/floor collision; lethal damage; normal exit and two-digit warp.
- Pixel export: 320×200 BMP; identical framebuffer produces identical bytes despite changed hidden map/object state.
- Windows regressions: reading CRLF, Ctrl-Z, NUL and 0xFF preserves all bytes; missing resources are not accidentally created; numeric/empty/non-ASCII startup arguments are handled without scanning past NUL.
- Python: pixel colors and row order, truncated BMP rejection, action serialization/validation and selected-resource isolation.

Real-resource integration command:

```text
python tests/test_live_game.py --exe build/catacomb.exe --data data/original
```

**5 tests passed in 13.171 seconds** in the final recorded run:

1. Charge/release and movement produce new frames with expected ticks.
2. Missing resources fail before SDL startup, with exit code 2 and named missing files.
3. Observe and rejected commands, including NUL/overlong input, leave ticks and pixels unchanged.
4. The same action sequence from two fresh processes returns identical observations.
5. Tick cap 9 yields `truncated` at tick 9; further step is rejected; observe remains stable.

All real-game processes used by successful integration cases shut down with exit code 0 and empty stderr. These tests inspect the response allowlist and copied runtime files; they do not prove a future model host lacks other access.

Other executed checks: Git whitespace check; `bash -n scripts/build-macos.sh`; `bash -n play-macos.command`; default-data CLI smoke run. The CLI returned ticks 1, 17, 25, 33 and 41 with clean stderr. These shell checks do not establish Mac execution.

## Demonstration evidence

`runs/week4-verified-20261012/` contains 9 original-engine PNGs, trace JSONL, configuration/resource hashes, `demo.json` and empty stderr. Last tick 177, last status `running`.

The sequence moves south/east, charges and releases a shot, casts a nuke, then moves and shoots again. Inspected images show the charged meter, its reset on release, nuke projectiles and the reduced nuke count. The green tiled floor and pink solid areas also appear in a [separate port's screenshot](https://github.com/64kramsystem/catacomb_ii-64k/blob/master/misc/readme_screenshot.png); the visual concern did not justify changing rendering or artwork.

This record is a short interface demonstration, not a model-player run, winning baseline, full-level completion or original-DOS equivalence test.

## Bugs fixed

- `pcrlib_c.c: LoadFile`: replaced `S_IREAD` (permission bit) used as an open flag with `O_RDONLY | O_BINARY`. Windows text mode could alter/truncate original binary resources; the mistaken flag could create a missing file.
- `catacomb.c: US_CheckParm`: stop at NUL while skipping option prefixes, and pass unsigned byte values to ctype. Numeric arguments such as `1` previously let the scan walk past the string and trigger the Debug CRT.
- `cat_play.c: levelcleared`: terminate the warp-number buffer before conversion and clear an invalid second digit.
- Headless mode and stderr diagnostics allow verification without a visible window. Error reporting now retains the native exit code and log path.

## Still unverified / future work

- Full original-level traversal, live door/secret-wall/bolt/healing cases, actual human keyboard and speaker behavior.
- Controlled comparison against the original DOS executable.
- Mac / Apple Silicon build, input, display and sound.
- Other levels: all 30 resource files exist, but this is not a 30-level validation claim. Upstream level-loading issues outside level 1 remain relevant before expanding scope.
- Model-driven player, competent scripted/search baseline, isolated model host, model budgets, memory/history comparison and repeated live-model evaluation.
- Hosted CI, independent review, PR/Asana evidence, peer playtests, final video and tagged release.

See `IMPLEMENTATION_REVIEW.md` for the distinction between this self-check and an independent review.

## Checkpoint rerun — 2026-10-17

A fresh Windows Debug build in `build-checkpoint/` passed all four CTest groups,
including the five real-resource integration cases. Raw CTest output is in
`evidence/checkpoint-windows-ctest-20261017.log`.

The same build passed eight HTTP integration tests and seven developer-tool
tests. The latter include normal-frame comparisons against the previous
`build/catacomb.exe` and rejection of debug commands by ordinary sessions.
Both JavaScript entry files passed `node --check`. No interactive game window
was opened, and existing remote-play services were not restarted.

The checkpoint adds `.github/workflows/checkpoint.yml`: native rule/protocol and
Python interface tests on Linux/macOS plus six mocked browser-input regressions.
See the PR's actual check results for hosted status. These checks require no
original resources or model credentials. They do not establish real-data play
on the student's Mac, a complete level, independent review, or model quality.

Hosted run [39004076085](https://github.com/DemonRain7/catacomb-midterm/actions/runs/39004076085)
passed all three jobs on commit `38f332d0deb95be3ae9e89371a783de7408c4d5c`:
Linux and macOS each passed the three asset-free CTest groups, and the browser
job passed all six input regressions. The GitHub result is saved in
`evidence/checkpoint-ci-20261017.json`. The PR checks page reports subsequent runs.
