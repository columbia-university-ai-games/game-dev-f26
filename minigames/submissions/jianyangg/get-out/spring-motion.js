/* Visual plank compression only; gameplay remains in the engine. */
(function (root) {
  class SpringMotion {
    constructor() { this.start = 0; this.frames = [[0, 0]]; }
    land(time) { this.start = time; this.frames = [[0, 0], [70, .65], [160, .1], [280, .28]]; }
    launch(time) { this.start = time; this.frames = [[0, .85], [90, -.35], [180, .18], [320, 0]]; }
    leave(time) { const bend = this.sample(time); this.start = time; this.frames = [[0, bend], [180, 0]]; }
    sample(time) {
      const elapsed = Math.max(0, time - this.start);
      for (let i = 1; i < this.frames.length; i++) {
        const [end, value] = this.frames[i], [start, previous] = this.frames[i - 1];
        if (elapsed <= end) return previous + (value - previous) * (elapsed - start) / (end - start);
      }
      return this.frames.at(-1)[1];
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {SpringMotion};
  else root.GravitySpring = {SpringMotion};
})(globalThis);
