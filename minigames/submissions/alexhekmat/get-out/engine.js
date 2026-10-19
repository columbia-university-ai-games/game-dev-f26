/* Get Out! classroom adaptation. Pure rules shared by browser and Node. */
(function (root) {
  'use strict';
  const directions = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  function create(board) {
    if (!Array.isArray(board) || board.length < 2 || board.length > 20 ||
        typeof board[0] !== 'string' || board[0].length < 2 || board[0].length > 20 ||
        board.some(row => typeof row !== 'string' || row.length !== board[0].length || /[^.*#SE]/.test(row))) {
      throw new Error('Use a rectangular board, 2–20 rows and columns, with only S, E, #, *, and .');
    }
    const all = board.join('');
    if (all.split('S').length !== 2 || all.split('E').length !== 2) {
      throw new Error('Place exactly one start (S) and one exit (E).');
    }
    const r = board.findIndex(row => row.includes('S'));
    const movingWalls = [];
    board.forEach((row, r) => [...row].forEach((cell, c) => {
      if (cell === '*') movingWalls.push({row: r, home: c, column: c});
    }));
    return {movingWalls, board: board.slice(), position: [r, board[r].indexOf('S')], moves: 0, won: false};
  }
  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    if (state.won) return state;
    const [dr, dc] = directions[action];
    let [r, c] = state.position;
    // Decide every wall's destination against the same board, then apply together.
    const board = state.board.map(row => row.split(''));
    let shifted = false;
    const destinations = new Map();
    for (const wall of state.movingWalls) {
      const nc = wall.column === wall.home ? wall.home + 1 : wall.home;
      const key = `${wall.row},${nc}`;
      destinations.set(key, (destinations.get(key) || 0) + 1);
    }
    const movingWalls = state.movingWalls.map(wall => {
      const wr = wall.row, wc = wall.column;
      const nc = wc === wall.home ? wall.home + 1 : wall.home;
      if (destinations.get(`${wr},${nc}`) !== 1 || state.board[wr][nc] !== '.' || (wr === r && nc === c)) return wall;
      board[wr][wc] = '.'; board[wr][nc] = '*'; shifted = true;
      return {...wall, column: nc};
    });
    while (true) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= board.length || nc < 0 || nc >= board[0].length || '#*'.includes(board[nr][nc])) break;
      r = nr; c = nc;
      if (board[r][c] === 'E') break;
    }
    if (r === state.position[0] && c === state.position[1] && !shifted) return state;
    return {...state, movingWalls, board: board.map(row => row.join('')), position: [r, c],
      moves: state.moves + 1, won: board[r][c] === 'E'};
  }
  function legalActions(state) {
    return Object.keys(directions).filter(action => step(state, action) !== state);
  }
  function observe(state) {
    return {board: state.board.slice(), position: state.position.slice(), moves: state.moves,
      won: state.won, movingWalls: state.movingWalls.map(wall => ({...wall})), legalActions: legalActions(state)};
  }
  function solve(state, maxStates = 10000) {
    const keyOf = s => s.position.join(',') + ':' + s.board.join('/');
    const queue = [{state, path: []}], seen = new Set([keyOf(state)]);
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.state.won) return item.path;
      for (const action of legalActions(item.state)) {
        const next = step(item.state, action), key = keyOf(next);
        if (!seen.has(key)) {
          if (seen.size >= maxStates) throw new Error('Hint search limit reached. Try fewer moving walls or a smaller board.');
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
