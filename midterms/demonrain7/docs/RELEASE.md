AI-use disclosure: Codex prepared the packaging workflow and run instructions. Recorded validation and remaining human decisions are listed separately.

# Playable candidate and reproduction

Published candidate: [midterm-v0.1.0-rc1](https://github.com/DemonRain7/catacomb-midterm/releases/tag/midterm-v0.1.0-rc1),
source `18d53bc`. [Release evidence](evidence/release-candidate-20261019.json)
records uploaded hashes, passing CI and the extracted binary's full-level replay.

The candidate is a bounded Classic reconstruction. Its automated player code
is included, but live image-model performance remains unverified until Google
authentication is restored. A candidate tag is not a claim that the entire
midterm has been submitted or that instructor scope approval is recorded.

## Windows x64 package

Download the Windows ZIP and `SHA256SUMS.txt` from the repository's release.
Extract the ZIP completely into a writable folder. Do not run it inside the
ZIP viewer. The folder includes `bin/catacomb.exe`, `bin/SDL2.dll`, original
source notices, the complete source snapshot, and launchers.

1. Obtain your own original Catacomb II resources. Existing local copies may
   be used; the recorded archive/source and exact hashes are in
   [ASSET_PROVENANCE.md](ASSET_PROVENANCE.md). The archive's `Cataco2/` directory
   contains the needed files. Public availability is not treated as permission
   to republish them, so no game data is bundled in the release.
2. Place `SOUNDS.CA2`, `EGACHARS.CA2`, `EGAPICS.CA2`, and `LEVEL1.CA2` in the
   extracted `data/original/` directory. With Python installed, verify all four:
   `python scripts/verify_assets.py --data data/original`. A mismatch means the
   file differs from the evaluated version; do not silently call it equivalent.
3. Double-click **PLAY.cmd** for native first-level play. Python, a compiler,
   Google credentials, and paid APIs are not required for this launcher.
   Arrow keys move; Ctrl charges/release fires; Alt strafes; P/Space heals;
   B uses a bolt; N/Enter uses a nuke. Death or an original exit ends this level.
4. Optionally install Python 3.11+ and use **PLAY-IN-BROWSER.cmd**. Open the
   printed `LOCAL_PLAY_URL`, including its access fragment. This host rejects
   debug sessions and hides developer controls. Browser controls are listed
   on the page; browser play has no audio and uses stepped actions.

Close the game window to end native play. Stop the browser server with Ctrl+C.
The browser launcher binds to this computer only; it does not start a public
tunnel. For an authorized peer session, use the documented `--share` option
with `--player-only` and the official Cloudflare tool, then stop it afterward.

## macOS and Linux

Use the source ZIP or check out the release tag. Install a C compiler, CMake,
SDL2 development files and Python 3.11+. Follow [MIDTERM_README.md](../MIDTERM_README.md)
or [MAC_HANDOFF.md](../MAC_HANDOFF.md), verify your four original resource files,
then run `python3 scripts/catacomb_env.py --exe build/catacomb --human`.
Hosted native CI covers both platforms; a recipient's graphics/audio/input
playtest remains separate. Do not run a Windows binary or copy its CMake cache
onto macOS/Linux.

## Reproduce automated checks and players

```sh
ctest --test-dir build --output-on-failure
uv sync --frozen
uv run --frozen python -m unittest discover -s tests -p 'test_players*.py' -v
uv run --frozen python -m unittest discover -s tests -p test_release.py -v
uv run --frozen python scripts/run_episode.py --exe build/catacomb --data data/original --output runs/new-baseline --policy baseline
```

In the Windows package use `--exe bin/catacomb.exe`. See [PLAYER.md](PLAYER.md)
for Vertex setup and [EVALUATION.md](EVALUATION.md) for a bounded repeated suite.
Credentials belong in the authorized local credential store, not the package.
The package does not contain a login, a provider account, or an API key.

## Build and package a new candidate

Run Debug native tests first. Then, in an MSVC developer shell with CMake/Ninja
and the official SDL2 development bundle:

```powershell
cmake -S . -B build-release -G Ninja -DCMAKE_BUILD_TYPE=Release -DCMAKE_MSVC_RUNTIME_LIBRARY=MultiThreaded -DBUILD_TESTING=OFF -DSDL2_DIR="PATH/TO/SDL2/cmake"
cmake --build build-release
python scripts/package_release.py --exe build-release/catacomb.exe --sdl build-release/SDL2.dll --sdl-license "PATH/TO/SDL2/LICENSE.txt" --output .tools/releases/NEW-VERSION --version NEW-VERSION --build-description "Windows x64 MSVC Release, static MSVC runtime, SDL2 2.32.10"
```

Commit tracked changes before packaging. The script archives that exact Git
revision, rejects private/original-resource paths, includes the upstream GPL
and SDL notices, and generates a manifest plus SHA-256 checksums. It never
overwrites an output directory. Inspect and exercise the extracted package
with local resources before attaching it to a tag; keep those resources out
of the uploaded ZIP. Publish matching source alongside the executable.

See [IMPLEMENTATION_TODO.md](IMPLEMENTATION_TODO.md) for the actual release,
validation links and open work. Never label an untested build as final.
