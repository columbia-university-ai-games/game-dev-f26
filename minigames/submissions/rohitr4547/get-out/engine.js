/* Get Out! classroom adaptation, swap-sides-with-a-moving-roadblock variation. Pure rules shared by browser and Node.
   A move that misses the exit swaps the ball and the exit, so play alternates sides.
   A no-entry roadblock stops the ball like a wall. After every move it jumps to a new square
   on the current shortest way out, so the route you planned is blocked again. */
(function (root) {
  'use strict';
  const directions = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  const actions = Object.keys(directions);
  const same = (a, b) => !!a && !!b && a[0] === b[0] && a[1] === b[1];
  // Small seeded generator: the roadblock looks random, but the same seed and positions give the same square.
  function generator(seed) {
    return () => {
      seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function mix(...values) {
    let h = 2166136261;
    for (const v of values) h = Math.imul(h ^ (v + 1), 16777619);
    return h >>> 0;
  }
  function solid(state, r, c) {
    return r < 0 || r >= state.board.length || c < 0 || c >= state.board[0].length ||
      state.board[r][c] === '#' || same(state.block, [r, c]);
  }
  // Every square the ball enters on one slide, ending where it stops or at the exit.
  function slide(state, action) {
    const [dr, dc] = directions[action];
    const [er, ec] = state.exit;
    let [r, c] = state.position;
    const cells = [];
    while (!solid(state, r + dr, c + dc)) {
      r += dr; c += dc; cells.push([r, c]);
      if (r === er && c === ec) break;
    }
    return cells;
  }
  // One move with the roadblock held still: slide, then win or swap.
  function advance(state, action) {
    if (state.won) return state;
    const [er, ec] = state.exit;
    const cells = slide(state, action);
    if (!cells.length) return state;
    const [r, c] = cells[cells.length - 1];
    if (r === er && c === ec) return {...state, position: [r, c], moves: state.moves + 1, won: true};
    // Missed the exit: the ball continues from the old exit, and the exit waits where the ball stopped.
    return {...state, position: [er, ec], exit: [r, c], moves: state.moves + 1, won: false};
  }

  // Distances to escape on the board without a roadblock, for every ball and exit pair at once.
  // Built once per board, so each roadblock jump is a lookup rather than a new search.
  const tables = new Map();
  function openTable(board) {
    const name = board.join('\n');
    if (tables.has(name)) return tables.get(name);
    const rows = board.length, cols = board[0].length, index = new Int32Array(rows * cols).fill(-1), cells = [];
    board.forEach((row, r) => [...row].forEach((v, c) => { if (v !== '#') { index[r * cols + c] = cells.length; cells.push([r, c]); } }));
    const n = cells.length, dist = new Int32Array(n * n).fill(-1), next = new Int8Array(n * n).fill(-1);
    const into = Array.from({length: n * n}, () => []), queue = [];
    for (let b = 0; b < n; b++) for (let e = 0; e < n; e++) {
      if (b === e) continue;
      const state = {board, position: cells[b], exit: cells[e], block: null, moves: 0, won: false};
      actions.forEach((action, a) => {
        const after = advance(state, action);
        if (after === state) return;
        if (after.won) {
          if (dist[b * n + e] < 0) { dist[b * n + e] = 1; next[b * n + e] = a; queue.push(b * n + e); }
        } else {
          into[e * n + index[after.exit[0] * cols + after.exit[1]]].push((b * n + e) * 4 + a);
        }
      });
    }
    for (let i = 0; i < queue.length; i++) {
      const node = queue[i];
      for (const edge of into[node]) {
        const from = edge >> 2;
        if (dist[from] < 0) { dist[from] = dist[node] + 1; next[from] = edge & 3; queue.push(from); }
      }
    }
    const table = {index, cols, n, dist, next, picks: new Map()};
    if (tables.size > 8) tables.delete(tables.keys().next().value);
    tables.set(name, table);
    return table;
  }
  // Shortest way out from this ball and exit if there were no roadblock, or null.
  function openRoute(board, position, exit) {
    const t = openTable(board), node = s => t.index[s.position[0] * t.cols + s.position[1]] * t.n + t.index[s.exit[0] * t.cols + s.exit[1]];
    let state = {board, position, exit, block: null, moves: 0, won: false};
    if (t.dist[node(state)] < 0) return null;
    const path = [];
    while (!state.won) {
      const action = actions[t.next[node(state)]];
      path.push(action); state = advance(state, action);
    }
    return path;
  }
  // Where the roadblock goes for this ball and exit: a floor square the ball would slide across on
  // the shortest way out (ignoring the roadblock), preferring one that breaks that route. It never
  // stays on the square it just left while another free square exists.
  function placeBlock(board, position, exit, seed, previous) {
    const t = openTable(board), key = `${seed}|${position}|${exit}`;
    if (!t.picks.has(key)) {
      const open = {board, position, exit, block: null, moves: 0, won: false};
      const path = openRoute(board, position, exit) || [];
      const free = cell => board[cell[0]][cell[1]] === '.' && !same(cell, position) && !same(cell, exit);
      const cells = new Map();
      path.reduce((s, action) => {
        for (const cell of slide(s, action)) if (free(cell)) cells.set(`${cell}`, cell);
        return advance(s, action);
      }, open);
      const random = generator(mix(seed, ...position, ...exit));
      const shuffle = list => {
        for (let i = list.length - 1; i > 0; i--) {
          const j = Math.floor(random() * (i + 1));[list[i], list[j]] = [list[j], list[i]];
        }
        return list;
      };
      const breaks = cell => !path.reduce((s, action) => advance(s, action), {...open, block: cell}).won;
      // Route squares that break the route come first, then other route squares, then any other floor square.
      const route = shuffle([...cells.values()]), floor = [];
      board.forEach((row, r) => [...row].forEach((v, c) => { if (free([r, c]) && !cells.has(`${r},${c}`)) floor.push([r, c]); }));
      const breaking = route.filter(breaks);
      t.picks.set(key, [...breaking, ...route.filter(cell => !breaking.includes(cell)), ...shuffle(floor)]);
    }
    const order = t.picks.get(key);
    // With no other free square, the roadblock stays where it is rather than vanishing.
    return order.find(cell => !same(cell, previous)) || order[0] || null;
  }
  function create(board, seed = null) {
    if (!Array.isArray(board) || board.length < 2 || board.length > 20 ||
        typeof board[0] !== 'string' || board[0].length < 2 || board[0].length > 20 ||
        board.some(row => typeof row !== 'string' || row.length !== board[0].length || /[^.#SE]/.test(row))) {
      throw new Error('Use a rectangular board, 2–20 rows and columns, with only S, E, #, and .');
    }
    const all = board.join('');
    if (all.split('S').length !== 2 || all.split('E').length !== 2) {
      throw new Error('Place exactly one start (S) and one exit (E).');
    }
    if (seed !== null && !Number.isInteger(seed)) throw new Error('The roadblock seed must be a whole number.');
    const r = board.findIndex(row => row.includes('S')), er = board.findIndex(row => row.includes('E'));
    const position = [r, board[r].indexOf('S')], exit = [er, board[er].indexOf('E')];
    const block = seed === null ? null : placeBlock(board, position, exit, seed, null);
    return {board: board.slice(), position, exit, block, seed, moves: 0, won: false};
  }
  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    const next = advance(state, action);
    if (next === state || next.won || state.seed === null) return next;
    // After every move that misses the exit, the roadblock jumps to block the new shortest way out.
    return {...next, block: placeBlock(state.board, next.position, next.exit, state.seed, state.block)};
  }
  function legalActions(state) {
    return actions.filter(action => step(state, action) !== state);
  }
  function observe(state) {
    // Board letters follow the moving exit and roadblock (X), so the grid never shows a stale piece.
    const [er, ec] = state.exit;
    const board = state.board.map((row, r) => [...row].map((v, c) =>
      r === er && c === ec ? 'E' : same(state.block, [r, c]) ? 'X' : v === 'E' ? '.' : v).join(''));
    return {board, position: state.position.slice(), exit: state.exit.slice(),
      roadblock: state.block ? state.block.slice() : null, moves: state.moves,
      won: state.won, legalActions: legalActions(state)};
  }
  // Shortest way out, searching ball, exit, and roadblock together. With a `limit` on positions
  // examined, `complete` is false when the search stopped early without an answer.
  function solveWithin(state, limit = Infinity) {
    const key = s => `${s.position}|${s.exit}|${s.block}`;
    const queue = [{state, path: []}], seen = new Set([key(state)]);
    for (let i = 0; i < queue.length; i++) {
      if (i >= limit) return {path: null, complete: false};
      const item = queue[i];
      if (item.state.won) return {path: item.path, complete: true};
      for (const action of actions) {
        const after = step(item.state, action);
        if (after !== item.state && !seen.has(key(after))) {
          seen.add(key(after)); queue.push({state: after, path: [...item.path, action]});
        }
      }
    }
    return {path: null, complete: true};
  }
  const solve = state => solveWithin(state).path;
  // Pick a seed whose roadblock sequence still leaves a way out; tries `first` and the seeds after it.
  function solvableSeed(board, first, tries = 12, limit = 40000) {
    const plain = create(board);
    if (openRoute(board, plain.position, plain.exit) === null) return null;
    for (let i = 0; i < tries; i++) {
      const seed = (first + i) | 0;
      if (solveWithin(create(board, seed), limit).path) return seed;
    }
    return null;
  }
  const api = {create, step, legalActions, observe, solve, solveWithin, solvableSeed};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GetOut = api;
})(globalThis);
