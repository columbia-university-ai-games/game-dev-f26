const {test} = require('node:test');
const assert = require('node:assert/strict');
const game = require('../engine.js');
const hints = require('../hints.js');
const levels = require('../levels.js');

test('a question and feature clue do not return a move; the third clue returns a legal solvable move', () => {
  for (const {board} of levels) {
    let state = game.create(board);
    while (!state.won) {
      const before = JSON.stringify(state);
      const question = hints.clue(state, 1), feature = hints.clue(state, 2), direct = hints.clue(state, 3);
      assert.equal(question.level, 1);
      assert.equal(feature.level, 2);
      assert.equal(Object.hasOwn(question, 'action'), false);
      assert.equal(Object.hasOwn(feature, 'action'), false);
      assert.ok(game.legalActions(state).includes(direct.action));
      assert.equal(direct.action, game.solve(state)[0]);
      assert.equal(JSON.stringify(state), before);
      state = game.step(state, direct.action);
    }
  }
});

test('feature clues identify an actual stopping wall, a border, or a mid-slide exit', () => {
  const wall = hints.clue(game.create(levels[0].board), 2);
  assert.match(wall.message, /wall at row 3, column 1/);
  const border = hints.clue(game.create(['S..', '...', '..E']), 2);
  assert.match(border.message, /right border/);
  const exit = hints.clue(game.create(['S.E..', '.....']), 2);
  assert.match(exit.message, /Crossing it during a slide/);
});

test('all tiers handle unreachable and completed states without suggesting an impossible move', () => {
  const stuck = game.create(['S..', '.E.', '...']);
  const won = game.step(game.create(['S.E', '...']), 'right');
  for (const level of [1, 2, 3]) {
    assert.equal(hints.clue(stuck, level).kind, 'unreachable');
    assert.match(hints.clue(stuck, level).message, /Undo or reset/);
    assert.equal(Object.hasOwn(hints.clue(stuck, level), 'action'), false);
    assert.equal(hints.clue(won, level).kind, 'complete');
    assert.equal(Object.hasOwn(hints.clue(won, level), 'action'), false);
  }
});

test('clues follow the current position after a move or undo and reject invalid tiers', () => {
  const start = game.create(levels[0].board), after = game.step(start, 'down');
  assert.equal(hints.clue(start, 3).action, 'down');
  assert.equal(hints.clue(after, 3).action, 'right');
  assert.equal(hints.clue(start, 3).action, 'down');
  for (const level of [0, 4, 1.5, NaN, '1']) assert.throws(() => hints.clue(start, level), RangeError);
});
