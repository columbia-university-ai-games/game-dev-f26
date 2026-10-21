const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const game = require('../engine.js');
const levels = require('../levels.js');
const hintAPI = require('../hints.js');
const folder = path.join(__dirname, '..');
const movementFixture = ['S..#.', '.....', '.#...', '.....', '....E'];

// This small DOM double exercises the real event handlers and JSON export.
// Browser layout, accessibility and touch smoke checks remain separate.
function startApp(board = null) {
  let lastBlob;
  class Element {
    constructor(tag = 'div') {
      this.tagName = tag.toUpperCase(); this.children = []; this.listeners = {};
      this.dataset = {}; this.disabled = false; this.hidden = false; this.value = '';
      this.textContent = ''; this.attributes = {}; this.className = '';
      this.style = {setProperty() {}}; this.classList = {toggle() {}};
    }
    set disabled(value) { this.isDisabled = Boolean(value); }
    get disabled() { return this.isDisabled; }
    append(child) { child.parent = this; this.children.push(child); }
    replaceChildren(...children) { this.children = []; children.forEach(child => this.append(child)); }
    setAttribute(name, value) { this.attributes[name] = value; }
    addEventListener(name, listener) { (this.listeners[name] ||= []).push(listener); }
    emit(name, event = {}) {
      for (const listener of this.listeners[name] || []) listener({target: this, ...event});
    }
    click() { if (!this.disabled) this.emit('click'); }
    focus() {} select() {} scrollIntoView() {}
    closest(selector) {
      return selector.split(',').some(part => part.startsWith('.') ? this.className.split(' ').includes(part.slice(1)) : part.toUpperCase() === this.tagName) ? this : this.parent?.closest(selector) || null;
    }
    querySelector(selector) {
      return this.children.find(child => selector === '.player' && child.className === 'player') ||
        this.children.map(child => child.querySelector(selector)).find(Boolean) || null;
    }
  }
  const html = fs.readFileSync(path.join(folder, 'index.html'), 'utf8');
  const elements = new Map([...html.matchAll(/<([a-z][a-z0-9]*)\b[^>]*\bid="([^"]+)"/gi)].map(match => [match[2], new Element(match[1])]));
  const moves = ['up', 'right', 'down', 'left'].map(action => {
    const button = new Element('button'); button.dataset.move = action; return button;
  });
  const tool = new Element('input'); tool.value = '#';
  const document = {
    listeners: {}, getElementById: id => {
      assert.ok(elements.has(id), `app references existing markup: ${id}`); return elements.get(id);
    },
    createElement: tag => new Element(tag),
    querySelectorAll: selector => selector === '[data-move]' ? moves : [],
    querySelector: selector => selector === 'input[name=tool]:checked' ? tool : null,
    addEventListener(name, listener) { (this.listeners[name] ||= []).push(listener); },
  };
  vm.runInNewContext(fs.readFileSync(path.join(folder, 'app.js'), 'utf8'), {
    GetOut: game, GetOutLevels: levels, GetOutHints: hintAPI, document,
    Blob, URL: {createObjectURL(blob) { lastBlob = blob; return 'blob:test'; }, revokeObjectURL() {}},
    setTimeout(callback) { callback(); },
  }, {filename: 'app.js'});
  const app = {
    element: id => document.getElementById(id),
    click: id => document.getElementById(id).click(),
    move: action => moves.find(button => button.dataset.move === action).click(),
    key(key, target = new Element('div')) {
      for (const listener of document.listeners.keydown || []) listener({key, target, preventDefault() {}});
    },
    async trace() { document.getElementById('download').click(); return JSON.parse(await lastBlob.text()); },
  };
  if (board) {
    app.element('board-code').value = board.join('\n');
    app.click('import');
  }
  return app;
}

test('three accepted hint requests advance, label and count; extra requests do nothing', async () => {
  const app = startApp(), before = await app.trace();
  for (let level = 1; level <= 3; level++) {
    app.click('hint');
    const payload = await app.trace(), event = payload.events.at(-1);
    assert.equal(payload.hints, level); assert.equal(payload.hintLevel, level);
    assert.equal(payload.moves, before.moves); assert.deepEqual(payload.position, before.position);
    assert.deepEqual(payload.board, before.board);
    assert.equal(event.type, 'hint'); assert.equal(event.hintLevel, level);
    assert.equal(event.label, ['Think', 'Notice', 'Reveal'][level - 1]);
    assert.equal(event.kind, ['question', 'feature', 'reveal'][level - 1]);
    assert.deepEqual(event.position, before.position); assert.equal(event.moves, 0);
    assert.ok(event.message.length > 0);
    assert.match(app.element('hint-level').textContent, new RegExp(`${level} / 3 revealed`));
    assert.ok(app.element('hint-level').textContent.includes(event.label));
    assert.equal(app.element('hint-message').textContent, event.message);
    assert.ok(app.element('hint-count').textContent.startsWith(String(level)));
    assert.ok(app.element('trace-list').children.at(-1).textContent.includes(`Hint ${level} · ${event.label}`));
  }
  assert.equal(app.element('hint').disabled, true);
  assert.match(app.element('hint-availability').textContent, /No more hints/);
  const revealed = await app.trace(); app.click('hint');
  assert.deepEqual(await app.trace(), revealed);
});

test('blocked moves retain clues; successful moves and undo clear clues while preserving total requests', async () => {
  const app = startApp(movementFixture); app.click('hint'); app.move('up');
  let payload = await app.trace();
  assert.equal(payload.hintLevel, 1); assert.equal(payload.hints, 1);
  assert.equal(payload.events.at(-1).blocked, true);
  app.move('down'); payload = await app.trace();
  assert.equal(payload.hintLevel, 0); assert.equal(payload.hints, 1); assert.equal(payload.moves, 1);
  assert.doesNotMatch(app.element('hint-message').textContent, /Which stopping point/);
  app.click('hint'); app.click('hint');
  payload = await app.trace(); assert.equal(payload.hintLevel, 2); assert.equal(payload.hints, 3);
  app.click('undo'); payload = await app.trace();
  assert.equal(payload.hintLevel, 0); assert.equal(payload.hints, 3); assert.equal(payload.moves, 0);
  assert.deepEqual(payload.position, [0, 0]); assert.equal(payload.events.at(-1).type, 'undo');
  app.click('hint'); payload = await app.trace();
  assert.equal(payload.events.at(-1).hintLevel, 1); assert.equal(payload.hints, 4);
  assert.equal(payload.hints, payload.events.filter(event => event.type === 'hint').length);
});

test('reset and board selection start clean attempts; invalid imports preserve the current attempt', async () => {
  const app = startApp(movementFixture); app.click('hint'); app.move('down');
  const before = await app.trace();
  for (const code of ['S..\n.E.\n...', 'SS\n.E', 'S?\n.E']) {
    app.element('board-code').value = code; app.click('import');
    assert.deepEqual(await app.trace(), before);
  }
  app.click('reset'); let payload = await app.trace();
  assert.equal(payload.hintLevel, 0); assert.equal(payload.hints, 0); assert.equal(payload.moves, 0);
  assert.deepEqual(payload.events, []);
  app.click('hint'); app.element('levels').value = '1'; app.element('levels').emit('change');
  payload = await app.trace(); assert.deepEqual(payload.board, levels[1].board);
  assert.equal(payload.hints, 0); assert.equal(payload.hintLevel, 0); assert.deepEqual(payload.events, []);
});

test('custom board export/import and editor cancel preserve gameplay and hint state', async () => {
  const app = startApp(); const board = ['S..#.', '.....', '.#...', '.....', '....E'];
  app.element('board-code').value = board.join('\n'); app.click('import');
  app.click('hint'); app.move('right'); app.click('hint');
  const before = await app.trace();
  app.click('edit'); assert.equal(app.element('hint').disabled, true);
  app.click('hint'); app.key('ArrowDown');
  app.click('cancel-edit'); assert.deepEqual(await app.trace(), before);
  app.click('export'); assert.equal(app.element('board-code').value, board.join('\n'));
  app.click('import'); const payload = await app.trace();
  assert.deepEqual(payload.board, board); assert.equal(payload.moves, 0);
  assert.equal(payload.hints, 0); assert.equal(payload.hintLevel, 0); assert.deepEqual(payload.events, []);
});

test('a trap reached on a valid custom board gives honest recovery guidance without repeated requests', async () => {
  const app = startApp(), board = ['....', '.SE.', '....'];
  const initial = game.create(board), trapped = game.step(initial, 'up');
  assert.deepEqual(game.solve(initial), ['right']);
  assert.equal(game.solve(trapped), null, 'fixture must lose its route after a legal slide');
  app.element('board-code').value = board.join('\n'); app.click('import');
  assert.deepEqual((await app.trace()).board, board);
  app.move('up'); app.click('hint');
  const recovery = await app.trace(), event = recovery.events.at(-1);
  assert.equal(recovery.hints, 1); assert.equal(recovery.hintLevel, 1);
  assert.equal(recovery.moves, 1); assert.deepEqual(recovery.position, trapped.position);
  assert.equal(event.type, 'hint'); assert.equal(event.kind, 'unreachable');
  assert.equal(event.hintLevel, 1); assert.deepEqual(event.position, trapped.position);
  assert.match(event.message, /no route/i); assert.match(event.message, /undo/i); assert.match(event.message, /reset/i);
  assert.equal(app.element('hint-message').textContent, event.message);
  assert.match(app.element('hint-availability').textContent, /no solution move/i);
  assert.equal(app.element('hint').disabled, true);
  app.click('hint'); app.click('hint');
  assert.deepEqual(await app.trace(), recovery);
  app.click('undo'); let payload = await app.trace();
  assert.equal(payload.hints, 1); assert.equal(payload.hintLevel, 0);
  assert.equal(payload.moves, 0); assert.deepEqual(payload.position, initial.position);
  assert.equal(app.element('hint').disabled, false);
  assert.doesNotMatch(app.element('hint-message').textContent, /no route/i);
  app.click('hint'); payload = await app.trace();
  assert.equal(payload.hints, 2); assert.equal(payload.events.at(-1).kind, 'question');
  assert.equal(payload.events.at(-1).label, 'Think'); assert.equal(payload.events.at(-1).hintLevel, 1);
  app.click('reset'); payload = await app.trace();
  assert.equal(payload.hints, 0); assert.equal(payload.hintLevel, 0); assert.equal(payload.moves, 0);
  assert.deepEqual(payload.events, []); assert.deepEqual(payload.position, initial.position);
});

test('every challenge puzzle can be completed without hints; terminal moves and hints are blocked', async () => {
  for (const [index, level] of levels.entries()) {
    const app = startApp(); app.element('levels').value = String(index); app.element('levels').emit('change');
    const solution = game.solve(game.create(level.board));
    for (const action of solution) app.move(action);
    const payload = await app.trace();
    assert.equal(payload.outcome, 'escaped'); assert.equal(payload.moves, solution.length);
    assert.equal(payload.hints, 0); assert.equal(payload.hintLevel, 0);
    assert.equal(app.element('hint').disabled, true);
    app.move('down'); app.key('ArrowLeft'); app.click('hint');
    assert.deepEqual(await app.trace(), payload);
    app.click('undo'); const undone = await app.trace();
    assert.equal(undone.outcome, 'in_progress'); assert.equal(undone.moves, solution.length - 1);
    assert.equal(app.element('hint').disabled, false);
  }
});

test('Next puzzle traverses all ten boards with current labels and clean counters, clues and traces', async () => {
  const app = startApp();
  assert.equal(levels.length, 10);
  const options = app.element('levels').children;
  assert.equal(options.length, 11, 'ten included puzzles plus the custom-board option');
  for (const [index, level] of levels.entries()) {
    const before = await app.trace();
    assert.deepEqual(before.board, level.board);
    assert.deepEqual(before.events, []);
    assert.equal(before.moves, 0); assert.equal(before.hints, 0); assert.equal(before.hintLevel, 0);
    assert.equal(app.element('levels').value, String(index));
    assert.equal(app.element('level-number').textContent, `PUZZLE ${String(index + 1).padStart(2, '0')} / 10`);
    assert.equal(app.element('level-title').textContent, level.name);
    assert.equal(options[index].textContent, `${index + 1}. ${level.name}`);
    assert.equal(app.element('next').hidden, true);

    for (let stage = 1; stage <= 3; stage++) app.click('hint');
    const solution = game.solve(game.create(level.board));
    for (const action of solution) app.move(action);
    const complete = await app.trace();
    assert.equal(complete.outcome, 'escaped'); assert.equal(complete.hints, 3);
    assert.equal(complete.events.filter(event => event.type === 'hint').length, 3);
    assert.equal(complete.hintLevel, 0); assert.equal(complete.moves, solution.length);
    assert.equal(app.element('next').hidden, index === levels.length - 1);

    app.click('undo');
    assert.equal((await app.trace()).outcome, 'in_progress');
    assert.equal(app.element('next').hidden, true);
    assert.equal(app.element('hint').disabled, false);
    for (let stage = 1; stage <= 3; stage++) app.click('hint');
    const lastClue = (await app.trace()).events.at(-1);
    assert.equal(lastClue.kind, 'reveal');
    assert.ok(lastClue.message.includes(solution.at(-1)));
    app.move(solution.at(-1));
    assert.equal((await app.trace()).outcome, 'escaped');
    if (index < levels.length - 1) app.click('next');
  }
  app.click('reset');
  const reset = await app.trace();
  assert.deepEqual(reset.board, levels.at(-1).board);
  assert.equal(reset.outcome, 'in_progress'); assert.equal(reset.hints, 0);
  assert.equal(reset.hintLevel, 0); assert.equal(reset.moves, 0); assert.deepEqual(reset.events, []);
  assert.equal(app.element('next').hidden, true);
});

test('selection returns from final or custom completion to a clean challenge attempt', async () => {
  const app = startApp();
  app.element('levels').value = '9'; app.element('levels').emit('change');
  for (const action of game.solve(game.create(levels[9].board))) app.move(action);
  assert.equal(app.element('next').hidden, true);
  app.element('levels').value = '3'; app.element('levels').emit('change');
  let payload = await app.trace();
  assert.deepEqual(payload.board, levels[3].board); assert.deepEqual(payload.events, []);
  assert.equal(payload.hints, 0); assert.equal(payload.hintLevel, 0); assert.equal(payload.moves, 0);

  app.element('board-code').value = 'SE\n..'; app.click('import'); app.move('right');
  payload = await app.trace();
  assert.equal(payload.outcome, 'escaped'); assert.equal(app.element('next').hidden, true);
  assert.equal(app.element('levels').value, 'custom');
  app.element('levels').value = '0'; app.element('levels').emit('change');
  payload = await app.trace();
  assert.deepEqual(payload.board, levels[0].board); assert.deepEqual(payload.events, []);
  assert.equal(payload.outcome, 'in_progress'); assert.equal(payload.hints, 0);
  assert.equal(payload.hintLevel, 0); assert.equal(payload.moves, 0);
  assert.equal(app.element('hint').disabled, false);
});

test('keyboard movement ignores text entry while regular arrow/WASD controls still work', async () => {
  const app = startApp(movementFixture), before = await app.trace();
  app.key('s', app.element('board-code')); assert.deepEqual(await app.trace(), before);
  app.key('s'); assert.equal((await app.trace()).moves, 1);
  app.key('ArrowRight'); assert.equal((await app.trace()).moves, 2);
});

test('completion reports all requests across multiple positions without counting unavailable hints', async () => {
  const app = startApp(), solution = game.solve(game.create(levels[0].board));
  for (const action of solution) {
    app.click('hint'); app.click('hint'); app.click('hint'); app.click('hint');
    app.move(action);
  }
  const payload = await app.trace();
  assert.equal(payload.outcome, 'escaped'); assert.equal(payload.hints, 3 * solution.length);
  assert.equal(payload.hints, payload.events.filter(event => event.type === 'hint').length);
  assert.ok(app.element('status').textContent.includes(`with ${payload.hints} hints`));
  assert.match(app.element('hint-message').textContent, /found the exit/i);
});

test('touch swipes move once, cancel cleanly, and do not trigger for mouse input', async () => {
  const app = startApp(movementFixture), board = app.element('board'), before = await app.trace();
  board.emit('pointerdown', {pointerType: 'mouse', clientX: 50, clientY: 50});
  board.emit('pointerup', {pointerType: 'mouse', clientX: 50, clientY: 130});
  assert.deepEqual(await app.trace(), before);
  board.emit('pointerdown', {pointerType: 'touch', clientX: 50, clientY: 50});
  board.emit('pointercancel');
  board.emit('pointerup', {pointerType: 'touch', clientX: 50, clientY: 130});
  assert.deepEqual(await app.trace(), before);
  board.emit('pointerdown', {pointerType: 'touch', clientX: 50, clientY: 50});
  board.emit('pointerup', {pointerType: 'touch', clientX: 53, clientY: 55});
  assert.deepEqual(await app.trace(), before);
  board.emit('pointerdown', {pointerType: 'touch', clientX: 50, clientY: 50});
  board.emit('pointerup', {pointerType: 'touch', clientX: 53, clientY: 130});
  const payload = await app.trace(); assert.equal(payload.moves, 1);
  assert.equal(payload.events.at(-1).action, 'down');
});
