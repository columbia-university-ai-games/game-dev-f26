/* Get Out! classroom adaptation, swap-sides variation. Pure rules shared by browser and Node.
   A move that misses the exit swaps the ball and the exit, so play alternates sides. */
(function (root) {
  'use strict';
  const directions = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  function create(board) {
    if (!Array.isArray(board) || board.length < 2 || board.length > 20 ||
        typeof board[0] !== 'string' || board[0].length < 2 || board[0].length > 20 ||
        board.some(row => typeof row !== 'string' || row.length !== board[0].length || /[^.#SE]/.test(row))) {
      throw new Error('Use a rectangular board, 2–20 rows and columns, with only S, E, #, and .');
    }
    const all = board.join('');
    if (all.split('S').length !== 2 || all.split('E').length !== 2) {
      throw new Error('Place exactly one start (S) and one exit (E).');
    }
    const r = board.findIndex(row => row.includes('S')), er = board.findIndex(row => row.includes('E'));
    return {board: board.slice(), position: [r, board[r].indexOf('S')], exit: [er, board[er].indexOf('E')], moves: 0, won: false};
  }
  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    if (state.won) return state;
    const [dr, dc] = directions[action];
    const [er, ec] = state.exit;
    let [r, c] = state.position;
    while (true) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= state.board.length || nc < 0 || nc >= state.board[0].length || state.board[nr][nc] === '#') break;
      r = nr; c = nc;
      if (r === er && c === ec) break;
    }
    if (r === state.position[0] && c === state.position[1]) return state;
    if (r === er && c === ec) return {...state, position: [r, c], moves: state.moves + 1, won: true};
    // Missed the exit: the ball continues from the old exit, and the exit waits where the ball stopped.
    return {...state, position: [er, ec], exit: [r, c], moves: state.moves + 1, won: false};
  }
  function legalActions(state) {
    return Object.keys(directions).filter(action => step(state, action) !== state);
  }
  function observe(state) {
    // Board letters follow the moving exit, so the grid never shows a stale door.
    const [er, ec] = state.exit;
    const board = state.board.map((row, r) => [...row].map((v, c) => r === er && c === ec ? 'E' : v === 'E' ? '.' : v).join(''));
    return {board, position: state.position.slice(), exit: state.exit.slice(), moves: state.moves,
      won: state.won, legalActions: legalActions(state)};
  }
  function solve(state) {
    // The exit moves, so a search position is the ball and the exit together.
    const key = s => `${s.position}|${s.exit}`;
    const queue = [{state, path: []}], seen = new Set([key(state)]);
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.state.won) return item.path;
      for (const action of legalActions(item.state)) {
        const next = step(item.state, action);
        if (!seen.has(key(next))) {
          seen.add(key(next)); queue.push({state: next, path: [...item.path, action]});
        }
      }
    }
    return null;
  }
  const api = {create, step, legalActions, observe, solve};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GetOut = api;
})(globalThis);
