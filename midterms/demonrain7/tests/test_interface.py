"""Client-side checks; no claim of a real asset-backed game playtest."""
import importlib.util
from pathlib import Path
import struct
import sys
import tempfile
import unittest
import zlib

path = Path(__file__).resolve().parents[1] / "scripts" / "catacomb_env.py"
spec = importlib.util.spec_from_file_location("catacomb_env", path)
client = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = client
spec.loader.exec_module(client)


class InterfaceTests(unittest.TestCase):
    def test_png_preserves_bmp_colors_and_row_order(self):
        # Two 1-pixel rows in bottom-up BGR: blue below red; 4-byte row padding.
        bmp = b"BM" + struct.pack("<IHHI", 62, 0, 0, 54)
        bmp += struct.pack("<IiiHHIIiiII", 40, 1, 2, 1, 24, 0, 8, 0, 0, 0, 0)
        bmp += b"\xff\x00\x00\x00\x00\x00\xff\x00"
        png, width, height = client.bmp_to_png(bmp)
        self.assertEqual((width, height), (1, 2))
        self.assertTrue(png.startswith(b"\x89PNG\r\n\x1a\n"))
        index = png.index(b"IDAT")
        size = struct.unpack_from(">I", png, index - 4)[0]
        self.assertEqual(zlib.decompress(png[index + 4:index + 4 + size]),
                         b"\x00\xff\x00\x00\x00\x00\x00\xff")
        with self.assertRaises(ValueError):
            client.bmp_to_png(bmp[:-1])

    def test_action_protocol_and_invalid_input(self):
        self.assertEqual(client.Action(direction="east", fire=True, ticks=16).command(),
                         "step 1 1 0 0 0 0 16")
        for action in (client.Action(ticks=True), client.Action(ticks=33),
                       client.Action(potion=True, nuke=True), client.Action(fire="false"),
                       client.Action(direction="teleport")):
            with self.assertRaises(ValueError):
                action.command()

    def test_data_copy_excludes_saves_and_normalizes_names(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "original"
            source.mkdir()
            for name in ("sounds.ca2", "egachars.ca2", "egapics.ca2", "level1.ca2",
                         "ctlpanel.ca2", "game0.ca2", "level2.ca2"):
                (source / name).write_bytes(b"unit-test-placeholder")
            hashes = client.prepare_data(source, root / "runtime", 1)
            expected = {"SOUNDS.CA2", "EGACHARS.CA2", "EGAPICS.CA2", "LEVEL1.CA2"}
            self.assertEqual(set(hashes), expected)
            self.assertEqual({p.name for p in (root / "runtime").iterdir()}, expected)
            with self.assertRaises(FileExistsError):
                client.prepare_data(source, root / "runtime", 1)
            with self.assertRaises(FileNotFoundError):
                client.prepare_data(source, root / "missing-level", 30)
            self.assertFalse((root / "missing-level").exists())


if __name__ == "__main__":
    unittest.main()
