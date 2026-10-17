/* Get Out! classroom adaptation. Pure rules shared by browser and Node. */
(function (root) {
  'use strict';
  const directions = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  function create(board) {
    if (!Array.isArray(board) || board.length < 2 || board.length > 20 ||
        typeof board[0] !== 'string' || board[0].length < 2 || board[0].length > 20 ||
        board.some(row => typeof row !== 'string' || row.length !== board[0].length || /[^.#SEM]/.test(row))) {
      throw new Error('Use a rectangular board, 2–20 rows and columns, with only S, E, #, M, and .');
    }
    const all = board.join('');
    if (all.split('S').length !== 2 || all.split('E').length !== 2) {
      throw new Error('Place exactly one start (S) and one exit (E).');
    }
    const r = board.findIndex(row => row.includes('S'));
    return {board: board.slice(), position: [r, board[r].indexOf('S')], start: [r, board[r].indexOf('S')], motions: [], moves: 0, won: false};
  }
  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    if (state.won) return state;
    const [dr, dc] = directions[action];
    let [r, c] = state.position;
    while (true) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= state.board.length || nc < 0 || nc >= state.board[0].length || ['#', 'M'].includes(state.board[nr][nc])) break;
      r = nr; c = nc;
      if (state.board[r][c] === 'E') break;
    }
    const wr = r + dr, wc = c + dc;
    let motions = state.motions;
    if (state.board[r][c] !== 'E' && state.board[wr]?.[wc] === 'M') {
      const old = motions.find(m => m.r === wr && m.c === wc);
      if (!old || old.direction !== action) {
        motions = motions.filter(m => m !== old).concat({r:wr,c:wc,direction:action});
      }
    }
    if (r === state.position[0] && c === state.position[1] && motions === state.motions) return state;
    return {...state, motions, position:[r,c], moves:state.moves+1, won:state.board[r][c] === 'E'};
  }
  function tick(state) {
    if (state.won || !state.motions.length) return state;
    // Occupied cells block for this tick; contested destinations stop all contenders.
    const candidates = state.motions.map(m => {
      const [dr,dc] = directions[m.direction];
      return {...m, nr:m.r+dr, nc:m.c+dc};
    });
    const rows = state.board.map(row => row.split('')), motions = [];
    for (const m of candidates) {
      const cell = state.board[m.nr]?.[m.nc];
      if (!['.', 'S'].includes(cell) ||
          (state.position[0] === m.nr && state.position[1] === m.nc) ||
          candidates.some(other => other !== m && other.nr === m.nr && other.nc === m.nc)) continue;
      rows[m.r][m.c] = state.start[0] === m.r && state.start[1] === m.c ? 'S' : '.';
      rows[m.nr][m.nc] = 'M';
      motions.push({r:m.nr,c:m.nc,direction:m.direction});
    }
    return {...state, board:rows.map(row => row.join('')), motions};
  }
  function legalActions(state) {
    return Object.keys(directions).filter(action => step(state, action) !== state);
  }
  function observe(state) {
    return {board: state.board.slice(), position: state.position.slice(), moves: state.moves,
      won: state.won, motions:state.motions.map(m => ({...m})), legalActions: legalActions(state)};
  }
  function solve(state) {
    const keyOf = s => s.position.join(',') + ':' + s.board.join('/') + ':' + s.motions.map(m => `${m.r},${m.c},${m.direction}`).sort().join(';');
    const queue = [{state, path: []}], seen = new Set([keyOf(state)]);
    for (let i = 0; i < queue.length; i++) {
      if (i >= 40000) throw new Error("Hint search limit reached. Try a smaller board or undo.");
      const item = queue[i];
      if (item.state.won) return item.path;
      for (const action of [...legalActions(item.state), ...(item.state.motions.length ? ['wait'] : [])]) {
        const next = action === 'wait' ? tick(item.state) : step(item.state, action), key = keyOf(next);
        if (!seen.has(key)) {
          seen.add(key); queue.push({state: next, path: [...item.path, action]});
        }
      }
    }
    return null;
  }
  const api = {create, step, tick, legalActions, observe, solve};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GetOut = api;
})(globalThis);
