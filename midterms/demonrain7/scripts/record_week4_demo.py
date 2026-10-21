"""Record a short real-engine interface demonstration without opening a window.

This fixed control sequence is a smoke demonstration, not a winning baseline.
"""
import argparse
from dataclasses import asdict
from datetime import datetime
import hashlib
import json
from pathlib import Path
from catacomb_env import Action, CatacombEnv, ROOT
import os


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path, default=ROOT / "data/original")
    parser.add_argument("--exe", type=Path, default=ROOT / "build" / ("catacomb.exe" if os.name == "nt" else "catacomb"))
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    output = args.output or ROOT / "runs" / ("week4-" + datetime.now().strftime("%Y%m%d-%H%M%S-%f"))
    script = [
        ("Walk down the starting corridor", Action(direction="south", ticks=32)),
        ("Continue south", Action(direction="south", ticks=32)),
        ("Turn and move east", Action(direction="east", ticks=16)),
        ("Hold fire to charge", Action(fire=True, ticks=32)),
        ("Release fire", Action(ticks=8)),
        ("Cast one nuke", Action(nuke=True, ticks=8)),
        ("Move south while charging", Action(direction="south", fire=True, ticks=32)),
        ("Release fire again", Action(ticks=16)),
    ]
    frames = []
    with CatacombEnv(args.exe, args.data, output, max_ticks=300, headless=True) as env:
        obs = env.initial
        frames.append({"label": "Initial real level 1", "image": "00000.png", "ticks": obs.ticks, "status": obs.status})
        for label, action in script:
            if obs.status != "running":
                break
            obs = env.act(action)
            frames.append({"label": label, "image": f"{len(frames):05d}.png",
                           "action": asdict(action), "ticks": obs.ticks, "status": obs.status,
                           "sha256": hashlib.sha256(obs.png).hexdigest()})
    record = {"purpose": "Week 4 core-loop and observation/action demonstration",
              "mode": "Original C/SDL2 engine, headless, real .CA2 assets, fixed action script",
              "limitations": "Not a model player, competent baseline, original-DOS fidelity comparison or human playtest.",
              "frames": frames}
    (output / "demo.json").write_text(json.dumps(record, indent=2), encoding="utf-8")
    print(output)
    print(f"{len(frames)} real frames recorded; final tick {obs.ticks}; status {obs.status}")


if __name__ == "__main__":
    main()
