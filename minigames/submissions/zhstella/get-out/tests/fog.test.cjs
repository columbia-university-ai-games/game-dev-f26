const {test} = require('node:test');
const assert = require('node:assert/strict');
const base = require('../engine.js');
const fog = require('../fog.js');
const levels = require('../levels.js');
const board = ['S.....', '......', '.....E'];
const count = state => state.explored.flat().filter(Boolean).length;

test('starts with only a clipped 3 by 3 neighborhood, including walls and diagonals', () => {
  const state = fog.create(board);
  assert.equal(count(state), 4);
  assert.deepEqual(fog.observe(state).board, ['S.????', '..????', '??????']);
  const interior = fog.create(['.....', '.#...', '..S..', '.....', '....E']);
  assert.equal(count(interior), 9);
  assert.equal(fog.observe(interior).board[1][1], '#');
  assert.equal(fog.observe(interior).board[3][3], '.');
});

test('reveals every crossed neighborhood, including tiles far from either endpoint', () => {
  const initial = fog.create(board), snapshot = structuredClone(initial);
  const next = fog.step(initial, 'right');
  assert.deepEqual(next.position, [0, 5]);
  assert.equal(count(next), 12);
  assert.equal(next.explored[1][2], true);
  assert.deepEqual(fog.observe(next).board, ['S.....', '......', '??????']);
  assert.deepEqual(initial, snapshot);
});

test('knowledge persists when moving away and undo retains discoveries without mutating history', () => {
  const initial = fog.create(board);
  const right = fog.step(initial, 'right');
  const left = fog.step(right, 'left');
  assert.equal(count(left), 12);
  const undone = fog.undo(right, initial);
  assert.deepEqual(undone.position, initial.position);
  assert.equal(undone.moves, 0);
  assert.equal(count(undone), 12);
  assert.equal(count(initial), 4);
  undone.explored[0][0] = false;
  assert.equal(right.explored[0][0], true);
});

test('reset and another rectangular board get independent fresh exploration', () => {
  const played = fog.step(fog.create(board), 'right');
  assert.equal(count(fog.create(played.board)), 4);
  const nextBoard = fog.create(['....S', 'E....']);
  assert.deepEqual(fog.observe(nextBoard).board, ['???.S', '???..']);
  assert.equal(count(nextBoard), 4);
  assert.equal(count(played), 12);
});

test('blocked, invalid and terminal actions preserve state and knowledge', () => {
  const initial = fog.create(['S#E', '...']);
  const snapshot = structuredClone(initial);
  assert.equal(fog.step(initial, 'right'), initial);
  assert.equal(fog.step(initial, 'up'), initial);
  assert.throws(() => fog.step(initial, 'teleport'), /direction/i);
  assert.deepEqual(initial, snapshot);
  const won = fog.step(fog.create(['S..E..', '......']), 'right');
  assert.equal(fog.step(won, 'left'), won);
});

test('crossing a hidden exit wins mid-slide, stops revealing beyond its neighborhood, and can be undone', () => {
  const initial = fog.create(['S..E..', '......']);
  assert.equal(fog.observe(initial).board[0][3], '?');
  const won = fog.step(initial, 'right');
  assert.equal(won.won, true);
  assert.deepEqual(won.position, [0, 3]);
  assert.equal(won.moves, 1);
  assert.equal(won.explored[0][4], true);
  assert.equal(won.explored[0][5], false);
  const undone = fog.undo(won, initial);
  assert.equal(undone.won, false);
  assert.equal(undone.explored[0][3], true);
});

test('player observations hide unvisited types and cannot mutate the internal board or exploration', () => {
  const state = fog.create(board), observation = fog.observe(state);
  assert.equal(observation.board.join('').includes('E'), false);
  assert.deepEqual(observation.legalActions, ['right', 'down']);
  observation.position[0] = 42;
  observation.board[0] = 'broken';
  observation.explored[0][0] = false;
  assert.deepEqual(state.position, [0, 0]);
  assert.equal(state.board[0], board[0]);
  assert.equal(state.explored[0][0], true);
});

test('hints do not explore cells and keep the original full-map solution and unreachable result', () => {
  const initial = fog.create(board), snapshot = structuredClone(initial);
  assert.deepEqual(fog.solve(initial), base.solve(base.create(board)));
  assert.deepEqual(initial, snapshot);
  assert.equal(fog.solve(fog.create(['S..', '.E.', '...'])), null);
});

test('every reachable teaching-board position keeps the reference movement, legal actions and solutions', () => {
  for (const level of levels) {
    const queue = [fog.create(level.board)], seen = new Set();
    while (queue.length) {
      const state = queue.shift(), key = state.position.join(',');
      if (seen.has(key)) continue;
      seen.add(key);
      const reference = {board: state.board, position: state.position, moves: state.moves, won: state.won};
      assert.deepEqual(fog.observe(state).legalActions, base.legalActions(reference));
      assert.deepEqual(fog.solve(state), base.solve(reference));
      for (const action of ['up', 'right', 'down', 'left']) {
        const next = fog.step(state, action), expected = base.step(reference, action);
        for (const field of ['position', 'moves', 'won']) assert.deepEqual(next[field], expected[field]);
        if (next !== state) queue.push(next);
      }
    }
  }
});
