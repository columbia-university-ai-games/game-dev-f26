"""Package a clean source revision and a Windows binary; exclude private resources.
SPDX-License-Identifier: GPL-2.0-or-later
"""
import argparse
from datetime import datetime, timezone
import hashlib
from io import BytesIO
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PREFIX = "catacomb-midterm/"
DATA_NOTE = "Original resources are not bundled. Place SOUNDS.CA2, EGACHARS.CA2, EGAPICS.CA2 and LEVEL1.CA2 here. See docs/ASSET_PROVENANCE.md and docs/RELEASE.md.\n"
PLAY = r'''@echo off
setlocal
for %%F in (SOUNDS.CA2 EGACHARS.CA2 EGAPICS.CA2 LEVEL1.CA2) do (
  if not exist "%~dp0data\original\%%F" (
    echo Missing %%F. Read docs\RELEASE.md and add the four original resource files.
    pause
    exit /b 1
  )
)
cd /d "%~dp0data\original"
"%~dp0bin\catacomb.exe" windowed 960 600 --single-level --level 1
if errorlevel 1 pause
'''
BROWSER = r'''@echo off
cd /d "%~dp0"
python scripts\serve_web.py --exe bin\catacomb.exe --data data\original --player-only
pause
'''


def hash_bytes(data):
    return hashlib.sha256(data).hexdigest()


def archive_source(root=ROOT):
    """Archive this project tree, including when it lives in the course repo."""
    prefix = subprocess.check_output(["git", "rev-parse", "--show-prefix"], cwd=root, text=True).strip()
    top = subprocess.check_output(["git", "rev-parse", "--show-toplevel"], cwd=root, text=True).strip()
    tree = "HEAD:" + prefix.rstrip("/") if prefix else "HEAD"
    return subprocess.check_output(["git", "archive", "--format=zip", "--prefix=" + PREFIX, tree], cwd=top)


def source_entries(source_zip):
    with zipfile.ZipFile(BytesIO(source_zip)) as archive:
        entries = {item.filename: archive.read(item) for item in archive.infolist() if not item.is_dir()}
    for name in entries:
        path = PurePosixPath(name)
        if (not name.startswith(PREFIX) or path.is_absolute() or ".." in path.parts
                or any(part in {".git", ".claude", ".tools", "runs", "data", ".venv"} for part in path.parts)
                or path.suffix.lower() in {".ca2", ".exe", ".dll", ".pem", ".key"}
                or any(part == ".env" or part.startswith(".env.") for part in path.parts)):
            raise ValueError("Source archive contains an unexpected/private entry: " + name)
    return entries


def package(source_zip, executable, sdl, license_text, output, version, revision, build_description):
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", version):
        raise ValueError("Version must be a safe filename component")
    entries = source_entries(source_zip)
    if PREFIX + "COPYING" not in entries:
        raise ValueError("The upstream code license must be included")
    if not executable.startswith(b"MZ") or not sdl.startswith(b"MZ") or not license_text.strip():
        raise ValueError("Expected Windows binaries and the SDL license")
    manifest = {"schema": 1, "version": version, "git_revision": revision,
                "created_at": datetime.now(timezone.utc).isoformat(), "build": build_description,
                "code_license": "GPL-2.0-or-later; see COPYING and source notices",
                "original_resources_included": False,
                "binary_sha256": {"bin/catacomb.exe": hash_bytes(executable), "bin/SDL2.dll": hash_bytes(sdl)},
                "source_zip_sha256": hash_bytes(source_zip)}
    entries.update({PREFIX + "bin/catacomb.exe": executable, PREFIX + "bin/SDL2.dll": sdl,
                    PREFIX + "licenses/SDL2-LICENSE.txt": license_text,
                    PREFIX + "data/original/README.txt": DATA_NOTE.encode(),
                    PREFIX + "PLAY.cmd": PLAY.replace("\n", "\r\n").encode(),
                    PREFIX + "PLAY-IN-BROWSER.cmd": BROWSER.replace("\n", "\r\n").encode(),
                    PREFIX + "RELEASE-MANIFEST.json": json.dumps(manifest, indent=2).encode()})
    output = Path(output)
    output.mkdir(parents=True, exist_ok=False)
    source_path = output / f"catacomb-midterm-{version}-source.zip"
    binary_path = output / f"catacomb-midterm-{version}-windows-x64.zip"
    source_path.write_bytes(source_zip)
    with zipfile.ZipFile(binary_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, content in sorted(entries.items()):
            archive.writestr(name, content)
    (output / "SHA256SUMS.txt").write_text("".join(f"{hash_bytes(p.read_bytes())}  {p.name}\n" for p in (source_path, binary_path)), encoding="utf-8")
    return manifest


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--exe", type=Path, required=True)
    parser.add_argument("--sdl", type=Path, required=True)
    parser.add_argument("--sdl-license", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--version", required=True)
    parser.add_argument("--build-description", required=True)
    args = parser.parse_args()
    if subprocess.check_output(["git", "status", "--porcelain", "--untracked-files=no", "--", "."], cwd=ROOT).strip():
        raise SystemExit("Commit tracked changes before packaging a source revision")
    revision = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    archive = archive_source()
    result = package(archive, args.exe.read_bytes(), args.sdl.read_bytes(), args.sdl_license.read_bytes(),
                     args.output, args.version, revision, args.build_description)
    print(json.dumps(result, indent=2))
