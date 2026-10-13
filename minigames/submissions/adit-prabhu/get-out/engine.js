/* Get Out! classroom adaptation. Pure rules shared by browser and Node. */
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
    const r = board.findIndex(row => row.includes('S'));
    return {board: board.slice(), position: [r, board[r].indexOf('S')], moves: 0, won: false};
  }
  // Variation: walls break. The first collision cracks a wall (#→x); the next removes it.
  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    if (state.won) return state;
    const [dr, dc] = directions[action];
    let [r, c] = state.position, hit = null;
    while (true) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= state.board.length || nc < 0 || nc >= state.board[0].length) break;
      if (state.board[nr][nc] === '#' || state.board[nr][nc] === 'x') { hit = [nr, nc]; break; }
      r = nr; c = nc;
      if (state.board[r][c] === 'E') break;
    }
    const moved = r !== state.position[0] || c !== state.position[1];
    if (!moved && !hit) return state;
    let board = state.board;
    if (hit) {
      const [hr, hc] = hit, row = board[hr];
      board = board.slice();
      board[hr] = row.slice(0, hc) + (row[hc] === '#' ? 'x' : '.') + row.slice(hc + 1);
    }
    return {...state, board, position: [r, c], moves: state.moves + 1, won: state.board[r][c] === 'E'};
  }
  function legalActions(state) {
    return Object.keys(directions).filter(action => step(state, action) !== state);
  }
  function observe(state) {
    return {board: state.board.slice(), position: state.position.slice(), moves: state.moves,
      won: state.won, legalActions: legalActions(state)};
  }
  // Breakable walls make the board part of the state, so the search is capped.
  const key = state => state.position.join(',') + '|' + state.board.join('');
  function solve(state, limit = 100000) {
    const queue = [{state, parent: null, action: null}], seen = new Set([key(state)]);
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.state.won) {
        const path = [];
        for (let node = item; node.parent; node = node.parent) path.unshift(node.action);
        return path;
      }
      for (const action of legalActions(item.state)) {
        const next = step(item.state, action), k = key(next);
        if (!seen.has(k)) {
          if (seen.size >= limit) throw new Error('This board is too complex for the solver to check. Try fewer walls.');
          seen.add(k); queue.push({state: next, parent: item, action});
        }
      }
    }
    return null;
  }
  const api = {create, step, legalActions, observe, solve};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GetOut = api;
})(globalThis);
