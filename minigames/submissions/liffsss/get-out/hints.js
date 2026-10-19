(function (root) {
  'use strict';
  const game = typeof module !== 'undefined' && module.exports ? require('./engine.js') : root.GetOut;
  const arrows = {up: '↑', right: '→', down: '↓', left: '←'};
  const deltas = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  const borders = {up: 'top', right: 'right', down: 'bottom', left: 'left'};

  function clue(state, level) {
    if (!Number.isInteger(level) || level < 1 || level > 3) throw new RangeError('Choose hint level 1, 2, or 3.');
    if (state.won) return {kind: 'complete', level: 0, message: 'You already reached the exit. Try another puzzle.'};
    const path = game.solve(state);
    if (path === null) return {kind: 'unreachable', level: 0, message: 'There is no route from this position. Undo or reset before asking for another clue.'};
    if (level === 1) return {kind: 'clue', level, message: 'Which wall or border could give you a useful stopping point? Getting closer to the door is not always progress.'};
    const action = path[0], next = game.step(state, action);
    if (level === 3) return {kind: 'clue', level, action, message: `Try ${arrows[action]} ${action}. Then think about why that stopping point helps.`};
    if (next.won) {
      return {kind: 'clue', level, message: 'Look at the exit square. Crossing it during a slide counts as escaping; you do not need a wall immediately behind it.'};
    }
    const [dr, dc] = deltas[action], r = next.position[0] + dr, c = next.position[1] + dc;
    const message = r < 0 || c < 0 || r >= state.board.length || c >= state.board[0].length
      ? `Look at the ${borders[action]} border. What stopping position could it give you before a turn?`
      : `Look at the wall at row ${r + 1}, column ${c + 1}. Where could it stop a slide so that you can turn?`;
    return {kind: 'clue', level, message};
  }

  const api = {clue};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GetOutHints = api;
})(globalThis);
