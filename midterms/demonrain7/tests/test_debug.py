"""Real-data developer controls and default-off regression tests."""
import argparse
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from catacomb_env import Action, CatacombEnv
from debug_env import DebugEnv
from serve_web import GameHost, RequestError

BINARY = "catacomb.exe" if os.name == "nt" else "catacomb"
EXE = ROOT / "build-debug" / BINARY
OLD = ROOT / "build" / BINARY
DATA = ROOT / "data/original"
PLAYER = ("hp", "keys", "potions", "bolts", "nukes", "power", "burst", "score", "god", "x", "y", "direction", "delay")


class DebugTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not EXE.is_file() or not (DATA / "LEVEL1.CA2").is_file():
            raise unittest.SkipTest("A debug-capable native build and original resources are required")

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def env(self, debug=True):
        cls = DebugEnv if debug else CatacombEnv
        env = cls(EXE, DATA, self.root / ("debug" if debug else "normal"), max_ticks=500)
        self.addCleanup(env.close)
        return env

    def test_default_process_rejects_debug_commands(self):
        env = self.env(False)
        for command in ("debug state", "debug flags 1 1 1", "debug player 127 5 5 5 5 13 0 0 1 10 10 0 0"):
            with self.assertRaisesRegex(ValueError, "debug_disabled"):
                env._request(command)
        self.assertEqual(env.observe(), env.initial)

    def test_normal_pixels_match_previous_binary(self):
        if not OLD.is_file() or OLD.resolve() == EXE.resolve() or OLD.read_bytes() == EXE.read_bytes():
            self.skipTest("A separate pre-debug baseline binary is required for this comparison")
        actions = [Action(direction="south", ticks=32), Action(direction="east", ticks=16), Action(fire=True,ticks=32),Action(ticks=8),Action(nuke=True,ticks=8)]
        new = self.env(False)
        with CatacombEnv(OLD, DATA, self.root / "old", max_ticks=500) as old:
            self.assertEqual(new.initial, old.initial)
            for action in actions:
                self.assertEqual(new.act(action), old.act(action))

    def test_player_health_inventory_and_revival_do_not_advance_time(self):
        env = self.env()
        state = env.debug_command("state")
        values = state["player"].copy()
        values.update(hp=127, keys=99, potions=88, bolts=77, nukes=66, power=13, score=7654321, god=1)
        updated = env.debug_command("player", [values[k] for k in PLAYER])
        self.assertEqual(updated["player"], values)
        self.assertEqual(env.observe().ticks, 1)
        values["hp"] = 0
        env.debug_command("player", [values[k] for k in PLAYER])
        self.assertEqual(env.observe().status, "dead")
        values["hp"] = 13
        env.debug_command("player", [values[k] for k in PLAYER])
        self.assertEqual(env.act(Action(ticks=4)).status, "running")
        values["hp"] = 128
        before = env.observe()
        with self.assertRaises(ValueError):
            env.debug_command("player", [values[k] for k in PLAYER])
        self.assertEqual(env.observe(), before)

    def test_freeze_spawn_edit_remove_and_tile_paint(self):
        env = self.env()
        env.debug_command("flags", [1, 1, 0])
        # Construct a safe interior test area only in this disposable debug run.
        for y in range(20,24):
            for x in range(20,24):
                env.debug_command("tile", [x,y,128])
        before_ids = {o["id"] for o in env.debug_command("state")["objects"]}
        state = env.debug_command("spawn", [2,20,20,1])
        spawned = next(o for o in state["objects"] if o["id"] not in before_ids)
        ident = spawned["id"]
        env.debug_command("object", [ident,12,21,21,2,1,0])
        env.act(Action(ticks=16))
        frozen = next(o for o in env.debug_command("state")["objects"] if o["id"]==ident)
        self.assertEqual((frozen["hp"],frozen["x"],frozen["y"]), (12,21,21))
        self.assertNotIn(ident, [o["id"] for o in env.debug_command("remove",[ident])["objects"]])
        state = env.debug_command("tile", [20,20,164])
        self.assertEqual(state["map"][20][20],164)
        with self.assertRaises(ValueError): env.debug_command("tile", [0,20,128])
        with self.assertRaises(ValueError): env.debug_command("spawn", [2,20,20,0])

    def test_class_values_and_defaults(self):
        env = self.env()
        before = env.debug_command("state")
        env.debug_command("flags", [1,1,1])
        state = env.debug_command("class", [2,200,22,12,444,1])
        self.assertEqual(next(c for c in state["classes"] if c["id"]==2), {"id":2,"speed":200,"hp":22,"damage":12,"points":444})
        self.assertTrue(all(o["hp"]==22 for o in state["objects"] if o["class"]==2))
        state = env.debug_command("defaults")
        self.assertEqual(state["classes"], before["classes"])
        self.assertEqual(state["flags"],before["flags"])
        with self.assertRaises(ValueError): env.debug_command("class", [9999999,1,1,1,1,0])
        for malformed in ([], {}, None, 123):
            with self.assertRaises(ValueError): env.debug_command(malformed)

    def test_noclip_stays_inside_safe_camera_bounds(self):
        env = self.env()
        env.debug_command("flags", [1,1,1])
        p = env.debug_command("state")["player"]
        p.update(x=0,y=0)
        env.debug_command("player", [p[k] for k in PLAYER])
        env.act(Action(direction="northwest",ticks=32))
        p = env.debug_command("state")["player"]
        self.assertEqual((p["x"],p["y"]),(0,0))

    def test_web_mode_boundary_and_debug_request_deduplication(self):
        host = GameHost(EXE,DATA,self.root/"web")
        self.addCleanup(host.close)
        normal = host.start()["session"]
        with self.assertRaises(RequestError) as caught: host.debug(normal)
        self.assertEqual(caught.exception.status,403)
        host.end(normal)
        session = host.start(debug=True,level=2)["session"]
        self.assertEqual(host.debug(session)["state"]["level"],2)
        result = host.debug(session,"flags",[1,0,1],"deduplication-123")
        self.assertEqual(host.debug(session,"flags",[1,0,1],"deduplication-123"),result)
        with self.assertRaises(RequestError): host.debug(session,"flags",[0,0,0],"deduplication-123")
        config = json.loads((host.sessions[session].env.run_dir/"configuration.json").read_text())
        self.assertTrue(config["debug_mode"])


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--exe", type=Path, default=EXE)
    parser.add_argument("--baseline", type=Path, default=OLD)
    parser.add_argument("--data", type=Path, default=DATA)
    args = parser.parse_args()
    EXE, OLD, DATA = args.exe.resolve(), args.baseline.resolve(), args.data.resolve()
    unittest.main(argv=[sys.argv[0]], verbosity=2)
