/* Exploration state layered over the unchanged Get Out sliding rules. */
(function (root) {
  'use strict';
  const game = typeof module !== 'undefined' && module.exports ? require('./engine.js') : root.GetOut;

  function reveal(explored, position) {
    const [r, c] = position;
    for (let row = Math.max(0, r - 1); row <= Math.min(explored.length - 1, r + 1); row++) {
      for (let col = Math.max(0, c - 1); col <= Math.min(explored[0].length - 1, c + 1); col++) {
        explored[row][col] = true;
      }
    }
  }

  function create(board) {
    const state = game.create(board);
    const explored = board.map(row => Array(row.length).fill(false));
    reveal(explored, state.position);
    return {...state, explored};
  }

  function step(state, action) {
    const next = game.step(state, action);
    if (next === state) return state;
    const explored = state.explored.map(row => row.slice());
    const dr = Math.sign(next.position[0] - state.position[0]);
    const dc = Math.sign(next.position[1] - state.position[1]);
    let [r, c] = state.position;
    // The engine's endpoint stops at a wall/border or the first crossed exit.
    while (r !== next.position[0] || c !== next.position[1]) {
      r += dr; c += dc;
      reveal(explored, [r, c]);
    }
    return {...next, explored};
  }

  function undo(current, previous) {
    // A player cannot unlearn a discovery by taking back a move.
    return {...previous, explored: current.explored.map(row => row.slice())};
  }

  function observe(state) {
    const observation = game.observe(state);
    observation.board = state.board.map((row, r) => Array.from(row, (cell, c) =>
      state.explored[r][c] ? cell : '?').join(''));
    observation.explored = state.explored.map(row => row.slice());
    return observation;
  }

  // Hints intentionally use the full-map solver and are labeled in the UI.
  const api = {create, step, undo, observe, solve: game.solve};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GetOutFog = api;
})(globalThis);
