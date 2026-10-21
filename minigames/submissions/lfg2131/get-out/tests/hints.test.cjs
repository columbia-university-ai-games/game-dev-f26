const {test} = require('node:test');
const assert = require('node:assert/strict');
const game = require('../engine.js');
const levels = require('../levels.js');
const {getHint} = require('../hints.js');

function reachableStates(initial) {
  const queue = [initial], seen = new Set([initial.position.join(',')]);
  for (let i = 0; i < queue.length; i++) {
    for (const action of game.legalActions(queue[i])) {
      const next = game.step(queue[i], action), key = next.position.join(',');
      if (!seen.has(key)) { seen.add(key); queue.push(next); }
    }
  }
  return queue;
}

// Reproducible imported boards include rectangles, narrow corridors and walls.
function customBoards() {
  let seed = 4126;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 2 ** 32; };
  return Array.from({length: 36}, (_, index) => {
    const rows = 2 + index % 8, cols = 2 + (index * 3) % 9;
    const board = Array.from({length: rows}, () => Array.from({length: cols}, () => random() < .25 ? '#' : '.'));
    board[0][0] = 'S'; board[rows - 1][cols - 1] = 'E';
    return board.map(row => row.join(''));
  });
}

function checkHints(state) {
  const before = JSON.stringify(state), path = game.solve(state);
  for (let level = 1; level <= 3; level++) {
    const hint = getHint(state, level);
    assert.equal(hint.level, level);
    assert.equal(typeof hint.message, 'string');
    assert.ok(hint.message.length > 0 && hint.message.length < 350);
    assert.deepEqual(getHint(state, level), hint, 'repeated requests must be deterministic');
    assert.equal(JSON.stringify(state), before, 'hints must not mutate board, position, moves or terminal status');
    if (state.won) {
      assert.equal(hint.kind, 'complete');
      assert.equal(hint.action, undefined);
    } else if (path === null) {
      assert.equal(hint.kind, 'unreachable');
      assert.match(hint.message, /no route/i);
      assert.match(hint.message, /undo|reset/i);
      assert.equal(hint.action, undefined);
    } else if (level === 3) {
      assert.equal(hint.label, 'Reveal');
      assert.equal(hint.kind, 'reveal');
      assert.equal(hint.action, path[0], 'direct hint must match the existing BFS solver');
      assert.ok(hint.message.includes(path[0]));
    } else {
      assert.equal(hint.label, level === 1 ? 'Think' : 'Notice');
      assert.equal(hint.kind, level === 1 ? 'question' : 'feature');
      assert.equal(hint.action, undefined, 'early hints must not publish the solver action');
      assert.doesNotMatch(hint.message, /\b(up|right|down|left)\b|[↑→↓←]/i, 'early hints must not directly name a movement direction');
      if (level === 1) assert.match(hint.message, /\?/);
      if (level === 2) checkNotice(state, path, hint.message);
    }
  }
}

function checkNotice(state, path, message) {
  // Every coordinate that the clue calls a wall must be a real wall. Its
  // support must stop a solver route before the final slide across the exit.
  const stoppingState = path.slice(0, -1).reduce((current, action) => game.step(current, action), state);
  const deltas = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  const coordinates = [...message.matchAll(/row (\d+),? column (\d+)/gi)];
  for (const match of coordinates) {
    const r = Number(match[1]) - 1, c = Number(match[2]) - 1;
    assert.equal(state.board[r]?.[c], '#', `clue's wall (${r}, ${c}) must exist`);
    assert.ok(path.length >= 3, 'do not name a wall that directly exposes the first move');
    const [dr, dc] = deltas[path.at(-2)];
    assert.deepEqual([r, c], [stoppingState.position[0] + dr, stoppingState.position[1] + dc]);
  }
  if (/exit.s row/i.test(message)) {
    const exitRow = state.board.findIndex(row => row.includes('E'));
    assert.equal(stoppingState.position[0], exitRow);
  }
  if (/exit.s column/i.test(message)) {
    const exitColumn = state.board.find(row => row.includes('E')).indexOf('E');
    assert.equal(stoppingState.position[1], exitColumn);
  }
  const line = message.match(/exit[’']s (row|column) \((\d+)\)/i);
  if (line) assert.equal(Number(line[2]) - 1, stoppingState.position[line[1] === 'row' ? 0 : 1]);
  if (/outside border provides/i.test(message)) {
    assert.ok(path.length >= 2);
    const [dr, dc] = deltas[path.at(-2)];
    const r = stoppingState.position[0] + dr, c = stoppingState.position[1] + dc;
    assert.ok(r < 0 || r >= state.board.length || c < 0 || c >= state.board[0].length, 'claimed border really stops the final approach');
  }
  if (/^A wall provides/i.test(message)) {
    const [dr, dc] = deltas[path.at(-2)];
    assert.equal(state.board[stoppingState.position[0] + dr]?.[stoppingState.position[1] + dc], '#');
  }
}

test('Think, Notice and Reveal remain truthful at every reachable challenge-board state', () => {
  for (const level of levels) {
    for (const state of reachableStates(game.create(level.board))) checkHints(state);
  }
});

test('progressive hints support deterministic arbitrary custom boards, including unreachable ones', () => {
  let solvable = 0, unreachable = 0;
  for (const board of customBoards()) {
    const initial = game.create(board);
    if (game.solve(initial) === null) unreachable++; else solvable++;
    for (const state of reachableStates(initial)) checkHints(state);
  }
  assert.ok(solvable > 0 && unreachable > 0, 'exercise both recovery guidance and valid routes');
});

test('one-slide and two-slide solutions preserve early discovery and reveal only at level three', () => {
  for (const board of [['S.E..', '.....'], ['S..', '...', '..E']]) {
    const state = game.create(board);
    checkHints(state);
    assert.doesNotMatch(getHint(state, 2).message, /row \d+,? column \d+/i);
  }
});

test('unreachable and won states never suggest a movement action', () => {
  const unreachable = game.create(['S..', '.E.', '...']);
  const won = game.step(game.create(['SE', '..']), 'right');
  checkHints(unreachable); checkHints(won);
});

test('hints do not depend on previous states or request order', () => {
  let state = game.create(levels[1].board);
  for (const action of game.solve(state)) {
    const original = getHint(state, 1);
    getHint(state, 3); getHint(state, 2);
    assert.deepEqual(getHint(state, 1), original);
    state = game.step(state, action);
    checkHints(state);
  }
});

test('invalid hint levels are rejected explicitly', () => {
  const state = game.create(levels[0].board);
  for (const level of [0, 4, -1, 1.5, NaN, Infinity, '1', null, undefined]) {
    assert.throws(() => getHint(state, level), RangeError);
  }
});
