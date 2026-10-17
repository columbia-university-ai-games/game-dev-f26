'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const game = require('../engine.js');

// Test fixtures only: the four teaching levels are unchanged.
const obstacle = ['S.D.E', 'T####'];
const revisit = ['SD.E', 'T###', '####'];

test('mechanic boards start with a closed door', () => {
  const state = game.create(obstacle);
  assert.equal(state.doorOpen, false);
  assert.deepEqual(state.position, [0, 0]);
  assert.equal(state.moves, 0);
  assert.equal(state.won, false);
});

test('legacy boards retain their original rules with doorOpen false', () => {
  const state = game.create(['S.E..', '.....']);
  assert.equal(state.doorOpen, false);
  assert.deepEqual(game.solve(state), ['right']);
  const won = game.step(state, 'right');
  assert.deepEqual(won.position, [0, 2]);
  assert.equal(won.won, true);
  assert.equal(won.doorOpen, false);
});

test('unpaired or duplicated switch and door symbols are rejected', () => {
  for (const board of [
    ['STE.', '....'], ['SDE.', '....'],
    ['STTE', 'D...'], ['STDE', 'D...'],
    ['STTE', 'DD..']
  ]) {
    assert.throws(() => game.create(board), /exactly one switch.*one door/i);
  }
  assert.doesNotThrow(() => game.create(['STDE', '....']));
});

test('extended boards still reject unknown symbols and malformed geometry', () => {
  for (const board of [
    ['STDXE', '.....'], ['STDE', '...'], ['STDE'],
    ['STD.', '....'], ['SSTD', '..E.'], ['STDE', 42]
  ]) assert.throws(() => game.create(board));
});

test('initial and moved snapshots cannot be mutated', () => {
  const board = obstacle.slice();
  const state = game.create(board);
  board[0] = 'changed outside the engine';
  assert.equal(state.board[0], obstacle[0]);
  const next = game.step(state, 'down');
  for (const snapshot of [state, next]) {
    assert.ok(Object.isFrozen(snapshot));
    assert.ok(Object.isFrozen(snapshot.board));
    assert.ok(Object.isFrozen(snapshot.position));
    assert.throws(() => { snapshot.doorOpen = false; }, TypeError);
    assert.throws(() => { snapshot.position[0] = 99; }, TypeError);
    assert.throws(() => { snapshot.board[0] = 'broken'; }, TypeError);
  }
  assert.equal(state.doorOpen, false);
  assert.deepEqual(state.position, [0, 0]);
  assert.equal(state.moves, 0);
  assert.equal(next.doorOpen, true);
  assert.equal(next.moves, 1);
});

test('a closed door stops a slide immediately before its cell', () => {
  const state = game.create(obstacle);
  const next = game.step(state, 'right');
  assert.deepEqual(next.position, [0, 1]);
  assert.equal(next.doorOpen, false);
  assert.equal(next.moves, 1);
  assert.equal(next.won, false);
});

test('a closed adjacent door blocks an action without changing state', () => {
  const state = game.create(revisit);
  assert.strictEqual(game.step(state, 'right'), state);
  assert.deepEqual(game.legalActions(state), ['down']);
  assert.equal(state.moves, 0);
  assert.equal(state.doorOpen, false);
  assert.throws(() => game.step(state, 'teleport'), /direction/i);
  assert.equal(state.doorOpen, false);
});

test('an activated door is traversable on a later slide', () => {
  let state = game.step(game.create(obstacle), 'down');
  assert.equal(state.doorOpen, true);
  state = game.step(state, 'up');
  const won = game.step(state, 'right');
  assert.deepEqual(won.position, [0, 4]);
  assert.equal(won.won, true);
  assert.equal(won.doorOpen, true);
  assert.equal(won.moves, 3);
});

test('crossing a switch activates immediately without stopping the slide', () => {
  const initial = game.create(['S.T..#', 'D###E#']);
  const next = game.step(initial, 'right');
  assert.equal(next.doorOpen, true);
  assert.deepEqual(next.position, [0, 4]);
  assert.equal(next.moves, 1);
  assert.equal(next.won, false);
  assert.equal(initial.doorOpen, false);
});

test('landing on a switch at a boundary activates it', () => {
  const next = game.step(game.create(obstacle), 'down');
  assert.deepEqual(next.position, [1, 0]);
  assert.equal(next.doorOpen, true);
});

test('the switch opens a following door during the same slide', () => {
  const initial = game.create(['STD.E.', '######']);
  const won = game.step(initial, 'right');
  assert.deepEqual(won.position, [0, 4]);
  assert.equal(won.doorOpen, true);
  assert.equal(won.moves, 1);
  assert.equal(won.won, true);
  assert.equal(initial.won, false);
});

