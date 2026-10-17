/* Searches the engine's exact rules, accepting only damage-free routes. */
(function (root) {
  'use strict';
  const game = typeof module !== 'undefined' && module.exports ? require('./engine.js') : root.GetOut;

  function key(state) {
    return [state.position, state.gravity, state.grounded, state.rise,
      state.extended, state.holdRemaining, state.bounceTicks, state.steered, state.lavaContact, state.won].join('|');
  }

  function search(board, {limit = 60000, allowJump = true, allowSteering = true} = {}) {
    const start = game.create(board);
    const queue = [{state: start, parent: -1, action: null}];
    const seen = new Set([key(start)]);
    let explored = 0;
    for (let i = 0; i < queue.length; i++) {
      if (explored >= limit) return {status: 'limit', path: null, explored};
      explored++;
      const state = queue[i].state;
      if (state.won) {
        const path = [];
        for (let j = i; queue[j].parent >= 0; j = queue[j].parent) path.push(queue[j].action);
        return {status: 'solved', path: path.reverse(), explored};
      }
      const actions = state.grounded ? game.legalActions(state)
        : [...game.legalActions(state), 'tick', 'hold'];
      for (const action of actions) {
        if ((!allowJump && action === 'jump') || (!allowSteering && action.startsWith('steer'))) continue;
        const next = action === 'tick' || action === 'hold'
          ? game.tick(state, action === 'hold') : game.input(state, action);
        if (next.health !== 15 || next.dead || next.event === 'spike') continue;
        const id = key(next);
        if (seen.has(id)) continue;
        seen.add(id);
        queue.push({state: next, parent: i, action});
      }
    }
    return {status: 'unreachable', path: null, explored};
  }

  function solve(board, limit = 60000) {
    return search(board, {limit}).path;
  }

  const api = {solve, search};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GravitySolver = api;
})(globalThis);
