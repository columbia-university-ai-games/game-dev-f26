"""Trusted acceptance route discovery/replay; NOT a fair playing baseline.

Discovery reads the debug map and player state, never edits them. The exported
actions are then replayed through the ordinary, debug-disabled interface.
SPDX-License-Identifier: GPL-2.0-or-later
"""
from collections import deque
from dataclasses import asdict
import argparse
import hashlib
import json
from pathlib import Path

from catacomb_env import Action, CatacombEnv
from debug_env import DebugEnv

MOVES = ((0, 1, "south"), (1, 0, "east"), (0, -1, "north"), (-1, 0, "west"))


def route(grid, start, target, keys):
    queue = deque([start])
    previous = {start: None}
    while queue:
        x, y = queue.popleft()
        if x <= target[0] < x + 2 and y <= target[1] < y + 2:
            path = []
            at = (x, y)
            while previous[at] is not None:
                at, direction = previous[at]
                path.append(direction)
            return path[::-1]
        for dx, dy, direction in MOVES:
            nxt = (x + dx, y + dy)
            nx, ny = nxt
            if nxt in previous or not (0 <= nx < 63 and 0 <= ny < 63):
                continue
            cells = [grid[ny + oy][nx + ox] for oy in (0, 1) for ox in (0, 1)]
            if not all(t in (128, 162, 163, 164, 167) or (keys and t in (165, 166)) for t in cells):
                continue
            previous[nxt] = ((x, y), direction)
            queue.append(nxt)
    raise RuntimeError("No acceptance route found")


def discover(exe, data, output):
    actions = []
    with DebugEnv(exe, data, output / "discovery", max_ticks=6000) as env:
        observation = env.initial
        for number in range(1200):
            if observation.status != "running":
                break
            state = env.debug_command("state")
            p = state["player"]
            target = (18, 19) if not p["keys"] and p["y"] < 40 else (39, 26)
            # After opening the main door, continue toward the original exit.
            if state["map"][45][39] == 128:
                target = (39, 26)
            path = route(state["map"], (p["x"], p["y"]), target, p["keys"])
            direction = path[0] if path else "north"
            nearby = any(o["class"] == 2 and abs(o["x"] - p["x"]) + abs(o["y"] - p["y"]) < 5
                         for o in state["objects"])
            if p["hp"] <= 7 and p["potions"]:
                action = Action(potion=True, ticks=8)
            elif nearby and p["nukes"]:
                action = Action(nuke=True, ticks=8)
            else:
                action = Action(direction=direction, fire=(number % 4 != 3), ticks=2)
            observation = env.act(action)
            actions.append(asdict(action))
        final = env.debug_command("state")["player"]
    result = {"purpose": "privileged acceptance route, not an evaluated baseline",
              "discovery": "read-only debug state; no world edits",
              "status": observation.status, "ticks": observation.ticks,
              "final_player": final, "actions": actions}
    (output / "route.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
    if observation.status != "cleared":
        raise RuntimeError(f"Acceptance discovery ended {observation.status}: {final}")
    return actions


def replay(exe, data, output, actions):
    with CatacombEnv(exe, data, output, max_ticks=6000) as env:
        observation = env.initial
        for raw in actions:
            if observation.status != "running":
                raise RuntimeError("Replay terminated before the recorded final action")
            observation = env.act(Action(**raw))
        result = {"status": observation.status, "ticks": observation.ticks,
                  "actions": len(actions), "debug_enabled": False,
                  "final_frame_sha256": hashlib.sha256(observation.png).hexdigest()}
        (output / "acceptance.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
        if observation.status != "cleared":
            raise RuntimeError(f"Ordinary-interface replay failed: {result}")
        return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--exe", type=Path, required=True)
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--route", type=Path, help="Replay an existing acceptance route without discovery")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    actions = json.loads(args.route.read_text(encoding="utf-8"))["actions"] if args.route else discover(args.exe, args.data, args.output)
    print(json.dumps(replay(args.exe, args.data, args.output / "replay", actions), indent=2))
