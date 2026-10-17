/* Get Out! classroom adaptation, thin-ice variation. Pure rules shared by browser and Node.
   Every square the player starts on or slides over cracks. Entering a cracked
   square again drops the player through the ice and restarts the attempt. */
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
    const r = board.findIndex(row => row.includes('S')), start = [r, board[r].indexOf('S')];
    return fresh(board.slice(), start, 0);
  }
  function fresh(board, start, falls) {
    return {board, start, position: start.slice(), moves: 0, won: false,
      cracked: [start.join(',')], falls, fell: null};
  }
  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    if (state.won) return state;
    const [dr, dc] = directions[action];
    let [r, c] = state.position;
    const crossed = [];
    while (true) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= state.board.length || nc < 0 || nc >= state.board[0].length || state.board[nr][nc] === '#') break;
      if (state.cracked.includes(`${nr},${nc}`)) {
        return {...fresh(state.board, state.start, state.falls + 1),
          fell: {action, from: state.position.slice(), at: [nr, nc]}};
      }
      r = nr; c = nc; crossed.push(`${r},${c}`);
      if (state.board[r][c] === 'E') break;
    }
    if (r === state.position[0] && c === state.position[1]) return state;
    return {...state, position: [r, c], moves: state.moves + 1, won: state.board[r][c] === 'E',
      cracked: [...state.cracked, ...crossed], fell: null};
  }
  function legalActions(state) {
    return Object.keys(directions).filter(action => step(state, action) !== state);
  }
  function observe(state) {
    return {board: state.board.slice(), position: state.position.slice(), moves: state.moves,
      won: state.won, cracked: state.cracked.slice(), falls: state.falls, legalActions: legalActions(state)};
  }
  // Searches safe routes only: falling restarts the attempt, so it never helps.
  // A state is its position plus the set of cracked squares.
  const SEARCH_LIMIT = 200000;
  function solve(state) {
    const keyOf = s => s.position.join(',') + '|' + s.cracked.slice().sort().join(';');
    const queue = [{state, path: []}], seen = new Set([keyOf(state)]);
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.state.won) return item.path;
      for (const action of legalActions(item.state)) {
        const next = step(item.state, action);
        if (next.fell) continue;
        const key = keyOf(next);
        if (!seen.has(key)) {
          if (seen.size >= SEARCH_LIMIT) throw new Error('This board is too open to check on thin ice. Add some walls and try again.');
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
