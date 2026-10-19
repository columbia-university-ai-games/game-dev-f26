/* Completion stats shown when a board is solved: what the playtest observes. */
(function (root) {
  'use strict';
  const engine = typeof module !== 'undefined' && module.exports ? require('./engine.js') : root.GetOut;
  function completionStats(board, trace, moves) {
    const first = trace.find(event => event.type === 'move' && !event.blocked);
    return {firstMove: first ? first.action : null, moves, shortest: engine.solve(engine.create(board)).length};
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {completionStats};
  else root.GetOutStats = {completionStats};
})(globalThis);
