# Catacomb II debug panel

October 12, 2026: explicit developer controls were added to the native engine and exposed in the browser. Codex implemented the controls and ran the automated checks below. No human playtest or model call is claimed.

## Open the panel and restore normal play

On the new game page, click **Debug panel**, choose a level, and click **Start debug session**. This starts a new game and pauses it. Change values, click the relevant **Apply** button, then **Resume** or **Advance one step** to inspect the result. **Read current values** pauses play before reading, so the values do not change while you edit them.

**Restart with original rules** closes the debug process and starts a normal level 1 session with the original map, inventory, enemies, and defaults. **Reset type values & toggles** only resets type parameters, freeze/wall-bypass settings, and invincibility. It does not undo map edits, inventory changes, existing object HP, or spawned enemies.

## Available controls

| Area | Controls and ranges |
| --- | --- |
| Player | HP 0–127; score 0–9,999,999; invincibility; position; direction; cooldown 0–255 ticks |
| Inventory and attacks | Keys, potions, bolts, and nukes: 0–9,999 each; charge 0–13; burst remaining 0–99 |
| Type parameters | Action threshold, base HP, damage, and points for the player, six enemy types, normal shots, charged shots, and enemy projectiles; optionally apply HP to existing objects of that type, excluding the player |
| Objects | Spawn six enemy types on clear floor; edit existing objects' HP, position, direction, active state, and cooldown; remove an object or clear enemies/projectiles |
| Map | Inspect the full 64×64 map; select coordinates; place floors, walls, breakable walls, potions, scrolls, keys, doors, and treasure; teleport the player |
| Time and toggles | Pause/resume; advance 1–32 ticks; freeze enemies or projectiles; walk through walls |
| New session | Select original levels 1–30; set a budget of 1–1,000,000 ticks; each level remains a separate episode ending at an exit |
| Presets | Export/import JSON containing player, inventory, type parameters, and toggles |

Values respect the old engine's data types. HP is a signed 8-bit value, so its maximum is 127. The original health bar still shows at most 13 segments, and a potion sets HP back to 13. Setting HP to zero causes death; restoring positive HP can revive the player. Reaching the tick budget or leaving the level still requires a new session.

The **action threshold** is compared with a random value from 0 to 255 on an object update; it is not pixels per second. Zero prevents actions, while 256 always passes that check. Cooldowns and each object's behavior still apply. Newly spawned enemies use the type's current base HP; existing HP stays unchanged unless the apply-to-existing option is selected.

Teleporting normally requires a clear 2×2 floor area. Wall bypass skips that check, but it also skips collision-based pickups, doors, and exit triggers. Turn it off when testing those rules. The outer map boundary is locked, and enemies need enough floor space for their size. Tile edits affect only the current process's memory; they do not write to `.CA2` files.

Preset JSON is not a saved game. It excludes the map, object list, tick history, RNG state, and level progress. Import applies values in several requests; after a connection failure, read the current values to see which changes completed.

## Player and developer boundaries

Without `--debug-tools`, the native process rejects all `debug` commands. Normal HTTP sessions return 403 for `/api/debug`. `CatacombEnv` defaults to the restricted pixel/action interface; `DebugEnv` is a separate developer wrapper.

The browser access key belongs to the human operator and permits creating debug sessions. It is not a playing-agent credential. For formal evaluation, a trusted harness must create a normal `CatacombEnv` and expose only `observe/act`, without `DebugEnv`, the browser key, or filesystem/process tools.

Debug runs record `debug_mode: true` in `configuration.json`. Reads and edits are logged in `debug-events.jsonl` with the timestamp, operation, values, and acceptance status. Normal actions still appear in `trace.jsonl`. Keep debug runs out of normal evaluation results.

## Build and verification

The extension adds `debug_tools.c/.h`, connects the flag and commands in `agent_bridge.c`, and adds default-off freeze/wall-bypass checks plus a health-bar display clamp in `cat_play.c`. The old `build/catacomb.exe` is preserved. The new `build-debug/catacomb.exe` has SHA256:

`b4011da97d7c86771e6b028aa5b1e778b26525a40c2e239612adbee2e8322e2d`

Build the same source using the project's existing compiler and SDL2 setup, optionally changing the CMake output directory to `build-debug`. The local `.tools/build-debug.cmd` records the MSVC/Ninja commands used on Windows. macOS can build the same source using the existing Mac instructions.

```powershell
python scripts/serve_web.py --exe build-debug/catacomb.exe --share --port 8766
python tests/test_debug.py
python tests/test_web.py --exe build-debug/catacomb.exe
$env:CATACOMB_WEB_URL='http://127.0.0.1:8766'
python tests/test_web_input.py
```

Passed: 3 CTest groups, 7 debug/native regression tests, 8 real-game HTTP integration tests, and 6 browser input tests. In normal mode, the initial frame and five action results matched the earlier binary. This is a regression check of a selected sequence, not proof of full-game fidelity.

`scripts/check_debug_browser.py` reads the full private URL from stdin and uses headless Chromium to check player values, toggles, type parameters, object creation/removal, tile editing, teleporting, stepping, preset import/export, normal-mode restoration, level 30 loading, and a 390px mobile layout. Screenshots and reports are saved in `runs/debug-browser-check/`. It does not control desktop windows; these checks do not establish compatibility with actual Mac/Safari hardware.

This panel is a development tool. It does not expand the agreed coursework scope or replace the model player, baseline, or required evaluation records.
