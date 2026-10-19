/* Ordered-exit Get Out! rules shared by the browser and Node. */
(function (root) {
  'use strict';
  const directions = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  const isExit = value => /^[1-9]$/.test(value);

  function create(board) {
    if (!Array.isArray(board) || board.length < 2 || board.length > 20 ||
        typeof board[0] !== 'string' || board[0].length < 2 || board[0].length > 20 ||
        board.some(row => typeof row !== 'string' || row.length !== board[0].length || /[^.#S1-9]/.test(row))) {
      throw new Error('Use a rectangular board, 2–20 rows and columns, with S, numbered exits, #, and .');
    }
    const all = board.join('');
    if (all.split('S').length !== 2) throw new Error('Place exactly one start (S).');
    const exits = [...all].filter(isExit).map(Number).sort((a, b) => a - b);
    if (exits.length < 2 || exits.some((number, index) => number !== index + 1)) {
      throw new Error('Place each numbered exit from 1 through N exactly once, with at least two exits.');
    }
    const r = board.findIndex(row => row.includes('S'));
    return {board: board.slice(), position: [r, board[r].indexOf('S')], moves: 0,
      nextNumber: 1, exitCount: exits.length, won: false, lost: false};
  }

  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    if (state.won || state.lost) return state;
    const [dr, dc] = directions[action];
    let [r, c] = state.position;
    while (true) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= state.board.length || nc < 0 || nc >= state.board[0].length || state.board[nr][nc] === '#') break;
      r = nr; c = nc;
      if (isExit(state.board[r][c])) break;
    }
    if (r === state.position[0] && c === state.position[1]) return state;
    const hit = state.board[r][c];
    const hitNumber = isExit(hit) ? Number(hit) : null;
    const correct = hitNumber === state.nextNumber;
    const nextNumber = correct ? state.nextNumber + 1 : state.nextNumber;
    return {...state, position: [r, c], moves: state.moves + 1,
      nextNumber, won: correct && hitNumber === state.exitCount,
      lost: hitNumber !== null && !correct, lastHit: hitNumber};
  }

  function legalActions(state) {
    return Object.keys(directions).filter(action => step(state, action) !== state);
  }

  function observe(state) {
    return {board: state.board.slice(), position: state.position.slice(), moves: state.moves,
      nextNumber: state.nextNumber, exitCount: state.exitCount, won: state.won,
      lost: state.lost, legalActions: legalActions(state)};
  }

  function solve(state) {
    const keyFor = candidate => `${candidate.position.join(',')}:${candidate.nextNumber}`;
    const queue = [{state, path: []}], seen = new Set([keyFor(state)]);
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.state.won) return item.path;
      if (item.state.lost) continue;
      for (const action of legalActions(item.state)) {
        const next = step(item.state, action), key = keyFor(next);
        if (!next.lost && !seen.has(key)) {
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
