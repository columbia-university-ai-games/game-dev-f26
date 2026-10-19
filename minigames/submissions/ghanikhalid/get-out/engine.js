/* Get Out! classroom adaptation. Pure rules shared by browser and Node. */
(function (root) {
  'use strict';
  const directions = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  function create(board) {
    if (!Array.isArray(board) || board.length < 2 || board.length > 20 ||
        typeof board[0] !== 'string' || board[0].length < 2 || board[0].length > 20 ||
        board.some(row => typeof row !== 'string' || row.length !== board[0].length || /[^.#SEK]/.test(row))) {
      throw new Error('Use a rectangular board, 2–20 rows and columns, with only S, E, K, #, and .');
    }
    const all = board.join('');
    if (all.split('S').length !== 2 || all.split('E').length !== 2) {
      throw new Error('Place exactly one start (S) and one exit (E).');
    }
    if (all.split('K').length > 2) throw new Error('Use at most one key (K).');
    const r = board.findIndex(row => row.includes('S'));
    return {board: board.slice(), position: [r, board[r].indexOf('S')], moves: 0, won: false, hasKey: !all.includes('K')};
  }
  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    if (state.won) return state;
    const [dr, dc] = directions[action];
    if (state.board[state.position[0]][state.position[1]] === 'K' && state.keyArrival &&
        directions[state.keyArrival][0] === -dr && directions[state.keyArrival][1] === -dc) return state;
    let [r, c] = state.position;
    while (true) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= state.board.length || nc < 0 || nc >= state.board[0].length || state.board[nr][nc] === '#' || (state.board[nr][nc] === 'E' && !state.hasKey) || (state.board[nr][nc] === 'K' && state.hasKey)) break;
      r = nr; c = nc;
      if (state.board[r][c] === 'E' || state.board[r][c] === 'K') break;
    }
    if (r === state.position[0] && c === state.position[1]) return state;
    return {...state, position: [r, c], moves: state.moves + 1, keyArrival: state.board[r][c] === 'K' ? action : null, hasKey: state.hasKey || state.board[r][c] === 'K', won: state.board[r][c] === 'E'};
  }
  function legalActions(state) {
    return Object.keys(directions).filter(action => step(state, action) !== state);
  }
  function observe(state) {
    return {board: state.board.slice(), position: state.position.slice(), moves: state.moves,
      won: state.won, hasKey: state.hasKey, keyArrival: state.keyArrival || null, legalActions: legalActions(state)};
  }
  function solve(state) {
    const queue = [{state, path: []}], seen = new Set([state.position.join(',') + ':' + state.hasKey + ':' + state.keyArrival]);
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.state.won) return item.path;
      for (const action of legalActions(item.state)) {
        const next = step(item.state, action), key = next.position.join(',') + ':' + next.hasKey + ':' + next.keyArrival;
        if (!seen.has(key)) {
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
