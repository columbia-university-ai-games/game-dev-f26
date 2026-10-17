'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const game = require('../engine.js');
const levels = require('../levels.js');
const reference = require('../../../../get-out/levels.js');
const candidateC = ['.T.....', '.....#.', '....#E#', '.....D.', '.......', '#...#..', 'S.....#'];

function verifier() {
  assert.ok(fs.existsSync(require('node:path').join(__dirname, '../verify-level5.cjs')),
    'The exhaustive verification helper must exist.');
  return require('../verify-level5.cjs');
}
function level() {
  assert.equal(levels.length, 5, 'Add exactly one fifth puzzle.');
  return levels[4];
}

test('exactly one level is added and the original four remain unchanged', () => {
  assert.equal(levels.length, 5);
  assert.deepEqual(levels.slice(0, 4), reference);
});
test('Level 5 is a valid 7 by 7 board with exactly one S E T D', () => {
  const board = level().board;
  assert.deepEqual(board, candidateC);
  assert.equal(board.join('').split('#').length - 1, 6);
  assert.equal(board.length, 7);
  assert.ok(board.every(row => row.length === 7));
  for (const symbol of ['S', 'E', 'T', 'D']) {
    assert.equal(board.join('').split(symbol).length - 1, 1);
  }
  assert.equal(game.create(board).doorOpen, false);
});
test('Level 5 is solvable in eleven moves and the actual engine replays the solver result', () => {
  const initial = game.create(level().board), solution = game.solve(initial);
  assert.ok(solution);
  assert.equal(solution.length, 11);
  const won = solution.reduce(game.step, initial);
  assert.equal(won.won, true);
  assert.equal(won.doorOpen, true);
  assert.equal(initial.doorOpen, false);
  assert.equal(initial.moves, 0);
});
for (const [name, counter] of [
  ['switch activation', 'withoutSwitchActivation'],
  ['a successful closed-door stop', 'withoutClosedDoorStop'],
  ['open-door traversal', 'withoutOpenDoorTraversal'],
]) {
  test(`every reachable winning state requires ${name}`, () => {
    const report = verifier().analyzeBoard(level().board);
    assert.ok(report.winningStates > 0);
    assert.equal(report.counterexamples[counter], 0);
    assert.equal(report.verified, true);
  });
}
test('exhaustive analysis visits all augmented states and agrees with the shortest solver', () => {
  const report = verifier().analyzeBoard(level().board);
  assert.equal(report.reachableStates, 33);
  assert.equal(report.transitions, 65);
  assert.equal(report.winningStates, 1);
  assert.equal(report.exhaustiveShortestLength, report.shortestSolutionLength);
  assert.equal(report.shortestSolutionLength, 11);
  assert.equal(report.nonWinningDeadEndStates, 0);
  assert.equal(report.earlyActivationTransitions, 0);
});
test('installed Level 5 verification pins the approved Candidate C design and metrics', () => {
  const helper = verifier();
  assert.equal(typeof helper.verifyInstalledLevel, 'function');
  const report = helper.verifyInstalledLevel();
  assert.equal(report.approvedCandidateMatches, true);
  assert.equal(report.verified, true);
  assert.equal(report.shortestSolutionLength, 11);
  assert.equal(report.reachableStates, 33);
  assert.equal(report.transitions, 65);
});
test('hints remain legal and winning from every reachable closed and open state', () => {
  const initial = game.create(level().board), queue = [initial];
  const key = state => `${state.position},${state.doorOpen}`;
  const seen = new Set([key(initial)]);
  let closed = 0, open = 0;
  for (let i = 0; i < queue.length; i++) {
    const state = queue[i], hintPath = game.solve(state);
    assert.ok(hintPath);
    assert.equal(hintPath.reduce(game.step, state).won, true);
    if (state.won) { assert.equal(hintPath.length, 0); continue; }
    assert.ok(game.legalActions(state).includes(hintPath[0]));
    state.doorOpen ? open++ : closed++;
    for (const action of game.legalActions(state)) {
      const next = game.step(state, action);
      if (!seen.has(key(next))) { seen.add(key(next)); queue.push(next); }
    }
  }
  assert.ok(closed > 0 && open > 0);
});
test('Level 5 activation snapshots support Undo and Reset', () => {
  const initial = game.create(level().board), history = [];
  let state = initial, restored;
  for (const action of game.solve(initial)) {
    const previous = state;
    history.push(previous); state = game.step(state, action);
    if (!previous.doorOpen && state.doorOpen) {
      restored = history.pop();
      assert.equal(restored.doorOpen, false);
      assert.deepEqual(restored.position, previous.position);
      assert.equal(restored.moves, previous.moves);
      assert.equal(game.solve(restored).reduce(game.step, restored).won, true);
      break;
    }
  }
  assert.ok(restored);
  assert.deepEqual(game.create(state.board), initial);
});

test('a successful slide ending immediately before a closed door qualifies', () => {
  const events = verifier().transitionEvents(game.create(['S.D.E', 'T####']), 'right');
  assert.equal(events.closedDoorStop, true);
  assert.equal(events.openDoorTraversal, false);
});
test('a blocked direction beside a closed door does not qualify', () => {
  const events = verifier().transitionEvents(game.create(['SD.E', 'T###', '####']), 'right');
  assert.equal(events.closedDoorStop, false);
  assert.equal(events.openDoorTraversal, false);
});
test('exit termination before an adjacent door does not count as a door stop', () => {
  const events = verifier().transitionEvents(game.create(['S.ED', 'T###']), 'right');
  assert.equal(events.closedDoorStop, false);
  assert.equal(events.openDoorTraversal, false);
});
test('a switch followed by a door in the same slide records traversal but no closed stop', () => {
  const events = verifier().transitionEvents(game.create(['STD.E.', '######']), 'right');
  assert.equal(events.switchActivated, true);
  assert.equal(events.openDoorTraversal, true);
  assert.equal(events.closedDoorStop, false);
});
test('activation alone is not mistaken for traversal', () => {
  const events = verifier().transitionEvents(game.create(['S.T..', 'D###E']), 'right');
  assert.equal(events.switchActivated, true);
  assert.equal(events.openDoorTraversal, false);
});
test('verifier detects a route bypassing activation and the closed stop', () => {
  const report = verifier().analyzeBoard(['S.E.D', 'T####']);
  assert.equal(report.verified, false);
  assert.ok(report.counterexamples.withoutSwitchActivation > 0);
  assert.ok(report.counterexamples.withoutClosedDoorStop > 0);
});
test('verifier detects wins without open-door traversal even after activation', () => {
  const report = verifier().analyzeBoard(['ST.E', 'D###']);
  assert.equal(report.verified, false);
  assert.equal(report.counterexamples.withoutSwitchActivation, 0);
  assert.ok(report.counterexamples.withoutOpenDoorTraversal > 0);
});
test('verifier rejects a same-slide shortcut that never uses the closed door to stop', () => {
  const report = verifier().analyzeBoard(['STD.E.', '######']);
  assert.equal(report.verified, false);
  assert.ok(report.counterexamples.withoutClosedDoorStop > 0);
  assert.equal(report.counterexamples.withoutOpenDoorTraversal, 0);
});
test('an unsolvable candidate cannot pass by vacuous absence of bypass wins', () => {
  const report = verifier().analyzeBoard(['SDTE', '####']);
  assert.equal(report.winningStates, 0);
  assert.equal(report.shortestSolutionLength, null);
  assert.equal(report.verified, false);
});
