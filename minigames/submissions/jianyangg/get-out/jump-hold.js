/* Track each jump input independently for keyboard and multi-touch play. */
(function (root) {
  class JumpHold {
    constructor() { this.sources = new Set(); }
    press(source) { this.sources.add(source); }
    release(source) { this.sources.delete(source); }
    clear() { this.sources.clear(); }
    get active() { return this.sources.size > 0; }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {JumpHold};
  else root.GravityJump = {JumpHold};
})(globalThis);
