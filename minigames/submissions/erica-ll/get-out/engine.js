/* Get Out! with fixed, one-way portal walls for the three teaching levels. */
(function (root) {
  'use strict';
  const directions = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  function create(board, portals = []) {
    if (!Array.isArray(board) || board.length < 2 || board.length > 20 ||
        typeof board[0] !== 'string' || board[0].length < 2 || board[0].length > 20 ||
        board.some(row => typeof row !== 'string' || row.length !== board[0].length || /[^.#SE]/.test(row))) {
      throw new Error('Use a rectangular board, 2–20 rows and columns, with only S, E, #, and .');
    }
    const all = board.join('');
    if (all.split('S').length !== 2 || all.split('E').length !== 2) throw new Error('Place exactly one start (S) and one exit (E).');
    const r = board.findIndex(row => row.includes('S'));
    const checked = portals.map(pair => {
      if (!Array.isArray(pair.entry) || !Array.isArray(pair.exit) || pair.entry.length !== 2 || pair.exit.length !== 2 ||
          [pair.entry, pair.exit].some(([pr, pc]) => !Number.isInteger(pr) || !Number.isInteger(pc) || pr < 0 || pr >= board.length || pc < 0 || pc >= board[0].length || board[pr][pc] !== '#')) {
        throw new Error('Portal endpoints must each be a wall square.');
      }
      return {entry: pair.entry.slice(), exit: pair.exit.slice()};
    });
    return {board: board.slice(), position: [r, board[r].indexOf('S')], moves: 0, won: false, portals: checked};
  }
  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    if (state.won) return state;
    const [dr, dc] = directions[action];
    let [r, c] = state.position;
    while (true) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= state.board.length || nc < 0 || nc >= state.board[0].length) break;
      const entry = state.portals.findIndex(pair => pair.entry[0] === nr && pair.entry[1] === nc);
      if (entry >= 0) {
        [r, c] = state.portals[entry].exit;
        break;
      }
      const isPortalExit = state.portals.some(pair => pair.exit[0] === nr && pair.exit[1] === nc);
      if (state.board[nr][nc] === '#' || isPortalExit) break;
      r = nr; c = nc;
      if (state.board[r][c] === 'E') break;
    }
    if (r === state.position[0] && c === state.position[1]) return state;
    return {...state, position: [r, c], moves: state.moves + 1, won: state.board[r][c] === 'E'};
  }
  function legalActions(state) { return Object.keys(directions).filter(action => step(state, action) !== state); }
  function observe(state) {
    return {board: state.board.slice(), position: state.position.slice(), moves: state.moves, won: state.won,
      portals: state.portals.map(pair => ({entry: pair.entry.slice(), exit: pair.exit.slice()})), legalActions: legalActions(state)};
  }
  function solve(state) {
    const queue = [{state, path: []}], seen = new Set([state.position.join(',')]);
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.state.won) return item.path;
      for (const action of legalActions(item.state)) {
        const next = step(item.state, action), key = next.position.join(',');
        if (!seen.has(key)) { seen.add(key); queue.push({state: next, path: [...item.path, action]}); }
      }
    }
    return null;
  }
  const api = {create, step, legalActions, observe, solve};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GetOut = api;
})(globalThis);
