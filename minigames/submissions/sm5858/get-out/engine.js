/* Get Out! classroom adaptation, drifting-walls variation. Pure rules shared by browser and Node.
 * Variation rule: after every successful move that does not escape, two walls chosen at random
 * each move one square up, down, left, or right; the rest stay. Walls never land on the player, the start,
 * the exit, or each other, and the new layout always keeps a route to the exit if the walls
 * stopped moving. Randomness comes from a seed stored in the state, so step() stays pure
 * and undo, replays, and hints are reproducible. Blocked moves change nothing. */
(function (root) {
  'use strict';
  const directions = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  const drifts = [[-1, 0], [0, 1], [1, 0], [0, -1]];
  const MOVING_WALLS = 2, REROLLS = 20, HINT_NODES = 5000, HINT_MS = 200;
  // One step of mulberry32: returns a number in [0, 1) and the next seed.
  function random(seed) {
    const next = (seed + 0x6D2B79F5) >>> 0;
    let x = Math.imul(next ^ (next >>> 15), next | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return [((x ^ (x >>> 14)) >>> 0) / 4294967296, next];
  }
  function create(board, seed = 1) {
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
    const walls = [];
    board.forEach((row, wr) => [...row].forEach((v, wc) => { if (v === '#') walls.push([wr, wc]); }));
    return {board: board.slice(), walls, position: [r, board[r].indexOf('S')], moves: 0, won: false, seed: seed >>> 0};
  }
  function slide(board, position, action) {
    const [dr, dc] = directions[action];
    let [r, c] = position;
    while (true) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= board.length || nc < 0 || nc >= board[0].length || board[nr][nc] === '#') break;
      r = nr; c = nc;
      if (board[r][c] === 'E') break;
    }
    return [r, c];
  }
  // Shortest route if the walls stopped moving. Used to keep every layout fair.
  function solveStatic(state) {
    const queue = [{position: state.position, path: []}], seen = new Set([state.position.join(',')]);
    for (let i = 0; i < queue.length; i++) {
      const {position, path} = queue[i];
      if (state.board[position[0]][position[1]] === 'E') return path;
      for (const action of Object.keys(directions)) {
        const next = slide(state.board, position, action), key = next.join(',');
        if (!seen.has(key)) { seen.add(key); queue.push({position: next, path: [...path, action]}); }
      }
    }
    return null;
  }
  function boardWith(board, walls) {
    const grid = board.map(row => [...row].map(v => v === '#' ? '.' : v));
    for (const [r, c] of walls) grid[r][c] = '#';
    return grid.map(row => row.join(''));
  }
  // Pick MOVING_WALLS walls at random and move each one square. Wall order stays
  // stable (index i is always the same wall) so the UI can animate it.
  function drift(state) {
    let seed = state.seed, pick;
    const rows = state.board.length, cols = state.board[0].length;
    for (let attempt = 0; attempt < REROLLS; attempt++) {
      const walls = state.walls.map(w => w.slice()), chosen = new Set();
      const optionsFor = ([r, c], taken) =>
        drifts.map(([dr, dc]) => [r + dr, c + dc]).filter(([nr, nc]) =>
          nr >= 0 && nr < rows && nc >= 0 && nc < cols && !taken.has(`${nr},${nc}`) &&
          !(nr === state.position[0] && nc === state.position[1]) && !'SE'.includes(state.board[nr][nc]));
      // Choose only among walls that have somewhere to go, so crowded boards still drift.
      for (let k = 0; k < MOVING_WALLS; k++) {
        const taken = new Set(walls.map(w => w.join(',')));
        const movable = walls.map((w, i) => i).filter(i => !chosen.has(i) && optionsFor(walls[i], taken).length);
        if (!movable.length) break;
        [pick, seed] = random(seed);
        const i = movable[Math.floor(pick * movable.length)], options = optionsFor(walls[i], taken);
        [pick, seed] = random(seed);
        walls[i] = options[Math.floor(pick * options.length)]; chosen.add(i);
      }
      const candidate = {...state, walls, board: boardWith(state.board, walls), seed};
      if (solveStatic(candidate) !== null) return candidate;
    }
    return {...state, seed};
  }
  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    if (state.won) return state;
    const [r, c] = slide(state.board, state.position, action);
    if (r === state.position[0] && c === state.position[1]) return state;
    const moved = {...state, position: [r, c], moves: state.moves + 1, won: state.board[r][c] === 'E'};
    return moved.won ? moved : drift(moved);
  }
  function legalActions(state) {
    if (state.won) return [];
    return Object.keys(directions).filter(action => slide(state.board, state.position, action).join() !== state.position.join());
  }
  function observe(state) {
    return {board: state.board.slice(), walls: state.walls.map(w => w.slice()), position: state.position.slice(),
      moves: state.moves, won: state.won, legalActions: legalActions(state)};
  }
  // Shortest route given how the walls will actually drift (the seed is known).
  // Each move changes the seed, so the search is capped; past the cap it falls
  // back to the route that would work if the walls stopped now (exact: false).
  // A time budget keeps the page responsive on large, crowded boards.
  function hint(state, maxNodes = HINT_NODES, maxMs = HINT_MS) {
    const deadline = Date.now() + maxMs;
    if (state.won) return {path: [], exact: true};
    if (!state.walls.length) return {path: solveStatic(state), exact: true};
    const queue = [{state, path: []}];
    for (let i = 0; i < queue.length && queue.length < maxNodes && Date.now() < deadline; i++) {
      const item = queue[i];
      for (const action of Object.keys(directions)) {
        const next = step(item.state, action), path = [...item.path, action];
        if (next === item.state) continue;
        if (next.won) return {path, exact: true};
        queue.push({state: next, path});
      }
    }
    return {path: solveStatic(state), exact: false};
  }
  function solve(state, maxNodes, maxMs) { return hint(state, maxNodes, maxMs).path; }
  const api = {create, step, legalActions, observe, solve, hint, solveStatic};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GetOut = api;
})(globalThis);
