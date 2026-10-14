/* Get Out! classroom adaptation. Pure rules shared by browser and Node. */
(function (root) {
  'use strict';
  const directions = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  function replaceCell(board, row, column, value) {
    const next = board.slice();
    next[row] = next[row].slice(0, column) + value + next[row].slice(column + 1);
    return next;
  }
  function create(board, options = {}) {
    if (!Array.isArray(board) || board.length < 2 || board.length > 20 ||
        typeof board[0] !== 'string' || board[0].length < 2 || board[0].length > 20 ||
        board.some(row => typeof row !== 'string' || row.length !== board[0].length || /[^.#SE]/.test(row))) {
      throw new Error('Use a rectangular board, 2–20 rows and columns, with only S, E, #, and .');
    }
    const all = board.join('');
    if (all.split('S').length !== 2 || all.split('E').length !== 2) {
      throw new Error('Place exactly one start (S) and one exit (E).');
    }
    const random = options.random || Math.random;
    const candidates = [];
    for (let row = 0; row < board.length; row++) {
      for (let column = 0; column < board[row].length; column++) {
        if (board[row][column] === '#') candidates.push([row, column]);
      }
    }
    const r = board.findIndex(row => row.includes('S'));
    const makeState = walls => ({board: board.slice(), breakables: walls,
      position: [r, board[r].indexOf('S')], moves: 0, won: false, lastHit: null});
    if (options.breakableWalls !== undefined) {
      if (!Array.isArray(options.breakableWalls) || !options.breakableWalls.length) {
        throw new Error('Authored breakable walls must be a non-empty list.');
      }
      const authored = {};
      for (const wall of options.breakableWalls) {
        const {row, column, minHits = 1, maxHits = 3} = wall || {};
        if (![row, column, minHits, maxHits].every(Number.isInteger) ||
            row < 0 || row >= board.length || column < 0 || column >= board[0].length ||
            board[row][column] !== '#' || minHits < 1 || maxHits > 3 || minHits > maxHits ||
            Object.hasOwn(authored, `${row},${column}`)) {
          throw new Error('Each authored breakable wall must name one unique wall cell with a 1–3 hit range.');
        }
        authored[`${row},${column}`] = {
          remaining: minHits + Math.floor(random() * (maxHits - minHits + 1)), revealed: false};
      }
      const authoredState = makeState(authored);
      if (solve(authoredState) === null) throw new Error('The authored breakable-wall layout has no route to the exit.');
      return authoredState;
    }
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    const breakables = {};
    const count = candidates.length ? Math.max(1, Math.ceil(candidates.length / 4)) : 0;
    for (const [row, column] of candidates.slice(0, count)) {
      breakables[`${row},${column}`] = {remaining: 1 + Math.floor(random() * 3), revealed: false};
    }
    const randomized = makeState(breakables);
    if (!candidates.length || solve(randomized) !== null) return randomized;
    for (const [row, column] of candidates) {
      const first = 1 + Math.floor(random() * 3);
      for (const remaining of [first, first % 3 + 1, (first + 1) % 3 + 1]) {
        const fallback = makeState({[`${row},${column}`]: {remaining, revealed: false}});
        if (solve(fallback) !== null) return fallback;
      }
    }
    throw new Error('No solvable breakable-wall layout could be generated for this board.');
  }
  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    if (state.won) return state;
    const [dr, dc] = directions[action];
    let [r, c] = state.position;
    while (true) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= state.board.length || nc < 0 || nc >= state.board[0].length) break;
      if (state.board[nr][nc] === '#') {
        const key = `${nr},${nc}`, wall = state.breakables[key];
        if (!wall) break;
        const remaining = wall.remaining - 1;
        return {...state,
          board: remaining === 0 ? replaceCell(state.board, nr, nc, '.') : state.board,
          breakables: {...state.breakables, [key]: {remaining, revealed: true}},
          position: [r, c], moves: state.moves + 1,
          lastHit: {row: nr, column: nc, hitsRemaining: remaining}};
      }
      r = nr; c = nc;
      if (state.board[r][c] === 'E') break;
    }
    if (r === state.position[0] && c === state.position[1]) return state;
    return {...state, position: [r, c], moves: state.moves + 1,
      won: state.board[r][c] === 'E', lastHit: null};
  }
  function legalActions(state) {
    return state.won ? [] : Object.keys(directions);
  }
  function observe(state) {
    return {board: state.board.slice(), position: state.position.slice(), moves: state.moves,
      won: state.won, legalActions: legalActions(state),
      breakableWalls: Object.entries(state.breakables)
        .filter(([, wall]) => wall.revealed && wall.remaining > 0)
        .map(([key, wall]) => {
          const [row, column] = key.split(',').map(Number);
          return {row, column, hitsRemaining: wall.remaining};
        })};
  }
  function revealBreakables(state) {
    const breakables = {};
    for (const [key, wall] of Object.entries(state.breakables)) {
      breakables[key] = {...wall, revealed: wall.remaining > 0 || wall.revealed};
    }
    return {...state, breakables};
  }
  function stateKey(state) {
    const health = Object.entries(state.breakables)
      .map(([key, wall]) => `${key}:${wall.remaining}`).sort().join('|');
    return `${state.position.join(',')};${health}`;
  }
  function solve(state) {
    const queue = [{state, path: []}], seen = new Set([stateKey(state)]);
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.state.won) return item.path;
      for (const action of legalActions(item.state)) {
        const next = step(item.state, action), key = stateKey(next);
        if (!seen.has(key)) {
          seen.add(key); queue.push({state: next, path: [...item.path, action]});
        }
      }
    }
    return null;
  }
  const api = {create, step, legalActions, observe, revealBreakables, solve};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GetOut = api;
})(globalThis);
