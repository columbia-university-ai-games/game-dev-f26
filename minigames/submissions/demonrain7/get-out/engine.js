/* Get Out: Trace Chaser. Pure movement and elapsed-time rules. */
(function (root) {
  'use strict';
  const directions = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  function create(board, difficulty = {spawnMoves: 3, tilesPerSecond: 2}) {
    if (!Array.isArray(board) || board.length < 2 || board.length > 20 ||
        typeof board[0] !== 'string' || board[0].length < 2 || board[0].length > 20 ||
        board.some(row => typeof row !== 'string' || row.length !== board[0].length || /[^.#SE]/.test(row))) {
      throw new Error('Use a rectangular board, 2–20 rows and columns, with only S, E, #, and .');
    }
    const all = board.join('');
    if (all.split('S').length !== 2 || all.split('E').length !== 2) {
      throw new Error('Place exactly one start (S) and one exit (E).');
    }
    if (!difficulty || !Number.isInteger(difficulty.spawnMoves) || difficulty.spawnMoves < 1 ||
        !Number.isFinite(difficulty.tilesPerSecond) || difficulty.tilesPerSecond <= 0) {
      throw new Error('Chase difficulty needs a positive integer spawn delay and positive finite speed.');
    }
    const r = board.findIndex(row => row.includes('S'));
    const position = [r, board[r].indexOf('S')];
    return {board: board.slice(), position, moves: 0, won: false, caught: false,
      difficulty: {...difficulty}, trail: [position.slice()],
      enemy: {active: false, index: 0, elapsedMs: 0}};
  }
  function same(a, b) { return !!a && !!b && a[0] === b[0] && a[1] === b[1]; }
  function enemyPosition(state) {
    return state.enemy.active ? state.trail[state.enemy.index].slice() : null;
  }
  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    if (state.won || state.caught) return state;
    const [dr, dc] = directions[action];
    let [r, c] = state.position;
    const crossed = [], enemy = enemyPosition(state);
    let caught = false;
    while (true) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= state.board.length || nc < 0 || nc >= state.board[0].length || state.board[nr][nc] === '#') break;
      r = nr; c = nc;
      crossed.push([r, c]);
      if (same([r, c], enemy)) { caught = true; break; }
      if (state.board[r][c] === 'E') break;
    }
    if (r === state.position[0] && c === state.position[1]) return state;
    const won = !caught && state.board[r][c] === 'E';
    const next = {...state, position: [r, c], moves: state.moves + 1, won, caught,
      trail: [...state.trail, ...crossed], enemy: {...state.enemy}};
    if (!won && !next.enemy.active && next.moves >= state.difficulty.spawnMoves) {
      next.enemy = {active: true, index: 0, elapsedMs: 0};
      next.caught = same(next.position, next.trail[0]);
    }
    return next;
  }
  function advanceTime(state, elapsedMs) {
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0) throw new Error('Elapsed time must be finite and nonnegative.');
    if (!elapsedMs || !state.enemy.active || state.won || state.caught) return state;
    const interval = 1000 / state.difficulty.tilesPerSecond;
    const total = state.enemy.elapsedMs + elapsedMs;
    const steps = Math.floor((total + 1e-9) / interval);
    let index = state.enemy.index, caught = false;
    for (let i = 0; i < steps && index < state.trail.length - 1; i++) {
      index++;
      if (same(state.trail[index], state.position)) { caught = true; break; }
    }
    return {...state, caught, enemy: {active: true, index,
      elapsedMs: caught ? 0 : Math.max(0, total - steps * interval)}};
  }
  function legalActions(state) {
    return Object.keys(directions).filter(action => step(state, action) !== state);
  }
  function observe(state) {
    return {board: state.board.slice(), position: state.position.slice(), moves: state.moves,
      won: state.won, caught: state.caught, difficulty: {...state.difficulty},
      trail: state.trail.map(tile => tile.slice()),
      enemy: {active: state.enemy.active, index: state.enemy.index, position: enemyPosition(state)},
      legalActions: legalActions(state)};
  }
  // Immediate route planning: slides take no engine time. The UI labels this
  // explicitly; an enemy can move while a human reads or decides.
  function solve(state) {
    if (state.caught) return null;
    const keyFor = s => `${s.position.join(',')}|${enemyPosition(s)?.join(',') ?? 'waiting'}|${Math.max(0, s.difficulty.spawnMoves - s.moves)}`;
    const queue = [{state, path: []}], seen = new Set([keyFor(state)]);
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.state.won) return item.path;
      for (const action of legalActions(item.state)) {
        const next = step(item.state, action), key = keyFor(next);
        if (!next.caught && !seen.has(key)) {
          seen.add(key); queue.push({state: next, path: [...item.path, action]});
        }
      }
    }
    return null;
  }
  const api = {create, step, advanceTime, enemyPosition, legalActions, observe, solve};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GetOut = api;
})(globalThis);
