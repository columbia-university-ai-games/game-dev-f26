/* Persistent board and avatar: CSS interpolates between physics positions. */
(function (root) {
  'use strict';
  const STEP_MS = 140;
  const blocks = typeof module !== 'undefined' && module.exports ? require('./block-art.js') : root.GravityBlocks;
  const {SpringMotion} = typeof module !== 'undefined' && module.exports ? require('./spring-motion.js') : root.GravitySpring;
  const {DamageReaction} = typeof module !== 'undefined' && module.exports ? require('./damage-reaction.js') : root.GravityDamage;
  const vectors = {up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1]};
  const names = {'#': 'wall', '^': 'spike', '~': 'lava', T: 'trampoline', E: 'exit', S: 'start', '.': 'empty'};
  const symbols = {'#': '', '^': '', '~': '', T: '', E: '', S: '×', '.': ''};
  const angles = {down: 0, left: 90, up: 180, right: -90};

  class BoardView {
    constructor(board) {
      this.board = board;
      this.document = board.ownerDocument;
      this.boardKey = null;
      this.player = null;
      this.springs = new Map();
      this.support = null;
      this.reducedMotion = board.ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      this.reaction = new DamageReaction(this.reducedMotion);
      board.style.setProperty('--fall-step', `${STEP_MS}ms`);
    }

    rebuild(rows) {
      const height = rows.length, width = rows[0].length;
      this.board.style.gridTemplateColumns = `repeat(${width},1fr)`;
      this.board.style.setProperty('--cols', width);
      this.board.style.setProperty('--rows', height);
      const cells = [];
      this.springs.clear();this.support = null;
      for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < rows[r].length; c++) {
          const type = rows[r][c];
          const cell = this.document.createElement('div');
          cell.className = `cell ${names[type]}`;
          cell.textContent = symbols[type];
          cell.setAttribute('aria-hidden', 'true');
          const art = blocks.createBlockArt(this.document, type);
          if (art) cell.append(art.element);
          if (type === 'T') this.springs.set(`${r},${c}`, {...art, motion: new SpringMotion()});
          if (type === 'E') {
            const door = this.document.createElement('span');
            door.className = 'door';
            door.textContent = '↗';
            cell.append(door);
          }
          cells.push(cell);
        }
      }
      this.player = this.document.createElement('div');
      this.player.className = 'player';
      this.player.setAttribute('aria-hidden', 'true');
      const character = this.document.createElement('span');
      character.textContent = '••';
      this.character = character;
      this.player.append(character);
      this.board.replaceChildren(...cells, this.player);
    }

    render(state, {snap = false, time = performance.now()} = {}) {
      const pose = this.reaction.sample(time);
      if (pose?.freeze) state = pose.snapshot;
      const key = state.board.join('\n');
      if (key !== this.boardKey) {
        this.boardKey = key;
        this.rebuild(state.board);
        snap = true;
      }
      const [dr, dc] = vectors[state.gravity];
      const supportKey = `${state.position[0] + dr},${state.position[1] + dc}`;
      const nextSupport = state.grounded && this.springs.has(supportKey) ? supportKey : null;
      if (this.support && this.support !== nextSupport) {
        const spring = this.springs.get(this.support);
        if (!snap && state.rise > 0) spring.motion.launch(time);
        else spring.motion.leave(time);
      }
      if (nextSupport && nextSupport !== this.support) {
        const spring = this.springs.get(nextSupport);
        spring.element.style.transform = `rotate(${angles[state.gravity]}deg)`;
        spring.motion.land(time);
      }
      this.support = nextSupport;
      if (snap) this.player.style.transition = 'none';
      this.player.style.left = `${state.position[1] * 100 / state.board[0].length}%`;
      this.player.style.top = `${state.position[0] * 100 / state.board.length}%`;
      this.player.style.setProperty('--rotation', `${angles[state.gravity]}deg`);
      this.board.setAttribute('aria-label', `Board. Row ${state.position[0] + 1}, column ${state.position[1] + 1}. Gravity ${state.gravity}. ${state.grounded ? 'Grounded' : 'Airborne'}.`);
      // Commit spawn position before enabling interpolation on the next frame.
      if (snap) void this.board.offsetWidth;
      this.applyReaction(time);
    }

    showImpact(impact, state, options) { return this.reaction.begin(impact, state, options); }
    clearReaction() { this.reaction.clear(); }

    applyReaction(time) {
      if (!this.character) return;
      const pose = this.reaction.sample(time);
      this.character.className = pose ? `hit-${pose.kind}` : '';
      this.character.textContent = pose ? pose.eyes : '••';
      this.player.style.transform = pose ? `translate(${pose.offset[1] * 100}%, ${pose.offset[0] * 100}%)` : '';
    }

    resumeMotion(time = performance.now()) {
      for (const [key, spring] of this.springs) spring.setBend(this.reducedMotion ? (key === this.support ? .28 : 0) : spring.motion.sample(time));
      if (this.player && !this.reaction.sample(time)?.freeze) this.player.style.transition = '';
      this.applyReaction(time);
    }
  }

  const api = {BoardView, STEP_MS};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GravityBoard = api;
})(globalThis);
