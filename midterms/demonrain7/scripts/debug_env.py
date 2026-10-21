"""Trusted developer controls. Never expose this object to a playing agent."""
from datetime import datetime, timezone
import json
import queue
from catacomb_env import CatacombEnv

OPS = {"state": 0, "player": 13, "flags": 3, "class": 6, "spawn": 4,
       "object": 7, "remove": 1, "clear": 1, "tile": 3, "defaults": 0}


class DebugEnv(CatacombEnv):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs, debug=True)

    def debug_command(self, op, values=None):
        values = [] if values is None else values
        if (not isinstance(op, str) or op not in OPS or not isinstance(values, list) or len(values) != OPS[op]
                or any(type(v) is not int or not 0 <= v <= 9999999 for v in values)):
            raise ValueError("Invalid debug operation or integer values")
        command = "debug " + op + (" " + " ".join(map(str, values)) if values else "")
        if self.process.poll() is not None:
            raise RuntimeError("Debug game is not running")
        self.process.stdin.write(command + "\n")
        self.process.stdin.flush()
        try:
            line = self.messages.get(timeout=self.timeout)
        except queue.Empty:
            self.close()
            raise TimeoutError("Debug game timed out") from None
        if line is None:
            raise RuntimeError("Debug game exited")
        result = json.loads(line)
        with (self.run_dir / "debug-events.jsonl").open("a", encoding="utf-8") as log:
            log.write(json.dumps({"at": datetime.now(timezone.utc).isoformat(),
                                  "mode": "debug", "op": op, "values": values,
                                  "accepted": "error" not in result}) + "\n")
        if "error" in result:
            raise ValueError(result["error"])
        if result.get("debug") is not True:
            raise RuntimeError("Unexpected debug response")
        return result