test('a switch beyond a closed door cannot activate through the door', () => {
  const initial = game.create(['SDTE', '####']);
  assert.strictEqual(game.step(initial, 'right'), initial);
  assert.equal(initial.doorOpen, false);
  assert.equal(game.solve(initial), null);
});

test('crossing the switch repeatedly never closes the door', () => {
  let state = game.create(['S.T..', 'D###E']);
  for (const action of ['right', 'left', 'right', 'left']) {
    state = game.step(state, action);
    assert.equal(state.doorOpen, true);
  }
  assert.deepEqual(state.position, [0, 0]);
  assert.equal(state.moves, 4);
});

test('undoing activation restores the saved position, moves and closed door', () => {
  const initial = game.create(obstacle);
  const history = [initial];
  const activated = game.step(initial, 'down');
  const restored = history.pop();
  assert.equal(activated.doorOpen, true);
  assert.equal(activated.moves, 1);
  assert.strictEqual(restored, initial);
  assert.deepEqual(restored.position, [0, 0]);
  assert.equal(restored.moves, 0);
  assert.equal(restored.doorOpen, false);
  assert.deepEqual(game.step(restored, 'right').position, [0, 1]);
});

test('undoing a later move preserves the previously open door', () => {
  const activated = game.step(game.create(obstacle), 'down');
  const history = [activated];
  const later = game.step(activated, 'up');
  const restored = history.pop();
  assert.deepEqual(later.position, [0, 0]);
  assert.deepEqual(restored.position, [1, 0]);
  assert.equal(restored.moves, 1);
  assert.equal(restored.doorOpen, true);
});

test('reset-compatible creation restores the entire initial state after victory', () => {
  const initial = game.create(obstacle);
  const won = ['down', 'up', 'right'].reduce(game.step, initial);
  assert.equal(won.won, true);
  const reset = game.create(won.board);
  assert.deepEqual(reset, initial);
  assert.notStrictEqual(reset, initial);
  assert.equal(reset.doorOpen, false);
  assert.equal(reset.moves, 0);
  assert.equal(reset.won, false);
  assert.equal(won.doorOpen, true);
});

test('observations include door state without exposing mutable engine arrays', () => {
  const initial = game.create(revisit);
  const open = game.step(game.step(initial, 'down'), 'up');
  const observation = game.observe(open);
  assert.equal(game.observe(initial).doorOpen, false);
  assert.equal(observation.doorOpen, true);
  assert.deepEqual(observation.legalActions, ['right', 'down']);
  observation.position[0] = 99;
  observation.board[0] = 'broken';
  observation.doorOpen = false;
  assert.deepEqual(open.position, [0, 0]);
  assert.equal(open.board[0], revisit[0]);
  assert.equal(open.doorOpen, true);
});

test('solver distinguishes revisiting the same position with a newly open door', () => {
  const initial = game.create(revisit);
  assert.deepEqual(game.solve(initial), ['down', 'up', 'right']);
  const atStartOpen = game.step(game.step(initial, 'down'), 'up');
  assert.deepEqual(atStartOpen.position, initial.position);
  assert.equal(initial.doorOpen, false);
  assert.equal(atStartOpen.doorOpen, true);
  assert.deepEqual(game.solve(atStartOpen), ['right']);
});

test('solver starts at the current position and preserves existing move count', () => {
  const initial = game.create(revisit);
  const activated = game.step(initial, 'down');
  const before = JSON.stringify(activated);
  const solution = game.solve(activated);
  assert.deepEqual(solution, ['up', 'right']);
  const won = solution.reduce(game.step, activated);
  assert.equal(won.won, true);
  assert.equal(won.moves, 3);
  assert.equal(JSON.stringify(activated), before);
  assert.deepEqual(activated.position, [1, 0]);
  assert.equal(activated.moves, 1);
  assert.equal(initial.doorOpen, false);
});

test('solver preserves shortest paths when activation and exit share a slide', () => {
  const initial = game.create(['STD.E.', '######']);
  assert.deepEqual(game.solve(initial), ['right']);
  const won = game.step(initial, 'right');
  assert.deepEqual(game.solve(won), []);
  assert.deepEqual(game.legalActions(won), []);
  assert.strictEqual(game.step(won, 'left'), won);
});

test('an unreachable exit terminates search in closed and open door states', () => {
  const initial = game.create(['S.D..', 'T#E#.', '.....']);
  assert.equal(game.solve(initial), null);
  const activated = game.step(initial, 'down');
  assert.equal(activated.doorOpen, true);
  assert.equal(game.solve(activated), null);
});

test('the exit ends sliding before a later switch can activate', () => {
  const won = game.step(game.create(['S.ETD', '#####']), 'right');
  assert.deepEqual(won.position, [0, 2]);
  assert.equal(won.won, true);
  assert.equal(won.doorOpen, false);
  assert.strictEqual(game.step(won, 'right'), won);
});
