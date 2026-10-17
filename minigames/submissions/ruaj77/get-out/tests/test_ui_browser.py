"""Real Chromium UI regression tests; optional development tools, no game dependency.

Run from repo root: python3 -B -m unittest discover -s
minigames/submissions/ruaj77/get-out/tests -p test_ui_browser.py -v
Requires Python Playwright and a system/bundled Chromium installation.
Fixtures below are test boards, not a fifth teaching level.
"""
import json
import re
import shutil
import unittest
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sync_playwright = None


GAME_DIR = Path(__file__).resolve().parents[1]
PAIR = 'SD.E\nT###\n####'
CORRIDOR = 'S.T..\nD###E'


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


@unittest.skipUnless(sync_playwright, 'Browser checks require Python Playwright.')
class BrowserUITests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        executable = shutil.which('chromium') or cls.playwright.chromium.executable_path
        if not Path(executable).exists():
            cls.playwright.stop()
            raise unittest.SkipTest('Browser checks require Chromium.')
        cls.browser = cls.playwright.chromium.launch(
            executable_path=executable, headless=True,
            args=['--no-sandbox', '--disable-dev-shm-usage'],
        )
        cls.server = ThreadingHTTPServer(
            ('127.0.0.1', 0), partial(QuietHandler, directory=str(GAME_DIR)),
        )
        cls.server_thread = Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        cls.url = f'http://127.0.0.1:{cls.server.server_port}/'

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.server_thread.join()

    def setUp(self):
        self.context = self.browser.new_context(
            viewport={'width': 1280, 'height': 1000}, has_touch=True,
            reduced_motion='reduce', accept_downloads=True,
        )
        self.page = self.context.new_page()
        self.errors = []
        self.page.on('pageerror', lambda error: self.errors.append(str(error)))
        self.page.set_default_timeout(3000)
        self.page.goto(self.url)
        self.page.locator('.player').wait_for()

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [], 'Uncaught browser JavaScript errors')

    def import_board(self, code=PAIR):
        if not self.page.locator('#board-code').is_visible():
            self.page.locator('#exchange summary').click()
        self.page.locator('#board-code').fill(code)
        self.page.locator('#import').click()

    def move(self, action):
        self.page.locator(f'[data-move="{action}"]').click()

    def position(self):
        return self.page.locator('.player').evaluate(
            "el => [Number(el.style.getPropertyValue('--y')), "
            "Number(el.style.getPropertyValue('--x'))]"
        )

    def export_board(self):
        self.page.locator('#export').click()
        return self.page.locator('#board-code').input_value()

    def trace_payload(self):
        if not self.page.locator('#download').is_visible():
            self.page.locator('.trace summary').click()
        with self.page.expect_download() as pending:
            self.page.locator('#download').click()
        return json.loads(Path(pending.value.path()).read_text())

    def assert_pieces(self, opened):
        door = 'Open door' if opened else 'Closed door'
        switch = 'Activated switch' if opened else 'Inactive switch'
        self.assertEqual(self.page.get_by_role('img', name=re.compile(door, re.I)).count(), 1)
        self.assertEqual(self.page.get_by_role('img', name=re.compile(switch, re.I)).count(), 1)
        self.assertEqual(self.page.locator('.door-open' if opened else '.door-closed').count(), 1)
        self.assertEqual(self.page.locator('.switch-active' if opened else '.switch-inactive').count(), 1)
        self.assertIn(door.lower(), self.page.locator('#board').get_attribute('aria-label').lower())

    def test_initial_door_and_switch_have_distinct_symbols_shapes_and_labels(self):
        self.import_board()
        self.assert_pieces(False)
        self.assertEqual(self.page.locator('.gate-mark').inner_text(), 'D×')
        self.assertEqual(self.page.locator('.switch-mark').inner_text(), 'T○')
        self.assertEqual(self.page.locator('#door-key-label').inner_text(), 'Closed door')
        self.assertEqual(self.page.locator('#switch-key-label').inner_text(), 'Inactive switch')
        self.move('right')
        self.assertEqual(self.position(), [0, 0])
        self.assertEqual(self.page.locator('#moves').inner_text(), '0')
        self.assertIn('Blocked right', self.page.locator('#status').inner_text())

    def test_activation_feedback_and_undo_refresh_every_indicator(self):
        self.import_board()
        self.move('down')
        self.assert_pieces(True)
        self.assertEqual(self.position(), [1, 0])
        self.assertEqual(self.page.locator('#moves').inner_text(), '1')
        self.assertIn('Switch activated! The door is now open.', self.page.locator('#status').inner_text())
        self.assertEqual(self.page.locator('.gate-mark').inner_text(), 'D✓')
        self.assertEqual(self.page.locator('.switch-mark').inner_text(), 'T✓')
        self.page.locator('#undo').click()
        self.assert_pieces(False)
        self.assertEqual(self.position(), [0, 0])
        self.assertEqual(self.page.locator('#moves').inner_text(), '0')
        self.assertEqual(self.page.locator('#status').inner_text(), 'Move undone. The door is closed again.')

    def test_undo_after_a_later_move_keeps_open_door_without_false_feedback(self):
        self.import_board()
        self.move('down')
        self.move('up')
        self.page.locator('#undo').click()
        self.assert_pieces(True)
        self.assertEqual(self.position(), [1, 0])
        self.assertEqual(self.page.locator('#moves').inner_text(), '1')
        self.assertNotIn('door', self.page.locator('#status').inner_text().lower())

    def test_reset_restores_closed_pair_position_counter_history_and_trace(self):
        self.import_board()
        self.move('down')
        self.move('up')
        self.page.locator('#hint').click()
        self.page.locator('#reset').click()
        self.assert_pieces(False)
        self.assertEqual(self.position(), [0, 0])
        self.assertEqual(self.page.locator('#moves').inner_text(), '0')
        self.assertTrue(self.page.locator('#undo').is_disabled())
        self.assertEqual(self.page.locator('#trace-list').text_content(), 'No moves yet.')
        self.assertIn('door is closed', self.page.locator('#status').inner_text().lower())
        payload = self.trace_payload()
        self.assertEqual(payload['events'], [])
        self.assertFalse(payload['doorOpen'])
        self.assertEqual(payload['hints'], 0)

    def test_hints_before_after_activation_after_undo_and_after_reset(self):
        self.import_board()
        self.page.locator('#hint').click()
        self.assertEqual(self.page.locator('#status').inner_text(), 'Try ↓ down.')
        self.move('down')
        self.page.locator('#hint').click()
        self.assertEqual(self.page.locator('#status').inner_text(), 'Try ↑ up.')
        self.page.locator('#undo').click()
        self.page.locator('#hint').click()
        self.assertEqual(self.page.locator('#status').inner_text(), 'Try ↓ down.')
        self.move('down')
        self.page.locator('#reset').click()
        self.page.locator('#hint').click()
        self.assertEqual(self.page.locator('#status').inner_text(), 'Try ↓ down.')

    def test_hint_handles_unreachable_current_state_without_replacing_the_board(self):
        self.import_board('.TD.\n.E.S\n#...\n#.#.')
        self.move('up')
        self.page.locator('#hint').click()
        self.assertIn('There is no route from here.', self.page.locator('#status').inner_text())
        self.assertEqual(self.position(), [0, 3])
        self.assertEqual(self.page.locator('#moves').inner_text(), '1')
        self.page.locator('#undo').click()
        self.page.locator('#hint').click()
        self.assertEqual(self.page.locator('#status').inner_text(), 'Try ← left.')

    def test_activation_and_victory_are_both_announced_on_one_slide(self):
        self.import_board('STD.E.\n######')
        self.move('right')
        self.assert_pieces(True)
        self.assertEqual(self.position(), [0, 4])
        message = self.page.locator('#status').inner_text()
        self.assertIn('Switch activated! The door is now open.', message)
        self.assertIn('got out in 1 move', message)
        self.assertTrue(self.page.locator('#hint').is_disabled())
        self.assertTrue(self.page.locator('[data-move="left"]').is_disabled())

    def test_exchange_exports_initial_configuration_even_after_activation(self):
        self.import_board('SD.E\r\nT###\r\n####')
        self.move('down')
        self.assertEqual(self.export_board(), PAIR)
        self.assert_pieces(True)
        self.page.locator('#import').click()
        self.assert_pieces(False)
        self.assertEqual(self.position(), [0, 0])
        self.assertEqual(self.export_board(), PAIR)

    def test_invalid_imports_preserve_current_position_moves_and_open_door(self):
        self.import_board()
        self.move('down')
        for code in ['STE.\n....', 'SDE.\n....', 'STTE\nD...', 'STDE\nD...', 'SDTE\n####']:
            with self.subTest(code=code):
                self.import_board(code)
                self.assertEqual(self.position(), [1, 0])
                self.assertEqual(self.page.locator('#moves').inner_text(), '1')
                self.assert_pieces(True)
                self.assertEqual(self.export_board(), PAIR)

    def paint(self, tool, row, column, width=7):
        self.page.locator(f'input[name="tool"][value="{tool}"]').check()
        self.page.locator('#board .cell').nth(row * width + column).click()

    def test_editor_places_pair_and_plays_the_valid_draft(self):
        self.page.locator('#edit').click()
        self.page.locator('#blank').click()
        self.paint('T', 0, 1)
        self.paint('D', 0, 2)
        self.assertIn('Inactive switch', self.page.locator('#board .cell').nth(1).get_attribute('aria-label'))
        self.assertIn('Closed door', self.page.locator('#board .cell').nth(2).get_attribute('aria-label'))
        self.page.locator('#exchange summary').click()
        self.assertEqual(self.export_board(), 'STD....\n.......\n.......\n.......\n.......\n.......\n......E')
        self.page.locator('#play-custom').click()
        self.assertTrue(self.page.locator('#editor').is_hidden())
        self.assert_pieces(False)
        self.move('right')
        self.assert_pieces(True)
        self.assertEqual(self.position(), [0, 6])
        self.move('down')
        self.assertIn('got out in 2 moves', self.page.locator('#status').inner_text())

    def test_editor_rejects_missing_and_duplicate_pairs_preserving_playable_board(self):
        self.import_board('S..\n...\n..E')
        self.move('right')
        self.page.locator('#edit').click()
        self.page.locator('#blank').click()
        self.paint('T', 0, 1)
        self.page.locator('#play-custom').click()
        self.assertIn('exactly one switch', self.page.locator('#status').inner_text())
        self.paint('D', 0, 2)
        self.paint('T', 0, 3)
        self.page.locator('#play-custom').click()
        self.assertIn('exactly one switch', self.page.locator('#status').inner_text())
        self.paint('.', 0, 3)
        self.paint('D', 0, 4)
        self.page.locator('#play-custom').click()
        self.assertIn('exactly one switch', self.page.locator('#status').inner_text())
        self.page.locator('#cancel-edit').click()
        self.assertEqual(self.position(), [0, 2])
        self.assertEqual(self.page.locator('#moves').inner_text(), '1')
        self.assertEqual(self.export_board(), 'S..\n...\n..E')

    def test_editor_uses_inactive_draft_indicators_when_current_game_is_open(self):
        self.import_board()
        self.move('down')
        self.page.locator('#edit').click()
        self.assertIn('Closed door', self.page.locator('#board .cell').nth(1).get_attribute('aria-label'))
        self.assertIn('Inactive switch', self.page.locator('#board .cell').nth(4).get_attribute('aria-label'))
        self.page.locator('#cancel-edit').click()
        self.assert_pieces(True)
        self.assertEqual(self.position(), [1, 0])

    def test_arrow_wasd_and_on_screen_controls_preserve_sliding_rules(self):
        self.import_board(CORRIDOR)
        for keys in [('ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'), ('d', 'a', 's', 'w')]:
            self.page.locator('#reset').click()
            self.page.locator('#board').focus()
            for key, position in zip(keys, [[0, 4], [0, 0], [1, 0], [0, 0]]):
                self.page.keyboard.press(key)
                self.assertEqual(self.position(), position)
            self.assert_pieces(True)
            self.assertEqual(self.page.locator('#moves').inner_text(), '4')
        self.move('right')
        self.assertEqual(self.position(), [0, 4])
        self.assertEqual(self.page.locator('#moves').inner_text(), '5')

    def test_simulated_swipe_activates_the_switch(self):
        self.import_board(CORRIDOR)
        board = self.page.locator('#board')
        board.dispatch_event('pointerdown', {'pointerType': 'touch', 'clientX': 20, 'clientY': 20})
        board.dispatch_event('pointerup', {'pointerType': 'touch', 'clientX': 120, 'clientY': 20})
        self.assertEqual(self.position(), [0, 4])
        self.assert_pieces(True)

    def test_typing_and_editor_keyboard_input_do_not_move_the_player(self):
        self.import_board()
        self.page.locator('#board-code').focus()
        self.page.keyboard.press('s')
        self.assertEqual(self.position(), [0, 0])
        self.assertEqual(self.page.locator('#moves').inner_text(), '0')
        self.page.locator('#edit').click()
        self.page.locator('#board .cell').first.focus()
        self.page.keyboard.press('ArrowDown')
        self.page.locator('#cancel-edit').click()
        self.assertEqual(self.position(), [0, 0])
        self.assert_pieces(False)

    def test_trace_download_records_actual_activation_blocked_move_and_undo_states(self):
        self.import_board()
        self.move('right')
        self.page.locator('#hint').click()
        self.move('down')
        self.move('up')
        self.page.locator('#undo').click()
        self.page.locator('#undo').click()
        payload = self.trace_payload()
        self.assertEqual(payload['board'], PAIR.splitlines())
        self.assertEqual(payload['moves'], 0)
        self.assertEqual(payload['position'], [0, 0])
        self.assertFalse(payload['doorOpen'])
        blocked, hint, activation, later, undo_later, undo_activation = payload['events']
        self.assertTrue(blocked['blocked'])
        self.assertFalse(blocked['doorOpenBefore'])
        self.assertFalse(blocked['doorOpenAfter'])
        self.assertFalse(blocked['switchActivated'])
        self.assertEqual(hint['message'], 'Try ↓ down.')
        self.assertFalse(activation['doorOpenBefore'])
        self.assertTrue(activation['doorOpenAfter'])
        self.assertTrue(activation['switchActivated'])
        self.assertTrue(later['doorOpenAfter'])
        self.assertFalse(later['switchActivated'])
        self.assertTrue(undo_later['doorOpenBefore'])
        self.assertTrue(undo_later['doorOpenAfter'])
        self.assertTrue(undo_activation['doorOpenBefore'])
        self.assertFalse(undo_activation['doorOpenAfter'])
        self.assertIn('door opened', self.page.locator('#trace-list').inner_text())

    def test_narrow_layout_editor_and_keyboard_focus_are_usable(self):
        self.page.set_viewport_size({'width': 375, 'height': 812})
        self.import_board()
        self.assert_pieces(False)
        self.assertTrue(self.page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
        self.page.locator('.brand').focus()
        self.page.keyboard.press('Tab')
        self.assertTrue(self.page.locator('#board').evaluate('el => el === document.activeElement'))
        self.assertEqual(self.page.locator('#board').evaluate('el => getComputedStyle(el).outlineStyle'), 'solid')
        self.page.locator('#edit').click()
        self.assertTrue(self.page.locator('input[value="T"]').is_visible())
        self.assertTrue(self.page.locator('input[value="D"]').is_visible())
        self.page.locator('#board .cell').first.focus()
        self.page.keyboard.press('Tab')
        self.assertTrue(self.page.locator('#board .cell').nth(1).evaluate('el => el === document.activeElement'))
        self.assertEqual(self.page.locator('#board .cell').nth(1).evaluate('el => getComputedStyle(el).outlineStyle'), 'solid')
        self.assertTrue(self.page.evaluate('document.documentElement.scrollWidth <= innerWidth'))


if __name__ == '__main__':
    unittest.main()
