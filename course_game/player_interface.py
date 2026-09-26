"""The machine-playable interface: what a playing agent may see and do.

This is the midterm brief's five operations for The Garden Door. The episode
holds the authoritative World; a player gets copies of observations and a list
of action strings, never the World itself.

Design choice, recorded in docs/rule-source-map.md: legal_actions lists only
the actions that change state now, plus "look", and it is computed from what
the current observation already shows. "take key" appears only in the workshop
while the key is visible there; listing it in the hall would tell the player a
key exists before the player has seen it.
"""

from .world import World

PLAYER_ID = "player"
ACTIONS = ("look", "east", "west", "take key", "unlock door", "north")


class GardenDoorEpisode:
    def __init__(self, max_steps: int = 20):
        self.max_steps = max_steps
        self.reset()

    def reset(self, seed: int | None = None) -> dict[str, str]:
        # The Garden Door has no randomness; the seed is kept so a trace can record it.
        self.seed = seed
        self._world = World()
        self.steps = 0
        self.invalid_actions = 0
        self.trace: list[dict[str, object]] = []
        return self.observe(PLAYER_ID)

    def observe(self, player_id: str) -> dict[str, str]:
        _check_player(player_id)
        return self._world.observe()

    def legal_actions(self, player_id: str) -> list[str]:
        _check_player(player_id)
        world = self._world
        if world.won:
            return []
        actions = ["look"]
        if world.room == "hall":
            actions.append("east")
            if world.door_open:
                actions.append("north")
            elif "brass key" in world.inventory:
                actions.append("unlock door")
        elif world.room == "workshop":
            actions.append("west")
            if not world.key_taken:
                actions.append("take key")
        return actions

    def step(self, player_id: str, action: str) -> dict[str, object]:
        _check_player(player_id)
        if self.outcome()["status"] == "terminal":
            return {"accepted": False, "text": "The episode is over.", "observation": self.observe(player_id)}
        if not isinstance(action, str):
            action = repr(action)  # A malformed model reply is an invalid action, not a crash.
        action = " ".join(action.lower().split())
        self.steps += 1
        accepted = action in self.legal_actions(player_id)
        if accepted:
            text = self._world.act(action)
        else:
            self.invalid_actions += 1
            text = "That action is not available now."
        self.trace.append({"step": self.steps, "action": action, "accepted": accepted})
        return {"accepted": accepted, "text": text, "observation": self.observe(player_id)}

    def outcome(self) -> dict[str, object]:
        if self._world.won:
            status, reason, score = "terminal", "reached the garden", 1
        elif self.steps >= self.max_steps:
            status, reason, score = "terminal", "step limit", 0
        else:
            status, reason, score = "ongoing", "", 0
        return {"status": status, "reason": reason, "score": score,
                "steps": self.steps, "invalid_actions": self.invalid_actions}


def _check_player(player_id: str) -> None:
    if player_id != PLAYER_ID:
        raise ValueError(f"The Garden Door has one player, {PLAYER_ID!r}.")
