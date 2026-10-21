/* Get Out! classroom adaptation. Pure rules shared by browser and Node. */
(function (root) {
  'use strict';
  const directions = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
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
    const r = board.findIndex(row => row.includes('S'));
    const position = [r, board[r].indexOf('S')];
    if (!options || typeof options !== 'object') throw new Error('Use valid moving-wall options.');
    const input = options.movers === undefined ? [] : options.movers;
    if (!Array.isArray(input) || input.length > 3) throw new Error('Use at most three moving walls per board.');
    const movers = input.map(mover => {
      if (!mover || !Array.isArray(mover.path) || mover.path.length < 2 || mover.path.length > 20) {
        throw new Error('A rail needs 2–20 adjacent cells in one straight line.');
      }
      const path = mover.path.map(cell => {
        if (!Array.isArray(cell) || cell.length !== 2 || !cell.every(Number.isInteger) ||
            cell[0] < 0 || cell[0] >= board.length || cell[1] < 0 || cell[1] >= board[0].length ||
            !'.S'.includes(board[cell[0]][cell[1]])) {
          throw new Error('Rail cells must be inside the board, on floor or start cells.');
        }
        return cell.slice();
      });
      const delta = [path[1][0] - path[0][0], path[1][1] - path[0][1]];
      if (Math.abs(delta[0]) + Math.abs(delta[1]) !== 1 ||
          path.slice(1).some((cell, i) => cell[0] - path[i][0] !== delta[0] || cell[1] - path[i][1] !== delta[1])) {
        throw new Error('A rail needs adjacent cells in one straight line.');
      }
      const index = mover.index === undefined ? 0 : mover.index;
      const direction = mover.direction === undefined ? 1 : mover.direction;
      if (!Number.isInteger(index) || index < 0 || index >= path.length || ![1,-1].includes(direction)) {
        throw new Error('Choose a valid rail position and direction (1 or -1).');
      }
      if (same(path[index], position)) throw new Error('The moving wall cannot start on the player.');
      return {path, index, direction};
    });
    const railCells = new Set();
    for (const mover of movers) for (const cell of mover.path) {
      const key = cell.join(',');
      if (railCells.has(key)) throw new Error('Moving wall rails cannot cross or overlap.');
      railCells.add(key);
    }
    let monster=options.monster===undefined?null:options.monster;
    if(monster!==null){
      if(!Array.isArray(monster)||monster.length!==2||!monster.every(Number.isInteger)||
        monster[0]<0||monster[0]>=board.length||monster[1]<0||monster[1]>=board[0].length||
        board[monster[0]][monster[1]]!=='.'||movers.some(m=>same(m.path[m.index],monster))){
        throw new Error('Place one monster on empty floor, away from the start, exit and moving walls.');
      }
      monster=monster.slice();
    }
    // Include both actor cells and every independent wall phase in admission.
    const phases=movers.reduce((n,m)=>n*2*m.path.length,1);
    const floor=all.replace(/#/g,'').length;
    const searchSize=monster?floor*floor*phases:board.length*board[0].length*phases;
    if(searchSize>(monster?1000000:120000))throw new Error('Shorten a rail or use a smaller board for route checks and hints.');
    return {board: board.slice(), position, movers, monster, moves: 0, won: false, lost:false, deathCause:null};
  }
  function advanceWall(mover, position, monster=null) {
    let direction = mover.direction, index = mover.index + direction;
    if (index < 0 || index >= mover.path.length) {
      direction = -direction;
      index = mover.index + direction;
    }
    const heldBy=same(mover.path[index],position)?'player':monster&&same(mover.path[index],monster)?'monster':null;
    const held=heldBy!==null;
    return {mover: {...mover, index: held ? mover.index : index, direction}, held, heldBy,
      targetPosition: mover.path[index]};
  }
  function chase(state,movers){
    if(!state.monster)return null;
    const blocked=new Set(movers.map(m=>m.path[m.index].join(',')));
    const queue=[{cell:state.monster,first:null}],seen=new Set([state.monster.join(',')]);
    for(let cursor=0;cursor<queue.length;cursor++){
      const {cell,first}=queue[cursor];
      for(const [dr,dc] of Object.values(directions)){
        const next=[cell[0]+dr,cell[1]+dc],key=next.join(',');
        if(next[0]<0||next[0]>=state.board.length||next[1]<0||next[1]>=state.board[0].length||
          state.board[next[0]][next[1]]==='#'||blocked.has(key)||seen.has(key))continue;
        const step=first||next;
        if(same(next,state.position))return step.slice();
        seen.add(key);queue.push({cell:next,first:step});
      }
    }
    return state.monster.slice();
  }
  function step(state, action) {
    if (action !== 'wait' && !Object.hasOwn(directions, action)) throw new Error('Unknown direction or action.');
    if (state.won||state.lost) return state;
    if (action === 'wait' && !state.movers.length&&!state.monster) return state;
    let [r, c] = state.position;
    if (action !== 'wait') {
      const [dr, dc] = directions[action];
      while (true) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= state.board.length || nc < 0 || nc >= state.board[0].length ||
            state.board[nr][nc] === '#' || state.movers.some(m => same(m.path[m.index], [nr,nc]))) break;
        r = nr; c = nc;
        if(state.monster&&same([r,c],state.monster)){
          return {...state,position:[r,c],moves:state.moves+1,lost:true,deathCause:'slide'};
        }
        if (state.board[r][c] === 'E') break;
      }
      if (r === state.position[0] && c === state.position[1]) return state;
    }
    const position = [r,c], won = state.board[r][c] === 'E';
    const movers = won ? state.movers : state.movers.map(m => advanceWall(m, position,state.monster).mover);
    const monster=won?state.monster:chase({...state,position},movers);
    const lost=Boolean(monster&&!won&&same(monster,position));
    return {...state, position, movers, monster, moves: state.moves + 1, won,lost,deathCause:lost?'pursuit':null};
  }
  function legalActions(state) {
    if (state.won||state.lost) return [];
    const actions = Object.keys(directions).filter(action => step(state, action) !== state);
    if (state.movers.length||state.monster) actions.push('wait');
    return actions;
  }
  function observe(state) {
    const terminal=state.won||state.lost;
    const waited=state.monster&&!terminal?step(state,'wait'):state;
    return {board: state.board.slice(), position: state.position.slice(), moves: state.moves,
      movers: state.movers.map(m => {
        const next = terminal ? {mover: m, held: false, heldBy:null,targetPosition: m.path[m.index]} : advanceWall(m, state.position,state.monster);
        return {path: m.path.map(cell => cell.slice()), index: m.index, direction: m.direction,
          nextPosition: next.mover.path[next.mover.index].slice(),
          targetPosition: next.targetPosition.slice(), held: next.held,heldBy:next.heldBy};
      }),
      monster:state.monster?{position:state.monster.slice(),waitPosition:waited.monster.slice(),waitLethal:!terminal&&waited.lost}:null,
      won: state.won,lost:state.lost,deathCause:state.deathCause,legalActions: legalActions(state)};
  }
  function stateKey(state) {
    return `${state.position.join(',')}|${state.movers.map(m => `${m.index},${m.direction}`).join(';')}|${state.monster?.join(',')||'-'}`;
  }
  function solve(state) {
    if(state.lost)return null;
    const first = stateKey(state), queue = [state], seen = new Map([[first, null]]);
    for (let i = 0; i < queue.length; i++) {
      const current = queue[i], currentKey = stateKey(current);
      if (current.won) {
        const path = [];
        let key = currentKey;
        while (seen.get(key)) {
          const entry = seen.get(key); path.push(entry.action); key = entry.previous;
        }
        return path.reverse();
      }
      const actions = legalActions(current);
      // Prefer an equally short Wait to an unnecessary out-and-back detour.
      if (actions.includes('wait')) actions.unshift(actions.pop());
      for (const action of actions) {
        const next = step(current, action);
        if(next.lost)continue;
        const key = stateKey(next);
        if (!seen.has(key)) {
          seen.set(key, {previous: currentKey, action}); queue.push(next);
        }
      }
    }
    return null;
  }
  const api = {create, step, legalActions, observe, solve};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GetOut = api;
})(globalThis);
