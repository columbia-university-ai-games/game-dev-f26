/* Get Out! classroom adaptation. Pure rules shared by browser and Node. */
(function (root) {
  'use strict';
  const directions = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  function create(board) {
    if (!Array.isArray(board) || board.length < 2 || board.length > 20 ||
        typeof board[0] !== 'string' || board[0].length < 2 || board[0].length > 20 ||
        board.some(row => typeof row !== 'string' || row.length !== board[0].length || /[^.#SEW]/.test(row))) {
      throw new Error('Use a rectangular board, 2–20 rows and columns, with only S, E, #, W, and .');
    }
    const all = board.join('');
    if (all.split('W').length > 4) throw new Error('Use at most three sliding walls.');
    if (all.split('S').length !== 2 || all.split('E').length !== 2) {
      throw new Error('Place exactly one start (S) and one exit (E).');
    }
    const r = board.findIndex(row => row.includes('S'));
    return {board: board.slice(), position: [r, board[r].indexOf('S')], moves: 0, won: false};
  }
  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    if (state.won) return state;
    const [dr, dc] = directions[action];
    let [r, c] = state.position;
    let board = state.board;
    while (true) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= state.board.length || nc < 0 || nc >= state.board[0].length || state.board[nr][nc] === '#') break;
      if (board[nr][nc] === 'W') {
        const wr = nr + dr, wc = nc + dc;
        if (wr < 0 || wr >= board.length || wc < 0 || wc >= board[0].length || !'.S'.includes(board[wr][wc])) break;
        const rows = board.map(row => row.split(''));
        rows[nr][nc] = '.'; rows[wr][wc] = 'W';
        board = rows.map(row => row.join(''));
        r = nr; c = nc;
        break; // A push ends the slide in the wall's old square.
      }
      r = nr; c = nc;
      if (state.board[r][c] === 'E') break;
    }
    if (r === state.position[0] && c === state.position[1]) return state;
    return {...state, board, position: [r, c], moves: state.moves + 1, won: state.board[r][c] === 'E'};
  }
  function legalActions(state) {
    return Object.keys(directions).filter(action => step(state, action) !== state);
  }
  function observe(state) {
    return {board: state.board.slice(), position: state.position.slice(), moves: state.moves,
      won: state.won, legalActions: legalActions(state)};
  }
  function solve(state, limit = 50000) {
    const keyOf = s => s.position.join(',') + ':' + s.board.join('/');
    const queue = [{state, path: []}], seen = new Set([keyOf(state)]);
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.state.won) return item.path;
      for (const action of legalActions(item.state)) {
        const next = step(item.state, action), key = keyOf(next);
        if (!seen.has(key)) {
          if (seen.size >= limit) return undefined; // Unknown, never claim unsolvable.
          seen.add(key); queue.push({state: next, path: [...item.path, action]});
        }
      }
    }
    return null;
  }
  const api = {create, step, legalActions, observe, solve};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GetOut = api;
})(globalThis);
