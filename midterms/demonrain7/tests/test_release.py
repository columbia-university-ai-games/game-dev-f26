"""Asset verification, package exclusion and ordinary-player host regressions."""
import hashlib
from io import BytesIO
import json
from pathlib import Path
import sys
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from package_release import package, source_entries, archive_source
from serve_web import GameHost, RequestError
from verify_assets import verify


def source_zip(extra=None):
    stream = BytesIO()
    with zipfile.ZipFile(stream, "w") as archive:
        archive.writestr("catacomb-midterm/COPYING", "fixture license")
        for path, data in (extra or {}).items():
            archive.writestr("catacomb-midterm/" + path, data)
    return stream.getvalue()


class ReleaseTests(unittest.TestCase):
    def test_course_package_archives_only_the_student_subtree(self):
        with tempfile.TemporaryDirectory() as folder:
            repo = Path(folder)
            project = repo / "midterms/student"
            project.mkdir(parents=True)
            (project / "COPYING").write_text("own license")
            (project / "main.c").write_text("own source")
            (repo / "other-student.txt").write_text("must not be exported")
            def git(*args):
                return subprocess.check_output(["git", *args], cwd=repo, stderr=subprocess.STDOUT)
            git("init")
            git("add", ".")
            git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid",
                "commit", "-m", "Create package test fixture")
            entries = source_entries(archive_source(project))
            self.assertEqual(set(entries), {"catacomb-midterm/COPYING", "catacomb-midterm/main.c"})

    def test_resource_verifier_rejects_missing_and_changed_bytes(self):
        expected = {"LEVEL1.CA2": hashlib.sha256(b"expected").hexdigest()}
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            self.assertFalse(verify(root, expected)["valid"])
            (root / "level1.ca2").write_bytes(b"expected")
            self.assertTrue(verify(root, expected)["valid"])
            (root / "level1.ca2").write_bytes(b"different")
            self.assertEqual(verify(root, expected)["files"][0]["status"], "mismatch")

    def test_source_package_rejects_private_or_original_files(self):
        for path in ("LEVEL1.CA2", "data/original/anything", ".env", "runs/trace.jsonl", ".claude/settings.json"):
            with self.subTest(path=path), self.assertRaises(ValueError):
                source_entries(source_zip({path: "private fixture"}))

    def test_package_keeps_source_licenses_hashes_and_native_launcher(self):
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / "release"
            manifest = package(source_zip(), b"MZ-exe-fixture", b"MZ-sdl-fixture", b"SDL fixture license",
                               output, "test-rc1", "fixture-revision", "offline package fixture")
            with zipfile.ZipFile(output / "catacomb-midterm-test-rc1-windows-x64.zip") as archive:
                self.assertEqual(json.loads(archive.read("catacomb-midterm/RELEASE-MANIFEST.json")), manifest)
                self.assertIn(b"--single-level --level 1", archive.read("catacomb-midterm/PLAY.cmd"))
                self.assertIn(b"--player-only", archive.read("catacomb-midterm/PLAY-IN-BROWSER.cmd"))
                self.assertIn("catacomb-midterm/COPYING", archive.namelist())
                self.assertFalse(any(name.lower().endswith(".ca2") for name in archive.namelist()))
            self.assertEqual(len((output / "SHA256SUMS.txt").read_text().splitlines()), 2)

    def test_player_host_rejects_debug_before_creating_any_process(self):
        host = GameHost(Path("unused"), Path("unused"), Path("unused"), allow_debug=False)
        with patch("serve_web.DebugEnv") as debug:
            with self.assertRaises(RequestError) as caught:
                host.start(debug=True)
            self.assertEqual(caught.exception.status, 403)
            debug.assert_not_called()
        self.assertFalse(host.sessions)


if __name__ == "__main__":
    unittest.main()
