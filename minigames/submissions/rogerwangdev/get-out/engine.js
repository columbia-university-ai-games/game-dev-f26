/* Get Out! classroom adaptation. Pure rules shared by browser and Node. */
(function (root) {
  'use strict';
  const directions = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  function create(board, budget) {
    if (!Array.isArray(board) || board.length < 2 || board.length > 20 ||
        typeof board[0] !== 'string' || board[0].length < 2 || board[0].length > 20 ||
        board.some(row => typeof row !== 'string' || row.length !== board[0].length || /[^.#SEB]/.test(row))) {
      throw new Error('Use a rectangular board, 2–20 rows and columns, with only S, E, optional B, #, and .');
    }
    const all = board.join('');
    if (all.split('S').length !== 2 || all.split('E').length !== 2) {
      throw new Error('Place exactly one start (S) and one exit (E).');
    }
    if (all.split('B').length > 2) throw new Error('Place at most one block (B).');
    const br = board.findIndex(row => row.includes('B'));
    const r = board.findIndex(row => row.includes('S'));
    const state = {board: board.map(row => row.replace('B','.')), block: br < 0 ? null : [br,board[br].indexOf('B')], position: [r, board[r].indexOf('S')], moves: 0,
      won: false, failed: false, remaining: Infinity};
    if (budget === undefined) {
      const path = solve(state);
      budget = path === null ? 2 : path.length + 2;
    }
    if (!Number.isInteger(budget) || budget < 1) throw new Error('Move budget must be a positive integer.');
    return {...state, remaining: budget};
  }
  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    if (state.won || state.failed) return state;
    const [dr, dc] = directions[action];
    let [r, c] = state.position;
    let block = state.block;
    while (true) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= state.board.length || nc < 0 || nc >= state.board[0].length || state.board[nr][nc] === '#') break;
      if (block && nr === block[0] && nc === block[1]) {
        const pr = nr + dr, pc = nc + dc;
        if (pr >= 0 && pr < state.board.length && pc >= 0 && pc < state.board[0].length && state.board[pr][pc] !== '#') block = [pr,pc];
        break;
      }
      r = nr; c = nc;
      if (state.board[r][c] === 'E') break;
    }
    if (r === state.position[0] && c === state.position[1] && block === state.block) return state;
    const won = state.board[r][c] === 'E', remaining = state.remaining - 1;
    return {...state, block, position: [r, c], moves: state.moves + 1, remaining, won,
      failed: remaining === 0 && !won};
  }
  function legalActions(state) {
    return Object.keys(directions).filter(action => step(state, action) !== state);
  }
  function observe(state) {
    return {block: state.block && state.block.slice(), board: state.board.slice(), position: state.position.slice(), moves: state.moves,
      won: state.won, failed: state.failed, remaining: state.remaining, legalActions: legalActions(state)};
  }
  function keyOf(state) { return state.position.join(',') + '/' + (state.block ? state.block.join(',') : '-'); }
  function solve(state) {
    const queue = [{state, path: []}], seen = new Set([keyOf(state)]);
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.state.won) return item.path;
      for (const action of legalActions(item.state)) {
        const next = step(item.state, action), key = keyOf(next);
        if (next.failed) continue;
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
