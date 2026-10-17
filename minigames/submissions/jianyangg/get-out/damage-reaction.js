/* Timed damage poses; the engine alone owns health and collision outcomes. */
(function (root) {
  'use strict';
  class DamageReaction {
    constructor(reducedMotion = false) { this.reducedMotion = reducedMotion; this.clear(); }
    clear() { this.hit = null; }
    begin(impact, state, {time = performance.now(), freeze = impact.kind === 'spike'} = {}) {
      const duration = freeze ? 480 : 280;
      this.hit = {impact, start: time, duration, freeze, snapshot: {...state,
        board: state.board.slice(), position: impact.position.slice(), gravity: impact.gravity,
        grounded: false, rise: 0, won: false}};
      return duration;
    }
    sample(time = performance.now()) {
      if (!this.hit || time >= this.hit.start + this.hit.duration) return null;
      const {impact, start, freeze, snapshot} = this.hit;
      let offset = [0, 0];
      if (impact.kind === 'lava' && !this.reducedMotion) {
        const phase = Math.min(1, Math.max(0, (time - start) / 280));
        const lift = Math.sin(Math.PI * phase) * .13;
        const shake = Math.sin(phase * Math.PI * 12) * .018 * (1 - phase);
        offset = [impact.normal[0] * lift - impact.normal[1] * shake,
          impact.normal[1] * lift + impact.normal[0] * shake];
      }
      return {kind: impact.kind, eyes: impact.kind === 'spike' ? '××' : '••',
        freeze, snapshot, offset};
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {DamageReaction};
  else root.GravityDamage = {DamageReaction};
})(globalThis);
