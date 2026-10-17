/* Get Out! classroom adaptation. Pure rules shared by browser and Node. */
(function (root) {
  'use strict';
  const directions = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  function neighbors(board, [r,c]) {
    return Object.values(directions).map(([dr,dc])=>[r+dr,c+dc]).filter(([nr,nc])=>
      nr>=0 && nr<board.length && nc>=0 && nc<board[0].length && board[nr][nc]!=='#');
  }
  function distances(board, start) {
    const queue=[start], result=new Map([[start.join(','),0]]);
    for(let i=0;i<queue.length;i++) for(const p of neighbors(board,queue[i])) {
      const key=p.join(','); if(!result.has(key)) {
        result.set(key,result.get(queue[i].join(','))+1); queue.push(p);
      }
    }
    return result;
  }
  function spawn(board, position) {
    let chosen=null, farthest=0;
    for(const [key,d] of distances(board,position)) {
      const p=key.split(',').map(Number);
      if(d>farthest && board[p[0]][p[1]]!=='E') {chosen=p;farthest=d;}
    }
    return chosen;
  }
  function chase(state, position, turn) {
    if(!state.chaser) return null;
    const options=neighbors(state.board,state.chaser);
    if(!options.length) return state.chaser.slice();
    const distance=distances(state.board,position);
    options.sort((a,b)=>(distance.get(a.join(','))??Infinity)-(distance.get(b.join(','))??Infinity));
    // Two pursuit turns, then one predictable wandering turn. No hidden randomness.
    if(turn%3===0 && options.length>1) {
      const farthest=distance.get(options.at(-1).join(','));
      return options.find(p=>distance.get(p.join(','))===farthest);
    }
    return options[0];
  }
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
    const position=[r, board[r].indexOf('S')];
    return {board: board.slice(), position, chaser: spawn(board,position), moves: 0, won: false, caught: false};
  }
  function step(state, action) {
    if (!Object.hasOwn(directions, action)) throw new Error('Unknown direction.');
    if (state.won || state.caught) return state;
    const [dr, dc] = directions[action];
    let [r, c] = state.position;
    while (true) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= state.board.length || nc < 0 || nc >= state.board[0].length || state.board[nr][nc] === '#') break;
      r = nr; c = nc;
      if (state.board[r][c] === 'E') break;
    }
    if (r === state.position[0] && c === state.position[1]) return state;
    const position=[r,c], moves=state.moves+1, won=state.board[r][c]==='E';
    const chaser=chase(state,position,moves);
    const overlaps=p=>p && p[0]===r && p[1]===c;
    const caught=!won && Boolean(overlaps(state.chaser)||overlaps(chaser));
    return {...state, position, chaser, moves, won, caught};
  }
  function legalActions(state) {
    return Object.keys(directions).filter(action => step(state, action) !== state);
  }
  function observe(state) {
    return {board: state.board.slice(), position: state.position.slice(), moves: state.moves,
      won: state.won, caught: state.caught, chaser: state.chaser?.slice() ?? null, legalActions: legalActions(state)};
  }
  function solve(state) {
    if(state.caught) return null;
    const keyOf=s=>[s.position.join(','),s.chaser?.join(',')??'-',s.moves%3].join('|');
    const queue = [{state, path: []}], seen = new Set([keyOf(state)]);
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.state.won) return item.path;
      for (const action of legalActions(item.state)) {
        const next = step(item.state, action), key = keyOf(next);
        if (!next.caught && !seen.has(key)) {
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
