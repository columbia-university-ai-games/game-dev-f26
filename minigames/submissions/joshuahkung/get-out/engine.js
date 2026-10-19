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
  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    if (state.won) return state;
    const [dr, dc] = directions[action];
    let [r, c] = state.position;
    while (true) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= state.board.length || nc < 0 || nc >= state.board[0].length || state.board[nr][nc] === '#') break;
      r = nr; c = nc;
      if (state.board[r][c] === 'E') break;
    }
    if (r === state.position[0] && c === state.position[1]) return state;
    return {...state, position: [r, c], moves: state.moves + 1, won: state.board[r][c] === 'E'};
  }
  function legalActions(state) {
    return Object.keys(directions).filter(action => step(state, action) !== state);
  }
  function observe(state) {
    return {board: state.board.slice(), position: state.position.slice(), moves: state.moves,
      won: state.won, legalActions: legalActions(state)};
  }
  function solve(state) {
    const queue = [{state, path: []}], seen = new Set([state.position.join(',')]);
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.state.won) return item.path;
      for (const action of legalActions(item.state)) {
        const next = step(item.state, action), key = next.position.join(',');
        if (!seen.has(key)) {
          seen.add(key); queue.push({state: next, path: [...item.path, action]});
        }
      }
    }
    return null;
  }
  /* Variation (joshuahkung, principle: hints): three escalating hint levels.
     1 = a question, 2 = the feature that stops the next slide, 3 = the move. */
  function hint(state, level) {
    if (![1, 2, 3].includes(level)) throw new Error('Hint level must be 1, 2, or 3.');
    const path = solve(state);
    if (path === null) return {level, path: null, message: 'There is no route from here. Undo a move or reset.'};
    if (path.length === 0) return {level, path, message: 'You are already out.'};
    const action = path[0];
    if (level === 1) return {level, message: 'Where could you stop that you have not stopped yet? Every wall is a possible stopping point.'};
    if (level === 3) return {level, action, message: `Try ${action}.`};
    const next = step(state, action), [dr, dc] = directions[action];
    if (next.won) return {level, feature: {type: 'exit', cell: next.position.slice()}, message: `The exit, at row ${next.position[0] + 1}, column ${next.position[1] + 1}, is one slide away. Which direction reaches it?`};
    const [r, c] = [next.position[0] + dr, next.position[1] + dc];
    const inside = r >= 0 && r < state.board.length && c >= 0 && c < state.board[0].length;
    if (!inside) return {level, feature: {type: 'border', cell: next.position.slice()}, message: `The highlighted square, row ${next.position[0] + 1}, column ${next.position[1] + 1}, is your next stop: the board edge stops you there.`};
    return {level, feature: {type: 'wall', cell: [r, c]}, message: `The highlighted wall, row ${r + 1}, column ${c + 1}, is the one your next slide should stop against.`};
  }
  const api = {create, step, legalActions, observe, solve, hint};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GetOut = api;
})(globalThis);
