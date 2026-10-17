'use strict';
// Offline design verification only; this helper never changes the game rules.
const game = require('./engine.js');
const directions = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};

function transitionEvents(before, action, after = game.step(before, action)) {
  const distance = Math.abs(after.position[0] - before.position[0]) +
    Math.abs(after.position[1] - before.position[1]);
  if (distance === 0) {
    return {closedDoorStop: false, openDoorTraversal: false, switchActivated: false};
  }
  const [dr, dc] = directions[action], [r, c] = after.position;
  // Winning stops at E, so an adjacent D beyond E is not the cause of that stop.
  const closedDoorStop = !before.doorOpen && !after.doorOpen && !after.won &&
    before.board[r + dr]?.[c + dc] === 'D';
  let passedDoor = false;
  // Only entered cells count, not a door at the slide's starting position.
  for (let i = 1; i <= distance; i++) {
    if (before.board[before.position[0] + dr * i][before.position[1] + dc * i] === 'D') {
      passedDoor = true;
    }
  }
  return {closedDoorStop, openDoorTraversal: after.doorOpen && passedDoor,
    switchActivated: !before.doorOpen && after.doorOpen};
}

function analyzeBoard(board) {
  const initial = game.create(board);
  const nodes = [{state: initial, stopped: false, traversed: false, depth: 0}];
  const key = node => JSON.stringify([...node.state.position, node.state.doorOpen,
    node.stopped, node.traversed]);
  const seen = new Map([[key(nodes[0]), 0]]), reverse = [[]], wins = [];
  let transitions = 0, blockedInputsIgnored = 0, earlyActivationTransitions = 0;
  // Board geometry is fixed. Move count cannot affect future legal moves, and
  // two monotone history flags retain exactly the events being verified.
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.state.won) { wins.push(i); continue; }
    for (const action of Object.keys(directions)) {
      const next = game.step(node.state, action);
      if (next === node.state) { blockedInputsIgnored++; continue; }
      const events = transitionEvents(node.state, action, next);
      const stopped = node.stopped || events.closedDoorStop;
      if (events.switchActivated && !stopped) earlyActivationTransitions++;
      const child = {state: next, stopped,
        traversed: node.traversed || events.openDoorTraversal, depth: node.depth + 1};
      let index = seen.get(key(child));
      if (index === undefined) {
        index = nodes.length; seen.set(key(child), index); nodes.push(child); reverse.push([]);
      }
      reverse[index].push(i); transitions++;
    }
  }
  // Reverse reachability assesses losing positions without enumerating routes.
  const canWin = new Set(wins), pending = wins.slice();
  for (let i = 0; i < pending.length; i++) {
    for (const predecessor of reverse[pending[i]]) {
      if (!canWin.has(predecessor)) { canWin.add(predecessor); pending.push(predecessor); }
    }
  }
  const counterexamples = {
    withoutSwitchActivation: wins.filter(i => !nodes[i].state.doorOpen).length,
    withoutClosedDoorStop: wins.filter(i => !nodes[i].stopped).length,
    withoutOpenDoorTraversal: wins.filter(i => !nodes[i].traversed).length,
  };
  const solvable = wins.length > 0;
  // Necessity must not pass vacuously on a board with no winning states.
  const constraints = {solvable,
    switchNecessary: solvable && counterexamples.withoutSwitchActivation === 0,
    closedDoorStopNecessary: solvable && counterexamples.withoutClosedDoorStop === 0,
    openDoorTraversalNecessary: solvable && counterexamples.withoutOpenDoorTraversal === 0};
  return {
    dimensions: {rows: board.length, columns: board[0].length},
    wallCount: board.join('').split('#').length - 1,
    reachableStates: nodes.length,
    reachableBaseStates: new Set(nodes.map(node => JSON.stringify([
      ...node.state.position, node.state.doorOpen]))).size,
    closedDoorStates: nodes.filter(node => !node.state.doorOpen).length,
    openDoorStates: nodes.filter(node => node.state.doorOpen).length,
    transitions, blockedInputsIgnored, winningStates: wins.length,
    shortestSolutionLength: game.solve(initial)?.length ?? null,
    exhaustiveShortestLength: solvable ? Math.min(...wins.map(i => nodes[i].depth)) : null,
    earlyActivationTransitions,
    nonWinningDeadEndStates: nodes.filter((node, i) => !node.state.won && !canWin.has(i)).length,
    constraints, counterexamples, verified: Object.values(constraints).every(Boolean),
  };
}

function verifyInstalledLevel() {
  const level = require('./levels.js')[4];
  if (!level) throw new Error('Level 5 is not installed.');
  const report = analyzeBoard(level.board);
  const approvedBoard = ['.T.....', '.....#.', '....#E#', '.....D.', '.......', '#...#..', 'S.....#'];
  const approvedCandidateMatches = JSON.stringify(level.board) === JSON.stringify(approvedBoard) &&
    report.dimensions.rows === 7 && report.dimensions.columns === 7 && report.wallCount === 6 &&
    report.shortestSolutionLength === 11 && report.reachableStates === 33 && report.transitions === 65;
  return {title: level.name, ...report, approvedCandidateMatches,
    verified: report.verified && approvedCandidateMatches};
}

module.exports = {analyzeBoard, transitionEvents, verifyInstalledLevel};
if (require.main === module) {
  const report = verifyInstalledLevel();
  // Deliberately report counts and length, never the winning move sequence.
  console.log(JSON.stringify(report, null, 2));
  if (!report.verified) process.exitCode = 1;
}
