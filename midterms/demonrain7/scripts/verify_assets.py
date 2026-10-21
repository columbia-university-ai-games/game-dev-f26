"""Check separately obtained original resources without downloading or changing them.
SPDX-License-Identifier: GPL-2.0-or-later
"""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def verify(directory, expected):
    directory = Path(directory)
    present = {}
    if directory.is_dir():
        for path in directory.iterdir():
            if path.is_file():
                present.setdefault(path.name.upper(), []).append(path)
    results = []
    for name, digest in expected.items():
        matches = present.get(name.upper(), [])
        actual = hashlib.sha256(matches[0].read_bytes()).hexdigest() if len(matches) == 1 else None
        status = "missing" if not matches else "ambiguous" if len(matches) > 1 else "matched" if actual == digest else "mismatch"
        results.append({"file": name, "status": status, "sha256": actual})
    return {"valid": all(r["status"] == "matched" for r in results), "files": results}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path, default=ROOT / "data/original")
    args = parser.parse_args()
    expected = json.loads((ROOT / "config/resources.json").read_text(encoding="utf-8"))["files"]
    result = verify(args.data, expected)
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result["valid"] else 1)
