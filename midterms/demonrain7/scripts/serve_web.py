"""Authenticated browser controls for native Catacomb, with opt-in debug sessions.

Normal sessions keep the pixel/action interface; debug sessions expose developer controls.
SPDX-License-Identifier: GPL-2.0-or-later
"""
from __future__ import annotations

import argparse
import base64
from dataclasses import asdict
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import re
import secrets
import signal
import subprocess
import sys
import threading
import time
from urllib.parse import parse_qs, urlsplit

from catacomb_env import Action, CatacombEnv, ROOT
from debug_env import DebugEnv

WEB = ROOT / "web"
MAX_BODY = 4096
ACTION_FIELDS = set(asdict(Action()))


class RequestError(Exception):
    def __init__(self, status, message):
        self.status, self.message = status, message


class Session:
    def __init__(self, env, debug=False):
        self.env = env
        self.observation = env.initial
        self.sequence = 0
        self.last_action = None
        self.updated = time.monotonic()
        self.debug = debug
        self.last_debug_request = None
        self.last_debug_result = None

    def snapshot(self):
        obs = self.observation
        return {"sequence": self.sequence, "status": obs.status, "ticks": obs.ticks,
                "width": obs.width, "height": obs.height,
                "png": base64.b64encode(obs.png).decode("ascii")}


