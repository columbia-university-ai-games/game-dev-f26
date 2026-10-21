"""Trusted local harness for CatacombSDL; no model, network or shell tools.

Only Observation and Action belong in the playing agent's context.
The harness owns executable/data paths, process lifetime and trace files.
SPDX-License-Identifier: GPL-2.0-or-later
"""
from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import queue
import shutil
import struct
import subprocess
import threading
import time
import zlib

ROOT = Path(__file__).resolve().parents[1]
DIRECTIONS = {"north": 0, "east": 1, "south": 2, "west": 3,
              "northeast": 4, "southeast": 5, "southwest": 6,
              "northwest": 7, "none": 8}
STATUSES = {"running", "dead", "cleared", "stopped", "truncated"}


@dataclass(frozen=True)
class Action:
    direction: str = "none"
    fire: bool = False
    strafe: bool = False
    potion: bool = False
    bolt: bool = False
    nuke: bool = False
    ticks: int = 8

    def command(self) -> str:
        if not isinstance(self.direction, str) or self.direction not in DIRECTIONS:
            raise ValueError("Unknown direction")
        buttons = (self.fire, self.strafe, self.potion, self.bolt, self.nuke)
        if any(type(button) is not bool for button in buttons):
            raise ValueError("Buttons must be booleans")
        if type(self.ticks) is not int or not 1 <= self.ticks <= 32:
            raise ValueError("ticks must be an integer from 1 to 32")
        if sum((self.potion, self.bolt, self.nuke)) > 1:
            raise ValueError("Use at most one consumable per action")
        return "step " + " ".join(map(str, (DIRECTIONS[self.direction],
                                            *(int(b) for b in buttons), self.ticks)))


@dataclass(frozen=True)
class Observation:
    png: bytes
    status: str
    ticks: int
    width: int = 320
    height: int = 200


def bmp_to_png(data: bytes) -> tuple[bytes, int, int]:
    """Convert SDL's uncompressed 24/32-bit BMP; no image dependency needed."""
    if len(data) < 54 or data[:2] != b"BM":
        raise ValueError("Invalid BMP")
    offset = struct.unpack_from("<I", data, 10)[0]
    dib, width, signed_height, planes, bits, compression = struct.unpack_from("<IiiHHI", data, 14)
    height = abs(signed_height)
    if (dib < 40 or planes != 1 or bits not in (24, 32) or compression != 0
            or not 1 <= width <= 4096 or not 1 <= height <= 4096):
        raise ValueError("Unsupported BMP format")
    stride = ((width * bits + 31) // 32) * 4
    if offset < 14 + dib or len(data) < offset + stride * height:
        raise ValueError("Truncated BMP")
    raw = bytearray()
    for y in range(height):
        row = y if signed_height < 0 else height - 1 - y
        raw.append(0)  # PNG filter: none.
        for x in range(width):
            at = offset + row * stride + x * (bits // 8)
            raw.extend((data[at + 2], data[at + 1], data[at]))

    def chunk(kind: bytes, payload: bytes) -> bytes:
        return (struct.pack(">I", len(payload)) + kind + payload
                + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF))

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b"")
    return png, width, height


def prepare_data(source: Path, target: Path, level: int) -> dict[str, str]:
    """Copy only selected-level resources, excluding saves and control settings."""
    if type(level) is not int or not 1 <= level <= 30:
        raise ValueError("level must be from 1 to 30")
    files = {p.name.upper(): p for p in source.iterdir() if p.is_file()}
    required = ("SOUNDS.CA2", "EGACHARS.CA2", "EGAPICS.CA2", f"LEVEL{level}.CA2")
    missing = [name for name in required if name not in files]
    if missing:
        raise FileNotFoundError("Missing original game data: " + ", ".join(missing))
    target.mkdir(parents=True, exist_ok=False)
    hashes = {}
    for name in required:
        shutil.copyfile(files[name], target / name)
        hashes[name] = hashlib.sha256((target / name).read_bytes()).hexdigest()
    return hashes


