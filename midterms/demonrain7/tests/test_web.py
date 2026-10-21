"""Opt-in HTTP tests against real native game data; no visible windows."""
import argparse
import base64
import json
from pathlib import Path
import sys
import tempfile
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from catacomb_env import Action, CatacombEnv
from serve_web import GameHost, WebServer

EXE = ROOT / "build/catacomb.exe"
DATA = ROOT / "data/original"


class WebIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not EXE.is_file() or not (DATA / "LEVEL1.CA2").is_file():
            raise unittest.SkipTest("Local native build and original data are required")

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.host = GameHost(EXE, DATA, self.root / "http", max_ticks=200)
        self.token = "test-access-key-" + "x" * 32
        self.server = WebServer(("127.0.0.1", 0), self.host, self.token)
        self.base = "http://127.0.0.1:" + str(self.server.server_port)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=5)
        self.host.close()
        self.temp.cleanup()

    def request(self, path, payload=None, auth=True, extra=None, method=None):
        headers = {"Authorization": "Bearer " + self.token} if auth else {}
        data = None
        if payload is not None:
            headers["Content-Type"] = "application/json"
            data = json.dumps(payload).encode()
        headers.update(extra or {})
        req = Request(self.base + path, data=data, headers=headers, method=method)
        try:
            response = urlopen(req, timeout=15)
        except HTTPError as error:
            response = error
        with response:
            body = response.read()
            if "application/json" in response.headers.get("Content-Type", ""):
                body = json.loads(body)
            return response.status, body, response.headers

    def start(self):
        status, body, _ = self.request("/api/start", {})
        self.assertEqual(status, 200, body)
        return body

    def action(self, session, sequence, action):
        return self.request("/api/action", {"session": session, "sequence": sequence, "action": action})

    def test_no_auth_cannot_start_read_or_control_a_game(self):
        for path, body in (("/api/info", None), ("/api/start", {}), ("/api/observation?session=bad", None),
                           ("/api/action", {}), ("/api/close", {"session": "bad"})):
            self.assertEqual(self.request(path, body, auth=False)[0], 401)
        self.assertEqual(self.host.sessions, {})

    def test_only_allowlisted_assets_are_served(self):
        status, body, headers = self.request("/", auth=False)
        self.assertEqual(status, 200)
        self.assertIn(b"Catacomb", body)
        self.assertIn("frame-ancestors 'none'", headers["Content-Security-Policy"])
        for path in ("/../cat_play.c", "/data/original/LEVEL1.CA2", "/runs/", "/scripts/serve_web.py", "/%2e%2e/cat_play.c"):
            self.assertEqual(self.request(path)[0], 404)

    def test_cross_origin_requests_are_denied(self):
        self.assertEqual(self.request("/api/start", {}, extra={"Origin": "https://unrelated.example"})[0], 403)
        status, _, headers = self.request("/api/start", method="OPTIONS")
        self.assertEqual(status, 403)
        self.assertNotIn("Access-Control-Allow-Origin", headers)
        self.assertFalse(self.host.sessions)

    def test_invalid_actions_and_observation_do_not_advance(self):
        initial = self.start()
        session = initial.pop("session")
        cases = ({"ticks": 0}, {"direction": "teleport"}, {"fire": 1},
                 {"nuke": True, "bolt": True}, {"map": True}, {"ticks": True})
        for action in cases:
            self.assertEqual(self.action(session, 1, action)[0], 400)
            status, result, _ = self.request("/api/observation?session=" + session)
            self.assertEqual(status, 200)
            self.assertEqual(result, initial)
        self.assertEqual(set(initial), {"sequence", "status", "ticks", "width", "height", "png"})

    def test_duplicate_action_is_not_applied_twice(self):
        session = self.start()["session"]
        first = self.action(session, 1, {"direction": "south", "ticks": 8})
        duplicate = self.action(session, 1, {"direction": "south", "ticks": 8})
        self.assertEqual(first[:2], duplicate[:2])
        self.assertEqual(first[1]["ticks"], 9)
        self.assertEqual(self.action(session, 1, {"direction": "north", "ticks": 8})[0], 409)
        self.assertEqual(self.action(session, 3, {"ticks": 8})[0], 409)
        self.assertEqual(self.request("/api/observation?session=" + session)[1], first[1])

    def test_http_and_direct_native_actions_produce_identical_pixels(self):
        initial = self.start()
        session = initial["session"]
        actions = [dict(direction="south", ticks=32), dict(direction="south", ticks=32),
                   dict(direction="east", ticks=16), dict(fire=True, ticks=32),
                   dict(ticks=8), dict(nuke=True, ticks=8)]
        with CatacombEnv(EXE, DATA, self.root / "direct", max_ticks=200) as direct:
            self.assertEqual(base64.b64decode(initial["png"]), direct.initial.png)
            for sequence, action in enumerate(actions, 1):
                status, result, _ = self.action(session, sequence, action)
                self.assertEqual(status, 200, result)
                reference = direct.act(Action(**action))
                self.assertEqual(result["ticks"], reference.ticks)
                self.assertEqual(result["status"], reference.status)
                self.assertEqual(base64.b64decode(result["png"]), reference.png)

    def test_finished_episode_does_not_keep_running(self):
        self.host.max_ticks = 9
        session = self.start()["session"]
        status, ended, _ = self.action(session, 1, {"ticks": 32})
        self.assertEqual(status, 200)
        self.assertEqual((ended["ticks"], ended["status"]), (9, "truncated"))
        self.assertEqual(self.action(session, 2, {"ticks": 4})[0], 409)
        self.assertEqual(self.request("/api/observation?session=" + session)[1], ended)

    def test_session_limit_and_closing(self):
        first = self.start()["session"]
        self.start()
        self.assertEqual(self.request("/api/start", {})[0], 409)
        self.assertEqual(self.request("/api/close", {"session": first})[0], 200)
        self.assertEqual(self.request("/api/observation?session=" + first)[0], 404)
        self.start()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--exe", type=Path, default=EXE)
    parser.add_argument("--data", type=Path, default=DATA)
    args = parser.parse_args()
    EXE, DATA = args.exe.resolve(), args.data.resolve()
    unittest.main(argv=[sys.argv[0]], verbosity=2)
