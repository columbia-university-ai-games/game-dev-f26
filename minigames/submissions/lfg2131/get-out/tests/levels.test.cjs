const {test} = require('node:test');
const assert = require('node:assert/strict');
const game = require('../engine.js');
const levels = require('../levels.js');

const expectedLengths = [7, 7, 8, 8, 9, 9, 10, 11, 12, 15];
const actions = ['up', 'right', 'down', 'left'];

// Independent graph traversal: use the movement rules, not solve() or its
// legal-action enumeration, to establish the minimum number of slides.
function stoppingGraph(initial) {
  const queue = [{state: initial, distance: 0}];
  const seen = new Set([initial.position.join(',')]);
  for (let i = 0; i < queue.length; i++) {
    const {state, distance} = queue[i];
    for (const action of actions) {
      const next = game.step(state, action), key = next.position.join(',');
      if (next !== state && !seen.has(key)) {
        seen.add(key);
        queue.push({state: next, distance: distance + 1});
      }
    }
  }
  return queue;
}

function shortestDistance(state) {
  return stoppingGraph(state).find(item => item.state.won)?.distance ?? null;
}

test('ten distinct challenge boards have the independently verified shortest solution lengths', () => {
  assert.equal(levels.length, 10);
  assert.equal(new Set(levels.map(level => level.board.join('\n'))).size, levels.length);
  assert.equal(new Set(levels.map(level => level.name)).size, levels.length);
  for (const [index, level] of levels.entries()) {
    assert.ok(level.name.trim().length > 0 && level.prompt.trim().length > 0);
    const initial = game.create(level.board), before = JSON.stringify(initial);
    assert.equal(shortestDistance(initial), expectedLengths[index], `puzzle ${index + 1}: ${level.name}`);
    const solution = game.solve(initial);
    assert.equal(solution.length, expectedLengths[index]);
    let state = initial;
    for (const [move, action] of solution.entries()) {
      const next = game.step(state, action);
      assert.notDeepEqual(next.position, state.position, 'a solution cannot contain blocked slides');
      assert.equal(next.moves, move + 1);
      assert.equal(next.won, move === solution.length - 1, 'the solution ends as soon as the exit is crossed');
      state = next;
    }
    assert.equal(state.board[state.position[0]][state.position[1]], 'E');
    assert.deepEqual(game.solve(state), []);
    for (const action of actions) assert.equal(game.step(state, action), state);
    assert.equal(JSON.stringify(initial), before, 'solving and replaying must preserve the initial state');
  }
});

test('every reachable challenge-board position retains a route and agrees with the independent shortest distance', () => {
  for (const [index, level] of levels.entries()) {
    for (const {state} of stoppingGraph(game.create(level.board))) {
      const context = `puzzle ${index + 1}, position ${state.position.join(',')}`;
      const distance = shortestDistance(state), solution = game.solve(state);
      assert.notEqual(distance, null, `${context}: fair exploration must not create irreversible traps`);
      assert.ok(Array.isArray(solution), context);
      assert.equal(solution.length, distance, context);
      assert.equal(solution.reduce((current, action) => game.step(current, action), state).won, true, context);
      assert.equal(game.legalActions(state).length === 0, state.won, context);
    }
  }
});

function routeStructure(board) {
  let state = game.create(board);
  const exitRow = board.findIndex(row => row.includes('E'));
  const exitColumn = board[exitRow].indexOf('E');
  const nearness = candidate => Math.abs(candidate.position[0] - exitRow) + Math.abs(candidate.position[1] - exitColumn);
  let detours = 0, multiChoiceStops = 0, misleadingApproaches = 0;
  for (const action of game.solve(state)) {
    const next = game.step(state, action), minimum = shortestDistance(state);
    const choices = actions.map(direction => game.step(state, direction)).filter(candidate => candidate !== state);
    if (nearness(next) > nearness(state)) detours++;
    if (choices.length >= 3) multiChoiceStops++;
    if (choices.some(candidate => nearness(candidate) < nearness(state) &&
        shortestDistance(candidate) > minimum - 1)) misleadingApproaches++;
    state = next;
  }
  return {detours, multiChoiceStops, misleadingApproaches};
}

// Broad layout guardrails preserve the intended planning experiment. They do
// not claim that geometric distance or a long path proves human difficulty.
test('each challenge includes a recoverable closer-to-exit choice that costs extra slides', () => {
  for (const [index, level] of levels.entries()) {
    assert.ok(routeStructure(level.board).misleadingApproaches > 0, `puzzle ${index + 1}: approaching the exit must not always be optimal`);
  }
});

test('the finale combines several detours and choice points rather than a forced long corridor', () => {
  const structure = routeStructure(levels.at(-1).board);
  assert.ok(structure.detours >= 3, 'the shortest route needs several slides away from the exit');
  assert.ok(structure.multiChoiceStops >= 3, 'several stops must offer at least three legal directions');
});