class CatacombEnv:
    """One single-level episode. Construct/reset only from a trusted harness."""

    def __init__(self, executable: Path, data: Path, run_dir: Path,
                 level: int = 1, max_ticks: int = 10000, timeout: float = 30,
                 headless: bool = True, debug: bool = False):
        self.executable = Path(executable).resolve(strict=True)
        self.run_dir = Path(run_dir).resolve()
        if type(max_ticks) is not int or not 1 <= max_ticks <= 1000000:
            raise ValueError("max_ticks must be from 1 to 1000000")
        if timeout <= 0:
            raise ValueError("timeout must be positive")
        self.run_dir.mkdir(parents=True, exist_ok=False)
        resource_hashes = prepare_data(Path(data), self.run_dir / "data", level)
        self.resource_hashes = resource_hashes  # Trusted reset verification only.
        self.timeout = timeout
        self.frame = self.run_dir / "frame.bmp"
        self.counter = 0
        self.messages = queue.Queue()
        self.process = None
        self.error_log = None
        self.trace = None
        config = {"protocol": 1, "level": level, "max_ticks": max_ticks,
                  "headless": headless, "debug_mode": debug,
                  "timing": "stepped; paused between actions; initial neutral tick",
                  "executable_sha256": hashlib.sha256(self.executable.read_bytes()).hexdigest(),
                  "resources_sha256": resource_hashes,
                  "started_at": datetime.now(timezone.utc).isoformat()}
        (self.run_dir / "configuration.json").write_text(json.dumps(config, indent=2), encoding="utf-8")
        try:
            self.error_log = (self.run_dir / "game-stderr.log").open("wb")
            self.trace = (self.run_dir / "trace.jsonl").open("w", encoding="utf-8")
            self.process = subprocess.Popen(
                [str(self.executable), "windowed", "640", "400", "--agent", "--level", str(level),
                 "--max-ticks", str(max_ticks), "--frame-file", str(self.frame)]
                + (["--headless"] if headless else []) + (["--debug-tools"] if debug else []),
                cwd=self.run_dir / "data", stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                stderr=self.error_log, text=True, encoding="utf-8", bufsize=1,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0)
            threading.Thread(target=self._read_stdout, daemon=True).start()
            self.initial = self._receive(None, time.monotonic())
        except BaseException:
            self.close()
            raise

    def _read_stdout(self):
        try:
            for line in self.process.stdout:
                self.messages.put(line)
        finally:
            self.messages.put(None)

    def _receive(self, command, started) -> Observation:
        try:
            line = self.messages.get(timeout=self.timeout)
        except queue.Empty:
            self.close()
            raise TimeoutError("Game did not respond; inspect game-stderr.log") from None
        if line is None:
            code = self.process.wait(timeout=2)
            raise RuntimeError(f"Game exited with code {code}; inspect {self.run_dir / 'game-stderr.log'}")
        result = json.loads(line)
        if "error" in result:
            self.trace.write(json.dumps({"command": command, "error": result["error"]}) + "\n")
            self.trace.flush()
            raise ValueError(result["error"])
        if (set(result) != {"protocol", "status", "ticks", "width", "height"}
                or result["protocol"] != 1 or result["status"] not in STATUSES
                or type(result["ticks"]) is not int or result["ticks"] < 1
                or (result["width"], result["height"]) != (320, 200)):
            raise RuntimeError("Unexpected observation schema")
        png, width, height = bmp_to_png(self.frame.read_bytes())
        if (width, height) != (320, 200):
            raise RuntimeError("Unexpected frame dimensions")
        filename = f"{self.counter:05d}.png"
        (self.run_dir / filename).write_bytes(png)
        self.counter += 1
        self.trace.write(json.dumps({**result, "command": command, "frame": filename,
                                    "response_seconds": time.monotonic() - started}) + "\n")
        self.trace.flush()
        return Observation(png, result["status"], result["ticks"])

    def _request(self, command: str) -> Observation:
        if self.process.poll() is not None:
            raise RuntimeError("Game is not running")
        started = time.monotonic()
        self.process.stdin.write(command + "\n")
        self.process.stdin.flush()
        return self._receive(command, started)

    def observe(self) -> Observation:
        return self._request("observe")

    def act(self, action: Action) -> Observation:
        return self._request(action.command())

    def close(self):
        if self.process is not None:
            if self.process.poll() is None:
                try:
                    self.process.stdin.write("quit\n")
                    self.process.stdin.flush()
                    self.process.wait(timeout=2)
                except (OSError, subprocess.TimeoutExpired):
                    self.process.kill()
                    self.process.wait()
            for stream in (self.process.stdin, self.process.stdout):
                if stream:
                    try:
                        stream.close()
                    except OSError:
                        pass  # A crashed child may have broken its pipe already.
        if self.error_log:
            self.error_log.close()
        if self.trace:
            self.trace.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


def main():
    parser = argparse.ArgumentParser(description="Native Catacomb II launch / interface smoke test")
    parser.add_argument("--data", type=Path, default=ROOT / "data/original",
                        help="Original .CA2 directory (default: data/original)")
    parser.add_argument("--exe", type=Path, default=ROOT / "build" / ("catacomb.exe" if os.name == "nt" else "catacomb"))
    parser.add_argument("--level", type=int, default=1)
    parser.add_argument("--max-ticks", type=int, default=10000)
    parser.add_argument("--human", action="store_true", help="Play normally with keyboard controls")
    parser.add_argument("--show-window", action="store_true", help="Show the agent run; by default no window or audio is opened")
    args = parser.parse_args()
    run = ROOT / "runs" / datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    if args.human:
        exe = args.exe.resolve(strict=True)
        prepare_data(args.data, run / "data", args.level)
        print("Local run directory:", run)
        raise SystemExit(subprocess.call([str(exe), "windowed", "640", "400", "--single-level",
                                         "--level", str(args.level)], cwd=run / "data"))
    with CatacombEnv(args.exe, args.data, run, args.level, args.max_ticks,
                    headless=not args.show_window) as env:
        observations = [env.initial]
        # Smoke test only: this is not a competent baseline or model-driven player.
        for action in (Action(fire=True, ticks=16), Action(ticks=8),
                       Action(direction="east", ticks=8), Action(ticks=8)):
            if observations[-1].status != "running":
                break
            observations.append(env.act(action))
        for obs in observations:
            print(f"{obs.status}: tick {obs.ticks}; {len(obs.png)} PNG bytes")
    print("Local screenshots, configuration and trace:", run)


if __name__ == "__main__":
    main()
