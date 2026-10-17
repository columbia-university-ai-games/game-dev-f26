"""Level 5 integration checks using the existing optional Chromium harness.

No winning move sequence is printed. Run with unittest discovery alongside
test_ui_browser.py; all expected moves are computed by the actual game engine.
"""
import unittest
import test_ui_browser as ui

CANDIDATE_C = ['.T.....', '.....#.', '....#E#', '.....D.', '.......', '#...#..', 'S.....#']


@unittest.skipUnless(ui.sync_playwright, 'Browser checks require Python Playwright.')
class LevelFiveBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        ui.BrowserUITests.setUpClass()

    @classmethod
    def tearDownClass(cls):
        ui.BrowserUITests.tearDownClass()

    def setUp(self):
        self.ui = ui.BrowserUITests('runTest')
        self.ui.setUp()
        self.addCleanup(self.ui.tearDown)
        self.page = self.ui.page
        self.assertEqual(self.page.locator('#levels option[value="4"]').count(), 1,
                         'The fifth playable level must be present.')
        self.page.locator('#levels').select_option('4')
        self.init_expected()

    def init_expected(self):
        self.page.evaluate('''() => {
          window.__levelTestState = GetOut.create(GetOutLevels[4].board);
          window.__levelTestHistory = [];
        }''')

    def expected(self):
        return self.page.evaluate('''() => {
          const s = window.__levelTestState;
          return {position:s.position, moves:s.moves, doorOpen:s.doorOpen, won:s.won};
        }''')

    def advance(self, action):
        events = self.page.evaluate('''action => {
          const before=window.__levelTestState, next=GetOut.step(before,action);
          window.__levelTestHistory.push(before); window.__levelTestState=next;
          const [dr,dc]={up:[-1,0],right:[0,1],down:[1,0],left:[0,-1]}[action];
          const [r,c]=next.position;
          const distance=Math.abs(r-before.position[0])+Math.abs(c-before.position[1]);
          let crossed=false;
          for(let i=1;i<=distance;i++) {
            if(before.board[before.position[0]+dr*i][before.position[1]+dc*i]==='D')crossed=true;
          }
          return {closedStop:distance>0&&!next.won&&!next.doorOpen&&before.board[r+dr]?.[c+dc]==='D',
            activation:!before.doorOpen&&next.doorOpen, traversal:next.doorOpen&&crossed};
        }''', action)
        self.ui.move(action)
        state = self.expected()
        self.assertEqual(self.ui.position(), state['position'])
        self.assertEqual(self.page.locator('#moves').inner_text(), str(state['moves']))
        self.ui.assert_pieces(state['doorOpen'])
        return events

    def assert_hint(self):
        direction = self.page.evaluate('GetOut.solve(window.__levelTestState)[0]')
        self.assertIsNotNone(direction)
        self.assertTrue(self.page.evaluate('''action =>
          GetOut.legalActions(window.__levelTestState).includes(action)''', direction))
        self.page.locator('#hint').click()
        arrows = {'up': '↑', 'right': '→', 'down': '↓', 'left': '←'}
        self.assertEqual(self.page.locator('#status').inner_text(), f'Try {arrows[direction]} {direction}.')

    def reach_activation(self):
        solution = self.page.evaluate('GetOut.solve(window.__levelTestState)')
        for action in solution:
            if self.advance(action)['activation']:
                return
        self.fail('The valid route must activate the switch.')

    def test_level5_selector_board_and_initial_indicators(self):
        self.assertEqual(self.page.locator('#levels option').count(), 6)  # five levels plus custom
        self.assertIn('5. The Door Is a Tool', self.page.locator('#levels option[value="4"]').inner_text())
        self.assertEqual(self.page.locator('#level-number').inner_text(), 'PUZZLE 05 / 05')
        self.assertEqual(self.page.locator('#level-title').inner_text(), 'The Door Is a Tool')
        self.assertEqual(self.page.locator('#board .cell').count(), 49)
        self.assertEqual(self.page.evaluate('GetOutLevels[4].board'), CANDIDATE_C)
        self.assertEqual(self.ui.position(), [6, 0])
        self.assertIn('Inactive switch', self.page.locator('#board .cell').nth(1).get_attribute('aria-label'))
        self.assertIn('Closed door', self.page.locator('#board .cell').nth(26).get_attribute('aria-label'))
        self.assertIn('exit', self.page.locator('#board .cell').nth(19).get_attribute('aria-label'))
        self.ui.assert_pieces(False)
        self.assertTrue(self.page.locator('#undo').is_disabled())

    def test_winning_route_uses_closed_stop_activates_crosses_and_announces_victory(self):
        solution = self.page.evaluate('GetOut.solve(window.__levelTestState)')
        seen = {'closedStop': False, 'activation': False, 'traversal': False}
        for action in solution:
            events = self.advance(action)
            for name in seen:
                seen[name] |= events[name]
            if events['closedStop']:
                self.ui.assert_pieces(False)
                self.assertIn('Slid', self.page.locator('#status').inner_text())
            if events['activation']:
                self.assertIn('Switch activated! The door is now open.', self.page.locator('#status').inner_text())
        self.assertTrue(all(seen.values()))
        self.assertTrue(self.expected()['won'])
        self.assertIn('You got out in 11 moves', self.page.locator('#status').inner_text())
        self.assertTrue(self.page.locator('#hint').is_disabled())
        self.assertTrue(self.page.locator('#next').is_hidden())  # no sixth level

    def test_hints_and_undo_restore_the_pre_activation_state(self):
        self.assert_hint()
        self.reach_activation()
        self.assert_hint()
        previous = self.page.evaluate('''() => {
          const s=window.__levelTestHistory.pop(); window.__levelTestState=s;
          return {position:s.position,moves:s.moves};
        }''')
        self.page.locator('#undo').click()
        self.ui.assert_pieces(False)
        self.assertEqual(self.ui.position(), previous['position'])
        self.assertEqual(self.page.locator('#moves').inner_text(), str(previous['moves']))
        self.assertIn('door is closed again', self.page.locator('#status').inner_text())
        self.assert_hint()

    def test_reset_restores_initial_level_and_valid_hint(self):
        self.reach_activation()
        self.page.locator('#reset').click()
        self.init_expected()
        self.ui.assert_pieces(False)
        self.assertEqual(self.ui.position(), [6, 0])
        self.assertEqual(self.page.locator('#moves').inner_text(), '0')
        self.assertTrue(self.page.locator('#undo').is_disabled())
        self.assertEqual(self.page.locator('#trace-list').text_content(), 'No moves yet.')
        self.assertEqual(self.page.locator('#levels').input_value(), '4')
        self.assert_hint()

    def test_level5_narrow_board_controls_and_pair_are_usable(self):
        self.page.set_viewport_size({'width': 375, 'height': 812})
        self.ui.assert_pieces(False)
        self.assertTrue(self.page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
        self.assertLessEqual(self.page.locator('#board').bounding_box()['width'], 375)
        self.assertEqual(self.page.locator('#board .cell').count(), 49)
        self.assert_hint()
        self.reach_activation()
        self.ui.assert_pieces(True)
        self.assertTrue(self.page.evaluate('document.documentElement.scrollWidth <= innerWidth'))

    def test_next_from_original_level4_enters_level5_normally(self):
        self.page.locator('#levels').select_option('3')
        solution = self.page.evaluate('GetOut.solve(GetOut.create(GetOutLevels[3].board))')
        for action in solution:
            self.ui.move(action)
        self.assertTrue(self.page.locator('#next').is_visible())
        self.page.locator('#next').click()
        self.assertEqual(self.page.locator('#levels').input_value(), '4')
        self.assertEqual(self.page.locator('#level-title').inner_text(), 'The Door Is a Tool')
        self.ui.assert_pieces(False)


if __name__ == '__main__':
    unittest.main()