class GameHost:
    def __init__(self, executable, data, runs, max_ticks=20000, idle_seconds=900, allow_debug=True):
        self.executable, self.data, self.runs = executable, data, Path(runs)
        self.max_ticks, self.idle_seconds = max_ticks, idle_seconds
        self.allow_debug = allow_debug
        self.sessions = {}
        # The native bridge is sequential; never interleave requests to a game.
        self.lock = threading.RLock()
        self.closed = False

    def _expire(self):
        now = time.monotonic()
        for key, session in list(self.sessions.items()):
            if now - session.updated > self.idle_seconds:
                session.env.close()
                del self.sessions[key]

    def expire(self):
        with self.lock:
            self._expire()

    def start(self, debug=False, level=1, max_ticks=None):
        if type(debug) is not bool or type(level) is not int or not 1 <= level <= 30:
            raise RequestError(400, "Invalid mode or level")
        if debug and not self.allow_debug:
            raise RequestError(403, "Developer tools are disabled on this player host")
        if not debug and (level != 1 or max_ticks is not None):
            raise RequestError(403, "Scope changes require a debug session")
        budget = self.max_ticks if max_ticks is None else max_ticks
        if type(budget) is not int or not 1 <= budget <= 1000000:
            raise RequestError(400, "Invalid tick budget")
        with self.lock:
            self._expire()
            if self.closed:
                raise RequestError(503, "Host is stopping")
            if len(self.sessions) >= 2:
                raise RequestError(409, "Two games are already open. Close one or wait for it to expire.")
            session_id = secrets.token_urlsafe(24)
            run = self.runs / (datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S-%f") + "-" + session_id[:6])
            env = (DebugEnv if debug else CatacombEnv)(self.executable, self.data, run, level=level,
                             max_ticks=budget, timeout=15, headless=True)
            session = Session(env, debug)
            self.sessions[session_id] = session
            return {"session": session_id, **session.snapshot()}

    def _get(self, session_id):
        if not isinstance(session_id, str) or session_id not in self.sessions:
            raise RequestError(404, "This game has expired. Start a new game.")
        session = self.sessions[session_id]
        if time.monotonic() - session.updated > self.idle_seconds:
            session.env.close()
            del self.sessions[session_id]
            raise RequestError(404, "This game has expired. Start a new game.")
        session.updated = time.monotonic()
        return session

    def observe(self, session_id):
        with self.lock:
            return self._get(session_id).snapshot()

    def act(self, payload):
        if set(payload) != {"session", "sequence", "action"}:
            raise RequestError(400, "Expected session, sequence and action")
        fields = payload["action"]
        sequence = payload["sequence"]
        if not isinstance(fields, dict) or set(fields) - ACTION_FIELDS:
            raise RequestError(400, "Unknown action fields")
        if type(sequence) is not int or sequence < 1:
            raise RequestError(400, "Invalid sequence")
        try:
            action = Action(**fields)
            action.command()
        except (ValueError, TypeError) as error:
            raise RequestError(400, str(error)) from None
        with self.lock:
            session = self._get(payload["session"])
            # A retried POST must never apply a movement/spell twice.
            if sequence == session.sequence and action == session.last_action:
                return session.snapshot()
            if sequence != session.sequence + 1:
                raise RequestError(409, "Action sequence conflict; refresh the observation")
            if session.observation.status != "running":
                raise RequestError(409, "This episode has finished")
            try:
                session.observation = session.env.act(action)
            except Exception:
                session.env.close()
                del self.sessions[payload["session"]]
                raise
            session.sequence = sequence
            session.last_action = action
            session.updated = time.monotonic()
            return session.snapshot()

    def end(self, session_id):
        if not isinstance(session_id, str):
            raise RequestError(400, "Invalid session")
        with self.lock:
            session = self.sessions.pop(session_id, None)
            if session:
                session.env.close()

    def debug(self, session_id, op="state", values=None, request_id=None):
        with self.lock:
            session = self._get(session_id)
            if not session.debug:
                raise RequestError(403, "Debug tools are disabled in normal play")
            values = [] if values is None else values
            if op != "state" and (not isinstance(request_id, str) or not 8 <= len(request_id) <= 80):
                raise RequestError(400, "Debug mutations require a request ID")
            key = (request_id, op, values)
            if request_id and session.last_debug_request and session.last_debug_request[0] == request_id:
                if key != session.last_debug_request:
                    raise RequestError(409, "Conflicting debug request ID")
                return session.last_debug_result
            try:
                state = session.env.debug_command(op, values)
            except ValueError as error:
                raise RequestError(400, str(error)) from None
            session.observation = session.env.observe()
            session.last_action = None
            result = {"state": state, "observation": session.snapshot()}
            if request_id:
                session.last_debug_request, session.last_debug_result = key, result
            return result

    def close(self):
        with self.lock:
            self.closed = True
            for session in self.sessions.values():
                session.env.close()
            self.sessions.clear()


class WebServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True

    def __init__(self, address, host, token):
        self.host, self.token = host, token
        super().__init__(address, Handler)


class Handler(BaseHTTPRequestHandler):
    server_version = "CatacombWeb/1"

    def setup(self):
        super().setup()
        self.connection.settimeout(20)

    def log_message(self, *_):
        # Do not log session IDs, passwords, browser headers or request bodies.
        pass

    def send_bytes(self, status, content, content_type):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Content-Security-Policy", "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'")
        self.end_headers()
        self.wfile.write(content)

    def json(self, status, payload):
        self.send_bytes(status, json.dumps(payload).encode(), "application/json; charset=utf-8")

    def authorize(self):
        supplied = self.headers.get("Authorization", "")
        expected = "Bearer " + self.server.token
        if not secrets.compare_digest(supplied.encode(), expected.encode()):
            raise RequestError(401, "An access key is required")
        origin = self.headers.get("Origin")
        if origin and urlsplit(origin).netloc != self.headers.get("Host"):
            raise RequestError(403, "Cross-origin access is disabled")

    def read_json(self):
        if self.headers.get("Transfer-Encoding"):
            raise RequestError(400, "Chunked requests are not supported")
        if self.headers.get("Content-Type", "").split(";")[0].strip() != "application/json":
            raise RequestError(415, "Expected JSON")
        try:
            size = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            raise RequestError(400, "Invalid request length") from None
        if not 0 < size <= MAX_BODY:
            raise RequestError(413, "Request body is too large or empty")
        try:
            payload = json.loads(self.rfile.read(size))
        except (ValueError, UnicodeDecodeError):
            raise RequestError(400, "Invalid JSON") from None
        if not isinstance(payload, dict):
            raise RequestError(400, "Expected an object")
        return payload

    def dispatch(self, method):
        path = urlsplit(self.path)
        static = {"/": ("index.html", "text/html; charset=utf-8"),
                  "/app.js": ("app.js", "text/javascript; charset=utf-8"),
                  "/debug.js": ("debug.js", "text/javascript; charset=utf-8"),
                  "/style.css": ("style.css", "text/css; charset=utf-8"),
                  "/favicon.svg": ("favicon.svg", "image/svg+xml")}
        if method == "GET" and path.path in static:
            name, mime = static[path.path]
            return self.send_bytes(200, (WEB / name).read_bytes(), mime)
        if method == "GET" and path.path == "/health":
            return self.json(200, {"status": "ok"})
        if not path.path.startswith("/api/"):
            raise RequestError(404, "Not found")
        self.authorize()
        host = self.server.host
        if method == "GET" and path.path == "/api/info":
            return self.json(200, {"game": "Catacomb II", "level": 1,
                                  "max_ticks": host.max_ticks, "timing": "stepped", "audio": False,
                                  "debug_tools": host.allow_debug})
        if method == "GET" and path.path == "/api/debug":
            return self.json(200, host.debug(parse_qs(path.query).get("session", [None])[0]))
        if method == "GET" and path.path == "/api/observation":
            session_id = parse_qs(path.query).get("session", [None])[0]
            return self.json(200, host.observe(session_id))
        if method == "POST":
            payload = self.read_json()
            if path.path == "/api/start" and not (set(payload) - {"debug", "level", "max_ticks"}):
                snapshot = host.start(**payload)
                try:
                    return self.json(200, snapshot)
                except (ConnectionError, TimeoutError):
                    host.end(snapshot["session"])
                    raise
            if path.path == "/api/action":
                return self.json(200, host.act(payload))
            if path.path == "/api/debug" and set(payload) == {"session", "op", "values", "request_id"}:
                return self.json(200, host.debug(payload["session"], payload["op"], payload["values"], payload["request_id"]))
            if path.path == "/api/close" and set(payload) == {"session"}:
                host.end(payload["session"])
                return self.json(200, {"closed": True})
        raise RequestError(404, "Unknown endpoint or payload")

    def handle_request(self, method):
        try:
            self.dispatch(method)
        except RequestError as error:
            try:
                self.json(error.status, {"error": error.message})
            except (ConnectionError, TimeoutError):
                pass
        except (ConnectionError, TimeoutError):
            pass
        except Exception as error:
            print("Web request failed:", type(error).__name__, str(error), file=sys.stderr, flush=True)
            try:
                self.json(503, {"error": "The game process could not respond. Start a new game."})
            except (ConnectionError, TimeoutError):
                pass

    def do_GET(self):
        self.handle_request("GET")

    def do_POST(self):
        self.handle_request("POST")

    def do_OPTIONS(self):
        self.json(403, {"error": "Cross-origin access is disabled"})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8765)
    binary_name = "catacomb.exe" if os.name == "nt" else "catacomb"
    debug_build = ROOT / "build-debug" / binary_name
    parser.add_argument("--exe", type=Path, default=debug_build if debug_build.is_file() else ROOT / "build" / binary_name)
    parser.add_argument("--data", type=Path, default=ROOT / "data/original")
    parser.add_argument("--runs", type=Path, default=ROOT / "runs/web")
    parser.add_argument("--share", action="store_true", help="Start a temporary Cloudflare HTTPS tunnel")
    parser.add_argument("--player-only", action="store_true", help="Hide developer controls and reject all debug sessions")
    parser.add_argument("--cloudflared", type=Path, default=ROOT / ".tools" / ("cloudflared.exe" if os.name == "nt" else "cloudflared"))
    parser.add_argument("--token-stdin", action="store_true", help="Read a token from stdin for automated tests")
    args = parser.parse_args()
    token = sys.stdin.readline().strip() if args.token_stdin else secrets.token_urlsafe(32)
    if len(token) < 32:
        parser.error("The access key must contain at least 32 characters")
    executable = args.exe.resolve(strict=True)
    if args.share and not args.cloudflared.is_file():
        parser.error("Install cloudflared at --cloudflared before using --share")
    host = GameHost(executable, args.data, args.runs, allow_debug=not args.player_only)
    server = WebServer(("127.0.0.1", args.port), host, token)
    stop = threading.Event()
    tunnel = None
    local_url = f"http://127.0.0.1:{server.server_port}"
    print("LOCAL_PLAY_URL=" + local_url + "/#access=" + token, flush=True)

    def housekeeping():
        while not stop.wait(30):
            host.expire()

    def tunnel_output():
        announced = False
        for line in tunnel.stdout:
            match = re.search(r"https://[a-z0-9-]+\.trycloudflare\.com", line)
            if match and not announced:
                print("REMOTE_PLAY_URL=" + match.group(0) + "/#access=" + token, flush=True)
                announced = True
            if "Registered tunnel connection" in line:
                print("TUNNEL_CONNECTED", flush=True)
            elif " ERR " in line:
                print("Tunnel:", line.strip(), file=sys.stderr, flush=True)
        if not stop.is_set():
            print("Tunnel stopped; remote access is offline.", file=sys.stderr, flush=True)

    def stop_signal(*_):
        raise KeyboardInterrupt

    signal.signal(signal.SIGINT, stop_signal)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, stop_signal)
    try:
        threading.Thread(target=housekeeping, daemon=True).start()
        if args.share:
            tunnel = subprocess.Popen(
                [str(args.cloudflared.resolve()), "tunnel", "--no-autoupdate", "--protocol", "http2", "--url", local_url],
                stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0)
            threading.Thread(target=tunnel_output, daemon=True).start()
        server.serve_forever(poll_interval=0.25)
    except KeyboardInterrupt:
        pass
    finally:
        stop.set()
        server.server_close()
        host.close()
        if tunnel:
            tunnel.terminate()
            try:
                tunnel.wait(timeout=5)
            except subprocess.TimeoutExpired:
                tunnel.kill()
                tunnel.wait()


if __name__ == "__main__":
    main()
