/* Observed stopping positions only; no solver or hidden route information. */
(function (root) {
  'use strict';
  function stoppingPoints(start, events) {
    const points = new Map([[start.join(','), start.slice()]]);
    for (const event of events) {
      if (event.type === 'move' && !event.blocked) {
        points.set(event.to.join(','), event.to.slice());
      }
    }
    return Array.from(points.values());
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {stoppingPoints};
  else root.GetOutNotebook = {stoppingPoints};
})(globalThis);
