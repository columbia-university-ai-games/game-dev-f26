const {test} = require('node:test');
const assert = require('node:assert/strict');
const game = require('../engine.js');
const {search} = require('../solver.js');
const levels = require('../levels.js');

test('the sequence keeps the 7×7 grid and a hazard-free first level', () => {
  for (const level of levels) {
    assert.equal(level.board.length, 7);
    assert.ok(level.board.every(row => row.length === 7));
  }
  assert.ok(!/[\^~]/.test(levels[0].board.join('')));
});

test('level two starts with a detour and uses four intermediate landings', () => {
  const level = levels[1];
  let state = game.create(level.board);
  const start = state.position;
  const goalRow = level.board.findIndex(row => row.includes('E'));
  const goal = [goalRow, level.board[goalRow].indexOf('E')];
  const distance = p => Math.abs(p[0] - goal[0]) + Math.abs(p[1] - goal[1]);
  const route = search(level.board);
  assert.equal(route.status, 'solved');
  const landings = new Set();
  let firstMove = null;
  for (const action of route.path) {
    state = action === 'tick' || action === 'hold'
      ? game.tick(state, action === 'hold') : game.input(state, action);
    if (!firstMove && state.position.join() !== start.join()) firstMove = state.position;
    if (state.grounded) landings.add(state.position.join());
  }
  assert.ok(distance(firstMove) > distance(start), 'first physical move leads away from the exit');
  assert.ok(landings.size >= 4, 'route uses four intermediate landings');
});

test('level three offers a safe gravity route and a trampoline alternative', () => {
  const board = levels[2].board;
  assert.equal(search(board).status, 'solved');
  assert.equal(search(board, {allowJump: false}).status, 'solved');
  assert.equal(search(board, {allowSteering: false}).status, 'unreachable');
  let state = game.create(board);
  const [r, c] = state.position;
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    assert.ok(!['^', '~'].includes(board[r + dr]?.[c + dc]));
  }
  state = game.input(state, 'jump');
  for (let i = 0; i < 3; i++) state = game.tick(state, true);
  state = game.input(state, 'steer-right');
  assert.equal(state.grounded, true);
  state = game.input(state, 'jump');
  state = game.input(state, 'steer-right');
  for (let i = 0; i < 20 && !state.won; i++) state = game.tick(state);
  assert.equal(state.won, true);
  assert.equal(state.health, 15);
});

test('search distinguishes exhausting its budget from proving a board unreachable', () => {
  assert.equal(search(['S.E', '...'], {limit: 1}).status, 'limit');
  assert.equal(search(['S#E', '###']).status, 'unreachable');
});
