"""Trusted five-operation adapter for declared, legally reachable starts.

Only Observation and the action schema cross the remote playing boundary.
This object owns files/processes and must never be registered as a model tool.
SPDX-License-Identifier: GPL-2.0-or-later
"""
from copy import deepcopy
from dataclasses import dataclass
import hashlib
import json
from pathlib import Path
import struct
import zlib

from catacomb_env import Action, CatacombEnv, Observation
from player_contract import RESPONSE_SCHEMA

ROOT = Path(__file__).resolve().parents[1]
STOP_REASONS = {"action_limit", "wall_time_limit", "call_limit", "token_limit",
                "spending_limit", "provider_usage_exceeded_reservation",
                "invalid_action_limit", "provider_error", "harness_error", "operator_stop"}


def pixel_digest(png):
    """Hash this adapter's RGB/filter-0 PNG scanlines, not zlib output bytes."""
    if png[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("Expected the adapter's PNG")
    at, parts = 8, []
    while at < len(png):
        size = struct.unpack_from(">I", png, at)[0]
        kind = png[at + 4:at + 8]
        if kind == b"IHDR" and png[at + 8:at + 8 + size] != struct.pack(">IIBBBBB", 320, 200, 8, 2, 0, 0, 0):
            raise ValueError("Unexpected PNG dimensions or format")
        if kind == b"IDAT":
            parts.append(png[at + 8:at + 8 + size])
        at += size + 12
    raw = zlib.decompress(b"".join(parts))
    if len(raw) != 200 * 961 or any(raw[y * 961] != 0 for y in range(200)):
        raise ValueError("Unexpected PNG scanlines")
    return hashlib.sha256(raw).hexdigest()


@dataclass(frozen=True)
class Situation:
    id: str
    split: str
    actions: tuple[Action, ...]
    native_ticks: int
    pixels_sha256: str
    resource_hashes: dict[str, str]


def load_situations(path):
    manifest = json.loads(Path(path).read_text(encoding="utf-8"))
    if manifest["schema"] != 2 or manifest["level"] != 1:
        raise ValueError("Only the declared version-two level-one situations are supported")
    route_path = (ROOT / manifest["route"]["path"]).resolve()
    if not route_path.is_relative_to(ROOT.resolve()):
        raise ValueError("Preparation fixture must stay inside the project")
    route_bytes = route_path.read_bytes()
    route_data = json.loads(route_bytes)
    # Git checkouts may normalize LF/CRLF; pin JSON content, not whitespace.
    canonical = json.dumps(route_data, sort_keys=True, separators=(",", ":")).encode("utf-8")
    if (manifest["route"].get("hash_format") != "canonical-json-v1"
            or hashlib.sha256(canonical).hexdigest() != manifest["route"]["sha256"]):
        raise ValueError("Preparation fixture changed after declaration")
    route = tuple(Action(**raw) for raw in route_data["actions"])
    for action in route:
        action.command()
    cases = {}
    for record in manifest["situations"]:
        count = record["preparation_actions"]
        if type(count) is not int or not 0 <= count <= len(route):
            raise ValueError("Invalid preparation length")
        actions = route[:count]
        if record["expected_native_ticks"] != 1 + sum(a.ticks for a in actions):
            raise ValueError("Preparation tick declaration does not match its actions")
        if record["id"] in cases or record["split"] not in {"development", "held_out"}:
            raise ValueError("Duplicate situation or unknown split")
        cases[record["id"]] = Situation(record["id"], record["split"], actions,
                                       record["expected_native_ticks"], record["expected_pixels_sha256"],
                                       dict(manifest["resources_sha256"]))
    if not cases:
        raise ValueError("No declared situations")
    return cases, manifest


class SituationEnv:
    def __init__(self, executable, data, run_dir, situation, max_ticks=2000,
                 max_actions=80, env_factory=CatacombEnv):
        if type(max_ticks) is not int or not 1 <= max_ticks <= 1000000 - situation.native_ticks:
            raise ValueError("Invalid player tick budget")
        if type(max_actions) is not int or max_actions < 1:
            raise ValueError("Invalid player action budget")
        self.executable, self.data, self.run_dir = executable, data, Path(run_dir)
        self.situation = situation
        self.max_ticks, self.max_actions = max_ticks, max_actions
        self.env_factory = env_factory
        self.native = self.last = None
        self.reset_count = self.actions = 0
        self.reason = None

    @property
    def counter(self):
        return self.native.counter if self.native is not None else 0

    def reset(self, seed):
        if type(seed) is not int or not 0 <= seed < 2**31:
            raise ValueError("seed must be an integer from 0 to 2**31 - 1")
        self.close()
        self.last = None
        self.actions = 0
        self.reason = None
        self.reset_count += 1
        target = self.run_dir / f"reset-{self.reset_count:03d}"
        try:
            self.native = self.env_factory(self.executable, self.data, target, level=1,
                                           max_ticks=self.situation.native_ticks + self.max_ticks,
                                           timeout=15, headless=True, debug=False)
            if self.native.resource_hashes != self.situation.resource_hashes:
                raise RuntimeError("Resources do not match the declared situations")
            observed = self.native.initial
            for action in self.situation.actions:
                if observed.status != "running":
                    raise RuntimeError("Preparation ended before the declared start")
                observed = self.native.act(action)
            if (observed.status != "running" or observed.ticks != self.situation.native_ticks
                    or pixel_digest(observed.png) != self.situation.pixels_sha256):
                raise RuntimeError("Prepared start does not match its declared image and clock")
            # The model/baseline is first invoked only after this point.
            self.last = observed
            self.run_dir.mkdir(parents=True, exist_ok=True)
            record = {"situation": self.situation.id, "seed": seed, "reset": self.reset_count,
                      "preparation_actions": len(self.situation.actions),
                      "native_start_ticks": observed.ticks, "player_start_ticks": 0,
                      "start_pixels_sha256": pixel_digest(observed.png),
                      "max_player_ticks": self.max_ticks, "max_player_actions": self.max_actions}
            (self.run_dir / f"reset-{self.reset_count:03d}.json").write_text(
                json.dumps(record, indent=2) + "\n", encoding="utf-8")
            return self._public()
        except BaseException:
            self.last = None
            self.close()
            raise

    def _ready(self):
        if self.last is None or self.native is None:
            raise RuntimeError("Reset must succeed before using an episode")

    @staticmethod
    def _player(player_id):
        if type(player_id) is not int or player_id != 0:
            raise ValueError("The only player_id is 0")

    def _public(self):
        status = self.last.status
        if self.reason and status == "running":
            status = "truncated"
        return Observation(self.last.png, status, self.last.ticks - self.situation.native_ticks)

    def observe(self, player_id=0):
        self._player(player_id)
        self._ready()
        self.last = self.native.observe()
        return self._public()

    def legal_actions(self, player_id=0):
        self._player(player_id)
        self._ready()
        if self.outcome()["state"] == "terminal":
            return {}
        # Static syntax, including attempted empty-inventory spells. Never
        # expose a hidden inventory/door/map-dependent action mask.
        return {"schema": deepcopy(RESPONSE_SCHEMA["properties"]["action"]),
                "constraint": "At most one of potion, bolt and nuke may be true."}

    def step(self, player_id, action):
        self._player(player_id)
        self._ready()
        if not isinstance(action, Action):
            raise ValueError("Expected a public Action")
        action.command()  # Validate all fields before touching the game.
        if self.outcome()["state"] == "terminal":
            raise ValueError("episode_finished")
        self.last = self.native.act(action)
        self.actions += 1
        if self.last.status == "running" and self.actions >= self.max_actions:
            self.reason = "action_limit"
        return self._public()

    def finish(self, reason):
        """Evaluator-only stop for provider/host budgets; never awards a win."""
        self._ready()
        if reason not in STOP_REASONS:
            raise ValueError("Unknown evaluator stop reason")
        if self.outcome()["state"] == "ongoing":
            self.reason = reason

    def outcome(self):
        self._ready()
        reason = {"running": None, "cleared": "cleared", "dead": "dead",
                  "stopped": "operator_stop", "truncated": "tick_limit"}[self.last.status]
        reason = reason or self.reason
        return {"state": "terminal" if reason else "ongoing", "reason": reason,
                "score": int(self.last.status == "cleared"),
                "ticks": self.last.ticks - self.situation.native_ticks, "actions": self.actions}

    def close(self):
        if self.native is not None:
            self.native.close()
            self.native = None

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
