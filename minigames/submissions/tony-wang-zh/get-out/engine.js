/* Get Out! paired-motion variation. Pure rules shared by browser and Node. */
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
    const er = board.findIndex(row => row.includes('E'));
    return {board: board.slice(), position: [r, board[r].indexOf('S')],
      exitPosition: [er, board[er].indexOf('E')], moves: 0, won: false};
  }
  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    if (state.won) return state;
    const [dr, dc] = directions[action], [rows, cols] = [state.board.length, state.board[0].length];
    let player = state.position.slice(), exit = state.exitPosition.slice(), moved = false;
    const canMove = ([r, c]) => {
      const nr = r + dr, nc = c + dc;
      return nr >= 0 && nr < rows && nc >= 0 && nc < cols && state.board[nr][nc] !== '#';
    };
    while (canMove(player) || canMove(exit)) {
      if (canMove(player)) player = [player[0] + dr, player[1] + dc];
      if (canMove(exit)) exit = [exit[0] + dr, exit[1] + dc];
      moved = true;
      if (player[0] === exit[0] && player[1] === exit[1]) {
        return {...state, position: player, exitPosition: exit, moves: state.moves + 1, won: true};
      }
    }
    if (!moved) return state;
    return {...state, position: player, exitPosition: exit, moves: state.moves + 1, won: false};
  }
  function legalActions(state) {
    return Object.keys(directions).filter(action => step(state, action) !== state);
  }
  function observe(state) {
    return {board: state.board.slice(), position: state.position.slice(),
      exitPosition: state.exitPosition.slice(), moves: state.moves,
      won: state.won, legalActions: legalActions(state)};
  }
  function solve(state) {
    const key = s => `${s.position.join(',')}|${s.exitPosition.join(',')}`;
    const queue = [{state, path: []}], seen = new Set([key(state)]);
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.state.won) return item.path;
      for (const action of legalActions(item.state)) {
        const next = step(item.state, action), nextKey = key(next);
        if (!seen.has(nextKey)) {
          seen.add(nextKey); queue.push({state: next, path: [...item.path, action]});
        }
      }
    }
    return null;
  }
  const api = {create, step, legalActions, observe, solve};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GetOut = api;
})(globalThis);
