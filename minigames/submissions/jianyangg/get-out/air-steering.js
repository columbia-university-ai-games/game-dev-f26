/* Held air controls retry blocked steering without changing gravity or repeating a move. */
(function (root) {
  'use strict';
  const axes = {up: 'vertical', down: 'vertical', left: 'horizontal', right: 'horizontal'};

  class AirSteering {
    constructor() { this.held = new Map(); }
    press(key, action) { this.held.delete(key); this.held.set(key, action); }
    release(key) { this.held.delete(key); }
    clear() { this.held.clear(); }

    action(state) {
      if (state.grounded || state.won || state.dead || state.steered) return null;
      for (const action of [...this.held.values()].reverse()) {
        if (action.startsWith('steer-') || axes[action] !== axes[state.gravity]) return action;
      }
      return null;
    }
  }

  const api = {AirSteering};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GravityControls = api;
})(globalThis);
