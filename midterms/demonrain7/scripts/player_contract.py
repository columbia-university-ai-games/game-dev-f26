"""Public player data and strict output parsing; no game internals or I/O.
SPDX-License-Identifier: GPL-2.0-or-later
"""
from collections import deque
from dataclasses import asdict, dataclass
import json

from catacomb_env import Action, DIRECTIONS, Observation

ACTION_KEYS = set(asdict(Action()))
RESPONSE_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "properties": {
        "action": {"type": "object", "additionalProperties": False,
                   "properties": {
                       "direction": {"type": "string", "enum": list(DIRECTIONS)},
                       **{k: {"type": "boolean"} for k in ("fire", "strafe", "potion", "bolt", "nuke")},
                       "ticks": {"type": "integer", "minimum": 1, "maximum": 32}},
                   "required": sorted(ACTION_KEYS)},
        "intent": {"type": "string", "maxLength": 160}},
    "required": ["action", "intent"]}


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("Duplicate JSON key")
        result[key] = value
    return result


def parse_decision(raw):
    if not isinstance(raw, str) or len(raw) > 12000:
        raise ValueError("Response must be bounded JSON text")
    value = json.loads(raw, object_pairs_hook=unique_object)
    if not isinstance(value, dict) or set(value) != {"action", "intent"}:
        raise ValueError("Expected only action and intent")
    if not isinstance(value["action"], dict) or set(value["action"]) != ACTION_KEYS:
        raise ValueError("Action fields must match the public schema")
    if not isinstance(value["intent"], str) or len(value["intent"]) > 160:
        raise ValueError("Intent must be at most 160 characters")
    action = Action(**value["action"])
    action.command()  # Reject bool-as-int, floats, invalid directions and conflicts.
    return action, value["intent"]


@dataclass(frozen=True)
class Frame:
    png: bytes
    metadata: dict


class PlayerContext:
    def __init__(self, history_frames=0):
        if type(history_frames) is not int or not 0 <= history_frames <= 3:
            raise ValueError("History contains zero to three prior frames")
        self.history = deque(maxlen=history_frames)

    @staticmethod
    def frame(observation, action=None, intent=None):
        # Construct an allowlist; never serialize the environment or its __dict__.
        data = {"status": observation.status, "ticks": observation.ticks,
                "width": observation.width, "height": observation.height}
        if action is not None:
            data.update(action_taken=asdict(action), intent=intent)
        return Frame(observation.png, data)

    def build(self, observation):
        return [*self.history, self.frame(observation)]

    def remember(self, observation, action, intent):
        self.history.append(self.frame(observation, action, intent))


class BudgetExceeded(RuntimeError):
    pass


class CallBudget:
    """Reserve before calling; include failures even when usage is unavailable."""
    def __init__(self, config, max_usd=None):
        self.limits = dict(config["limits"])
        if max_usd is not None:
            self.limits["max_estimated_usd"] = min(max_usd, self.limits["max_estimated_usd"])
        self.input_rate = config["pricing"]["input_usd_per_million"] / 1e6
        self.output_rate = config["pricing"]["output_usd_per_million"] / 1e6
        self.input_reservation = self.limits["input_token_reservation"]
        self.output_reservation = config["max_output_tokens"]
        self.calls = self.tokens = 0
        self.estimated_usd = 0.0
        self.reservation = None

    def reserve(self):
        tokens = self.input_reservation + self.output_reservation
        cost = self.input_reservation * self.input_rate + self.output_reservation * self.output_rate
        if self.reservation is not None:
            raise RuntimeError("Unsettled call reservation")
        if self.calls >= self.limits["max_calls"]:
            raise BudgetExceeded("call_limit")
        if self.tokens + tokens > self.limits["max_total_tokens"]:
            raise BudgetExceeded("token_limit")
        if self.estimated_usd + cost > self.limits["max_estimated_usd"] + 1e-12:
            raise BudgetExceeded("spending_limit")
        self.calls += 1
        self.tokens += tokens
        self.estimated_usd += cost
        self.reservation = (tokens, cost)

    def settle(self, input_tokens=None, output_tokens=None):
        if self.reservation is None:
            raise RuntimeError("No reserved call")
        reserved_tokens, reserved_cost = self.reservation
        self.reservation = None
        known = all(type(n) is int and n >= 0 for n in (input_tokens, output_tokens))
        if known:
            tokens = input_tokens + output_tokens
            cost = input_tokens * self.input_rate + output_tokens * self.output_rate
            self.tokens += tokens - reserved_tokens
            self.estimated_usd += cost - reserved_cost
            if input_tokens > self.input_reservation or output_tokens > self.output_reservation:
                raise BudgetExceeded("provider_usage_exceeded_reservation")
        return {"usage_known": known, "estimated_usd": self.estimated_usd,
                "accounted_tokens": self.tokens, "calls": self.calls}
