const {test} = require('node:test');
const assert = require('node:assert/strict');
const game = require('../engine.js');
const board = ['########', '#....E.#', '#......#', '#......#', '#......#', '#......#', '#S.....#', '########'];
function height(heldTicks, trampoline = false) {
  const rows = board.slice();
  if (trampoline) rows[7] = '#T######';
  let state = game.input(game.create(rows), 'jump');
  let minimum = state.position[0];
  for (let tick = 0; tick < 20 && !state.grounded; tick++) {
    state = game.tick(state, tick < heldTicks);
    minimum = Math.min(minimum, state.position[0]);
  }
  return 6 - minimum;
}
test('tap, short hold and long hold produce progressively higher jumps', () => {
  assert.equal(height(0), 1);
  assert.equal(height(2), 2);
  assert.equal(height(3), 3);
  assert.equal(height(20), 3);
});
test('the trampoline preserves a small tap but raises the held-jump ceiling', () => {
  assert.equal(height(0, true), 1);
  assert.equal(height(2, true), 2);
  assert.equal(height(3, true), 3);
  assert.equal(height(4, true), 4);
  assert.equal(height(20, true), 4);
});
test('releasing a jump ends its boost window even if Space is pressed again in flight', () => {
  let state = game.input(game.create(board), 'jump');
  state = game.tick(state, true);
  state = game.tick(state, true);
  state = game.tick(state, false);
  const before = state.position[0];
  state = game.tick(state, true);
  assert.ok(state.position[0] > before);
});
