/* Optional help only: the unchanged engine owns movement and the solver. */
(function (root) {
  'use strict';
  const game = typeof module !== 'undefined' && module.exports ? require('./engine.js') : root.GetOut;
  const labels = ['Think', 'Notice', 'Reveal'];
  const arrows = {up: '↑', right: '→', down: '↓', left: '←'};
  const directions = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};

  function getHint(state, level) {
    if (!Number.isInteger(level) || level < 1 || level > 3) throw new RangeError('Hint level must be 1, 2, or 3.');
    const hint = {level, label: labels[level - 1]};
    const path = game.solve(state);
    if (path === null) return {...hint, kind: 'unreachable',
      message: 'No route reaches the exit from here. Undo to try an earlier position, or reset this attempt.'};
    if (!path.length) return {...hint, kind: 'complete', message: 'You already reached the exit. Undo or choose another puzzle to keep exploring.'};
    if (level === 1) return {...hint, kind: 'question',
      message: 'Which stopping point could align a slide with the exit?'};
    if (level === 3) return {...hint, kind: 'reveal', action: path[0],
      message: `Direct solution hint: ${arrows[path[0]]} ${path[0]}. This begins a shortest route.`};

    // Inspect the final approach, not the next destination. On short routes,
    // avoid wall coordinates that would give away the very next stopping point.
    if (path.length === 1) return {...hint, kind: 'feature',
      message: 'The exit can be crossed during a slide; you do not need to stop at the outside border.'};
    let approach = state;
    for (const action of path.slice(0, -1)) approach = game.step(approach, action);
    const finalDelta = directions[path[path.length - 1]];
    const axis = finalDelta[0] === 0 ? 'row' : 'column';
    const line = approach.position[axis === 'row' ? 0 : 1] + 1;
    const [dr, dc] = directions[path[path.length - 2]];
    const r = approach.position[0] + dr, c = approach.position[1] + dc;
    const border = r < 0 || r >= state.board.length || c < 0 || c >= state.board[0].length;
    const support = border ? 'The outside border' : path.length >= 3 ? `The wall at row ${r + 1}, column ${c + 1}` : 'A wall';
    return {...hint, kind: 'feature',
      message: `${support} provides a stopping point on the exit’s ${axis} (${line}) before the final slide on a shortest route.`};
  }
  const api = {getHint};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GetOutHints = api;
})(globalThis);
