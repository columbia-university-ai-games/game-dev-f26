#!/usr/bin/env python3
"""Play this Get Out variation locally: serve this folder and open it in a browser.

    python3 minigames/submissions/rohitr4547/get-out/serve.py [--port 8000] [--no-open]

Only this folder is served, on 127.0.0.1. Press Ctrl+C to stop.
"""
import argparse
import functools
import http.server
from pathlib import Path
import webbrowser


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--port', type=int, default=8000, help='first port to try (default 8000)')
    parser.add_argument('--no-open', action='store_true', help='do not open a browser')
    args = parser.parse_args()
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parent))
    # Use the first free port from --port upward, so a busy 8000 does not stop play.
    for port in range(args.port, args.port + 20):
        try:
            server = http.server.ThreadingHTTPServer(('127.0.0.1', port), handler)
            break
        except OSError:
            continue
    else:
        raise SystemExit(f'No free port between {args.port} and {args.port + 19}.')
    url = f'http://127.0.0.1:{port}/'
    print(f'Get Out is running at {url}  (Ctrl+C to stop)', flush=True)
    if not args.no_open:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
