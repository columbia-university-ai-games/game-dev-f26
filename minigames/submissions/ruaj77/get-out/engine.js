/* Get Out! classroom adaptation. Pure rules shared by browser and Node. */
(function (root) {
  'use strict';
  const directions = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  function snapshot(state) {
    Object.freeze(state.board);
    Object.freeze(state.position);
    return Object.freeze(state);
  }
  function create(board) {
    if (!Array.isArray(board) || board.length < 2 || board.length > 20 ||
        typeof board[0] !== 'string' || board[0].length < 2 || board[0].length > 20 ||
        board.some(row => typeof row !== 'string' || row.length !== board[0].length || /[^.#SETD]/.test(row))) {
      throw new Error('Use a rectangular board, 2–20 rows and columns, with only S, E, T, D, #, and .');
    }
    const all = board.join('');
    if (all.split('S').length !== 2 || all.split('E').length !== 2) {
      throw new Error('Place exactly one start (S) and one exit (E).');
    }
    const switches = all.split('T').length - 1, doors = all.split('D').length - 1;
    if ((switches !== 0 || doors !== 0) && (switches !== 1 || doors !== 1)) {
      throw new Error('Place exactly one switch (T) and one door (D), or neither.');
    }
    const r = board.findIndex(row => row.includes('S'));
    return snapshot({board: board.slice(), position: [r, board[r].indexOf('S')],
      moves: 0, won: false, doorOpen: false});
  }
  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    if (state.won) return state;
    const [dr, dc] = directions[action];
    let [r, c] = state.position;
    let doorOpen = state.doorOpen;
    while (true) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= state.board.length || nc < 0 || nc >= state.board[0].length) break;
      const cell = state.board[nr][nc];
      if (cell === '#' || (cell === 'D' && !doorOpen)) break;
      r = nr; c = nc;
      if (cell === 'T') doorOpen = true;
      if (cell === 'E') break;
    }
    if (r === state.position[0] && c === state.position[1]) return state;
    return snapshot({...state, position: [r, c], moves: state.moves + 1,
      won: state.board[r][c] === 'E', doorOpen});
  }
  function legalActions(state) {
    return Object.keys(directions).filter(action => step(state, action) !== state);
  }
  function observe(state) {
    return {board: state.board.slice(), position: state.position.slice(), moves: state.moves,
      won: state.won, doorOpen: state.doorOpen, legalActions: legalActions(state)};
  }
  function solve(state) {
    const stateKey = value => `${value.position.join(',')},${value.doorOpen}`;
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
  const api = {create, step, legalActions, observe, solve};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GetOut = api;
})(globalThis);
