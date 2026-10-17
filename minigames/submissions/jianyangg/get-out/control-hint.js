/* Explain the available control at the player's current landing or flight state. */
(function (root) {
  'use strict';
  const surfaces = {down: 'floor', up: 'ceiling', left: 'left wall', right: 'right wall'};
  function controlHint(state) {
    if (state.won) return 'Exit reached.';
    if (state.grounded) return `On the ${surfaces[state.gravity]}. Arrows change gravity; hold Space to jump away from this surface.`;
    if (state.bounceTicks > 0) {
      const escape = state.gravity === 'up' || state.gravity === 'down' ? 'Left or Right' : 'Up or Down';
      return `Lava bounce. Hold ${escape} to move away. Each new contact costs one third of a heart.`;
    }
    const boosting = state.rise > 0 || (!state.extended && state.holdRemaining > 0);
    if (state.steered) return boosting ? 'Steer used. Keep Space held for height; wait to land before changing gravity.' : 'Steer used. Wait to land before changing gravity or jumping again.';
    const directions = state.gravity === 'up' || state.gravity === 'down' ? 'Left or Right' : 'Up or Down';
    return boosting
      ? `Jumping. Keep Space held for height; hold ${directions} to steer once.`
      : `Falling ${state.gravity}. Hold ${directions} to steer once. Gravity stays locked until you land.`;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {controlHint};
  else root.GravityHints = {controlHint};
})(globalThis);
