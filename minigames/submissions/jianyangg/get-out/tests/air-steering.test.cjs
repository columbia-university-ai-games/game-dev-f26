const {test} = require('node:test');
const assert = require('node:assert/strict');
const game = require('../engine.js');
const {AirSteering} = require('../air-steering.js');
const board = ['^^^^^^^', '^.....#', '^.....#', '^.#...#', '^.#.#.#', '^S#..E#', '#T#####'];

test('holding steering waits for clearance and moves only once in a flight', () => {
  const controls = new AirSteering();
  controls.press('KeyE', 'steer-right');
  let state = game.create(board);
  assert.equal(controls.action(state), null);
  state = game.input(state, 'jump');
  for (let i = 0; i < 2; i++) {
    state = game.tick(state, true);
    state = game.input(state, controls.action(state));
    assert.equal(state.steered, false);
  }
  state = game.tick(state, true);
  state = game.input(state, controls.action(state));
  assert.deepEqual(state.position, [2, 2]);
  assert.equal(controls.action(state), null);
});

test('held screen directions stay perpendicular and do not turn gravity on landing', () => {
  const controls = new AirSteering();
  controls.press('ArrowUp', 'up');
  const falling = game.input(game.create(['#####', '#..E#', '#S..#', '#####']), 'right');
  assert.equal(controls.action(falling), 'up');
  assert.equal(controls.action({...falling, gravity: 'up'}), null);
  assert.equal(controls.action({...falling, grounded: true}), null);
  controls.release('ArrowUp');
  assert.equal(controls.action(falling), null);
  controls.press('KeyQ', 'steer-left');controls.clear();
  assert.equal(controls.action(falling), null);
});
