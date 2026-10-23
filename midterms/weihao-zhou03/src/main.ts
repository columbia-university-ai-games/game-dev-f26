import './style.css';
import { createGame, SCENARIOS } from './core/game.ts';
import { DIRECTIONS, type Direction, type PublicObservation, type ScenarioId } from './core/types.ts';
import { SeaView } from './renderer/sea.ts';
import { SeaAudio } from './renderer/audio.ts';
import { canRecordDemonstration, startDemonstrationRecording } from './renderer/recording.ts';

const app = document.querySelector<HTMLDivElement>('#app')!;
const speciesNames: Record<string, string> = { 'silver-bell': '银铃鱼', reefback: '礁背鱼', glassfin: '玻璃鳍' };
const directionNames: Record<Direction, string> = { N: '北', NE: '东北', E: '东', SE: '东南', S: '南', SW: '西南', W: '西', NW: '西北' };
const arrows: Record<Direction, string> = { N: '↑', NE: '↗', E: '→', SE: '↘', S: '↓', SW: '↙', W: '←', NW: '↖' };
const safe = (value: string | number) => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));
let scenario: ScenarioId = 'A';
let seed = 101;
let game = createGame(seed, scenario);
let observation = game.observe('human');
let selectedDirection: Direction = 'NE';
let beaconProfile: 'chime' | 'drone' = 'chime';
let beaconDelay: 0 | 2 = 2;
let modal: 'menu' | 'help' | 'outcome' | null = 'menu';
let helpPage = 0;
let actionTrace: string[] = [];
let logs: { tick: number; text: string }[] = [];
let lastError = '';
let replay: string[] | null = null;
let replayIndex = 0;
let replayTimer: ReturnType<typeof setTimeout> | null = null;
let replayLabel = '公共动作航迹回放';
interface ModelDemo {
  seed: number; scenario: ScenarioId; actions: string[]; model: string;
  calls: number; tokens: number | string; sourceLabel: string;
  outcome?: Partial<PublicObservation['outcome']>;
}
let loadingDemo = false;
let recordingAbort: AbortController | null = null;
let recordingSeconds = 0;
const audio = new SeaAudio();

app.innerHTML = `
  <header class="masthead">
    <button class="brand" id="brand" aria-label="打开任务选择"><span class="brand-mark">◉</span><span><small>ECHO FISHERY</small><strong>回声渔场</strong></span></button>
    <div id="mission-heading" class="mission-heading"></div>
    <div class="header-tools"><button id="audio-toggle" class="text-button" title="开启合成音效">声音 关</button><button id="help-open" class="text-button">航行手册 <kbd>?</kbd></button><button id="menu-open" class="text-button">任务</button></div>
  </header>
  <section id="compact-status" class="compact-status" aria-label="船只状态与公开情报"></section>
  <main class="play-shell">
    <section class="sea-stage" aria-label="海域与公开线索">
      <div id="sea"></div>
      <div class="chart-caption"><span class="micro-label">NIGHT CHART / 夜航海图</span><span>礁角海湾 · 100 × 70</span></div>
      <div class="compass" aria-hidden="true"><span>N</span><i>↑</i><small>北</small></div>
      <div id="sea-notice" class="sea-notice" role="status" aria-live="polite"></div>
      <div class="chart-footer"><span><i class="legend-dot echo"></i>历史回波</span><span><i class="legend-dot amber"></i>声标 / 港口</span><span><i class="legend-dot danger"></i>公开危险</span><span class="chart-hint">点击海面选择方向</span></div>
      <div id="replay-banner" class="replay-banner" hidden></div>
    </section>
    <aside class="ship-panel" aria-label="船只与航海记录">
      <div class="ship-panel-title"><span class="micro-label">VESSEL STATUS</span><span class="online-dot"></span></div>
      <div id="vessel-status"></div>
      <section class="cargo-section"><div class="section-label">舱内渔获 <span>尚未交付</span></div><div id="cargo"></div></section>
      <section class="log-section"><div class="section-label">航海记录 <span>PUBLIC LOG</span></div><ol id="event-log" aria-live="polite"></ol></section>
      <div class="trace-tools"><button id="export-trace" class="text-button">导出航迹 ↓</button><button id="import-trace" class="text-button">回放航迹 ↑</button><input id="trace-file" type="file" accept=".json,application/json" hidden /></div>
    </aside>
  </main>
  <section class="action-deck" aria-label="动作控制台"><div id="controls"></div></section>
  <div id="modal-root"></div>
  <div id="toast" role="status" aria-live="polite"></div>
`;

let sea: SeaView | null = null;
try { sea = new SeaView(document.querySelector('#sea')!, selectDirection); }
catch (error) {
  document.querySelector('#sea')!.innerHTML = `<div class="webgl-error"><h2>海图渲染未能启动</h2><p>需要支持 WebGL 的浏览器。请启用硬件加速后刷新。</p><small>${safe(error instanceof Error ? error.message : 'WebGL unavailable')}</small></div>`;
}

function button(action: string, title: string, description: string, className = '', key = '') {
  const disabled = !observation.legalActions.includes(action) || replay !== null || recordingAbort !== null || modal !== null;
  let reason = '';
  if (!observation.legalActions.includes(action)) reason = action === 'return' ? '需回到港口范围内，且当前未在搏鱼。' : action.startsWith('beacon:') && observation.boat.beaconsLeft === 0 ? '声标库存已用尽。' : /^(move|evade):/.test(action) ? '该方向的移动轨迹与公开礁石或边界相交。' : '当前阶段不可执行此动作。';
  return `<button class="action-button ${className}" data-action="${action}" ${disabled ? 'disabled' : ''} ${reason ? `title="${reason}"` : ''}><span>${title}${key ? `<kbd>${key}</kbd>` : ''}</span><small>${description}</small></button>`;
}
function selectDirection(direction: Direction) {
  selectedDirection = direction;
  sea?.select(direction);
  renderControls();
}
function renderHeader() {
  const completed = observation.boat.cargo.length;
  document.querySelector('#mission-heading')!.innerHTML = `<div class="mission-title"><span class="mission-tag">任务 ${observation.scenario.id}</span><strong>${safe(observation.scenario.name)}</strong><span class="mission-quota">${completed} / ${observation.scenario.quota} 尾 · 需返航</span></div><div class="night-clock"><span class="moon-icon">◔</span><strong>${observation.remaining}</strong><span>步至天亮</span><div class="night-meter"><i style="width:${Math.max(0, observation.remaining / observation.scenario.budget * 100)}%"></i></div></div>`;
}
function renderStatus() {
  const boat = observation.boat;
  document.querySelector('#vessel-status')!.innerHTML = `<h2>灯塔号 <small>NO. 07</small></h2><div class="hull-row"><span>船体</span><span class="hull-pips">${Array.from({ length: boat.maxHull }, (_, i) => `<i class="${i < boat.hull ? 'intact' : ''}"></i>`).join('')}</span><b>${boat.hull}/${boat.maxHull}</b></div><div class="vessel-facts"><div><span>声标库存</span><strong>${boat.beaconsLeft}<small> 枚</small></strong></div><div><span>船首朝向</span><strong>${arrows[boat.heading]}<small> ${directionNames[boat.heading]}</small></strong></div></div><div class="coordinate">${boat.position.x.toFixed(1)} E <span>/</span> ${boat.position.y.toFixed(1)} S <span>·</span> 第 ${observation.tick} 步</div>`;
  document.querySelector('#cargo')!.innerHTML = boat.cargo.length ? `<ul class="cargo-list">${boat.cargo.map(item => `<li><span class="fish-icon">⋊</span><span>${speciesNames[item.species] ?? safe(item.species)}</span><b>${item.value}<small> 分</small></b></li>`).join('')}</ul><div class="cargo-total">带回港才能计分 <strong>${boat.cargo.reduce((sum, item) => sum + item.value, 0)}</strong></div>` : '<div class="empty-cargo"><span>⋊</span><p>船舱还是空的</p><small>先探测，再布置捕捞窗口。</small></div>';
  document.querySelector('#event-log')!.innerHTML = logs.length ? logs.slice(-5).reverse().map(log => `<li><span>${String(log.tick).padStart(2, '0')}</span><p>${safe(log.text)}</p></li>`).join('') : '<li class="log-empty"><span>00</span><p>港灯还亮着。海底的动静尚不可知。</p></li>';
  const compact = document.querySelector('#compact-status')!;
  const informationOpen = compact.querySelector('details')?.open ?? false;
  compact.innerHTML = `<div class="compact-facts"><span>船体 <b class="${boat.hull < boat.maxHull ? 'damaged' : ''}">${boat.hull}/${boat.maxHull}</b></span><span>声标 <b>${boat.beaconsLeft}</b></span><span>渔获 <b>${boat.cargo.length}/${observation.scenario.quota}</b></span></div><details class="public-information" ${informationOpen ? 'open' : ''}><summary>舱单与公开情报 <span>${observation.contacts.length} 回波</span></summary><div class="public-information-content"><h3>任务 ${observation.scenario.id} · ${safe(observation.scenario.name)}</h3><p>${safe(observation.scenario.subtitle)} · 需带回 ${observation.scenario.quota} 尾</p><p>船位 ${boat.position.x.toFixed(1)}, ${boat.position.y.toFixed(1)} · 船首${directionNames[boat.heading]} · 第 ${observation.tick} 步</p><h4>船舱 · 尚未交付</h4><p>${boat.cargo.length ? boat.cargo.map(item => `${speciesNames[item.species]} ${item.value}分`).join(' / ') : '空舱'}</p><h4>历史回波 · 不代表当前位置</h4>${observation.contacts.length ? observation.contacts.map(contact => `<p>${contact.hint === 'large-anomaly' ? '大型异常' : contact.species ? speciesNames[contact.species] : '鱼群'} · ${observation.tick - contact.tick}步前 · (${contact.position.x}, ${contact.position.y}) · 不确定半径 ${contact.uncertainty}</p>`).join('') : '<p>暂无有效回波。主动探测会获得当时的线索。</p>'}<h4>已部署声标</h4>${observation.beacons.length ? observation.beacons.map(beacon => `<p>${beacon.profile === 'chime' ? '铃声' : '低鸣'} · (${beacon.position.x}, ${beacon.position.y}) · ${beacon.active ? '发声中' : `${beacon.startsIn}步后启动`} · 余 ${beacon.life}步</p>`).join('') : '<p>尚未部署</p>'}${observation.threat ? `<h4 class="damaged">已公开冲撞通道</h4><p>(${observation.threat.start.x}, ${observation.threat.start.y}) → (${observation.threat.end.x}, ${observation.threat.end.y}) · 半宽 ${observation.threat.width} · ${observation.threat.resolvesIn}步后结算</p>` : ''}<h4>最近航海记录</h4>${logs.length ? logs.slice(-5).reverse().map(log => `<p>第${log.tick}步 · ${safe(log.text)}</p>`).join('') : '<p>港灯还亮着，海底的动静尚不可知。</p>'}<div class="compact-trace-tools"><button id="export-trace" class="text-button">导出航迹 ↓</button><button id="import-trace" class="text-button">回放航迹 ↑</button></div></div></details>`;
  const notice = document.querySelector('#sea-notice')!;
  notice.className = `sea-notice ${observation.threat ? 'is-danger' : observation.fishing ? 'is-fishing' : ''}`;
  if (observation.threat) notice.innerHTML = `<span class="notice-icon">!</span><div><strong>冲撞已锁定</strong><span>红色通道将在${observation.threat.resolvesIn === 1 ? '下一次行动后' : `${observation.threat.resolvesIn} 步后`}结算。离开通道，或承担代价。</span></div>`;
  else if (observation.warning) notice.innerHTML = `<span class="notice-icon">◌</span><div><strong>${directionNames[observation.warning.bearing]}方有${observation.warning.urgency === 'near' ? '逼近的' : '远处的'}水下动静</strong><span>这是方向线索，不是精确位置。留意下一步。</span></div>`;
  else if (observation.fishing) notice.innerHTML = '<span class="notice-icon">⋊</span><div><strong>鱼已上钩</strong><span>收线会制造新声音。海面在等待你的选择。</span></div>';
  else if (observation.tick < 2) notice.innerHTML = '<span class="notice-icon">◉</span><div><strong>先听听这片海</strong><span>弱探测更安静。强探测看得更远，也更容易被听见。</span></div>';
  else notice.innerHTML = '';
}
function directionPad() {
  const cells: (Direction | null)[] = ['NW', 'N', 'NE', 'W', null, 'E', 'SW', 'S', 'SE'];
  return `<div class="direction-section"><div class="section-label">行动方向 <b>${directionNames[selectedDirection]}</b></div><div class="direction-pad">${cells.map(direction => direction ? `<button data-direction="${direction}" class="${selectedDirection === direction ? 'selected' : ''}" aria-label="选择${directionNames[direction]}方向" aria-pressed="${selectedDirection === direction}">${arrows[direction]}</button>` : '<span>◉</span>').join('')}</div></div>`;
}
function renderControls() {
  const controls = document.querySelector('#controls')!;
  const observation = game.observe('human');
  if (observation.phase === 'TERMINAL') {
    controls.innerHTML = `<div class="terminal-strip"><span class="micro-label">VOYAGE ENDED</span><h2>这一夜的航程已结束</h2><p>渔获只在主动返航后交付。</p><button id="show-outcome" class="primary-button">查看结算 →</button><button id="restart" class="secondary-button">再次出航</button></div>`;
    return;
  }
  const common = `<div class="utility-actions">${button('wait', '静候一步', '不移动，也会推进夜晚', 'compact', 'Space')}${button('return', '回港交付', '仅港口范围内可用', 'compact harbor-action')}<p class="fixed-time">每个有效动作 = 1 步 · 思考时世界暂停</p></div>`;
  if (observation.fishing) {
    const fish = observation.fishing;
    const cue = { tired: ['疲惫', '较适合收线，但声音风险仍在。'], pulling: ['拉扯', '平衡张力与进度，留意周围动静。'], burst: ['冲刺', '本次收线会承受更高拉力。'] }[fish.cue];
    controls.innerHTML = `<div class="deck-layout fishing-layout">${directionPad()}<div class="fight-status"><span class="micro-label">LINE ENGAGED</span><h3>${speciesNames[fish.species] ?? safe(fish.species)} <span>${cue[0]}</span></h3><div class="fishing-meter"><span>收线进度 <b>${fish.progress}/100</b></span><div><i style="width:${Math.min(100, fish.progress)}%"></i></div></div><div class="fishing-meter tension"><span>鱼线张力 <b>${fish.tension}/100</b></span><div><i style="width:${Math.min(100, fish.tension)}%"></i></div></div><p>${cue[1]}</p></div><div class="reel-actions"><div class="section-label">本次鱼的提示对本次操作生效</div><div class="reel-buttons">${button('reel:steady', '稳收', '低噪 · 较慢', '', '1')}${button('reel:strong', '强收', '快速 · 高张力 / 高噪', '', '2')}${button('reel:slack', '放线', '降张力 · 损失进度', '', '3')}</div>${button(`evade:${selectedDirection}`, `切线急避 ${arrows[selectedDirection]}`, `放弃当前鱼，向${directionNames[selectedDirection]}移动 8 单位`, 'evade-action', 'X')}</div>${common}</div>`;
  } else {
    controls.innerHTML = `<div class="deck-layout">${directionPad()}<div class="navigation-actions"><div class="section-label">航行与下竿 <span>${directionNames[selectedDirection]}向</span></div><div class="two-actions">${button(`move:${selectedDirection}:quiet`, '缓行', '4 单位 · 声音较低', '', '1')}${button(`move:${selectedDirection}:rush`, '急行', '7 单位 · 声音较大', '', '2')}</div>${button(`cast:${selectedDirection}`, `向${directionNames[selectedDirection]}下竿`, '投距 10 · 空竿仍消耗一步', 'cast-action', 'F')}</div><div class="acoustic-actions"><div class="section-label">声学布置 <span>探测也会改变局面</span></div><div class="two-actions">${button('ping:weak', '弱探测', '较近 / 较安静', '', 'Q')}${button('ping:strong', '强探测', '较远 / 较响亮', '', 'E')}</div><div class="beacon-row"><select id="beacon-profile" aria-label="声标声型"><option value="chime" ${beaconProfile === 'chime' ? 'selected' : ''}>铃声声标</option><option value="drone" ${beaconProfile === 'drone' ? 'selected' : ''}>低鸣声标</option></select><select id="beacon-delay" aria-label="声标启动延迟"><option value="2" ${beaconDelay === 2 ? 'selected' : ''}>延迟 2 步</option><option value="0" ${beaconDelay === 0 ? 'selected' : ''}>立即启动</option></select>${button(`beacon:${beaconProfile}:${beaconDelay}`, '布标', '留在船当前位置', 'beacon-action', 'B')}</div></div>${common}</div>`;
  }
}
function render() {
  renderHeader(); renderStatus(); renderControls();
  sea?.update(observation); sea?.select(selectedDirection);
  renderPlaybackBanner();
}
function renderPlaybackBanner() {
  const banner = document.querySelector<HTMLElement>('#replay-banner')!;
  banner.hidden = replay === null && recordingAbort === null;
  if (recordingAbort) banner.innerHTML = `<span class="recording-indicator">正在生成本地演示 ${recordingSeconds}/180 秒<br>真实模型已记录动作回放，非实时请求。请保持页面可见。</span><button id="stop-recording">取消录制 Esc</button>`;
  else if (replay) banner.innerHTML = `<span>${safe(replayLabel)} · ${replayIndex}/${replay.length}</span><button id="stop-replay">停止回放 Esc</button>`;
}
function showToast(text: string) {
  const toast = document.querySelector('#toast')!;
  toast.textContent = text; toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3500);
}
function submit(action: string, fromReplay = false) {
  if ((!fromReplay && modal) || ((replay || recordingAbort) && !fromReplay)) return;
  const result = game.step('human', { id: action });
  if (!result.accepted) { lastError = result.error ?? '该动作当前不可用'; showToast(lastError); return false; }
  const actionDirection = action.split(':')[1];
  if (DIRECTIONS.includes(actionDirection as Direction)) selectedDirection = actionDirection as Direction;
  actionTrace.push(action); observation = result.observation;
  observation.events.forEach(event => logs.push({ tick: observation.tick, text: event.text }));
  audio.play(observation); render();
  if (observation.outcome.terminal && !fromReplay) { modal = 'outcome'; renderModal(); renderControls(); }
  return true;
}
function stopReplay(message?: string) {
  if (replayTimer) clearTimeout(replayTimer);
  replay = null; replayTimer = null; replayLabel = '公共动作航迹回放'; render();
  if (message) showToast(message);
}
function openModal(kind: 'menu' | 'help' | 'outcome') {
  if (recordingAbort) { showToast('正在生成演示视频；可先取消录制再打开其他页面。'); return; }
  if (replay) stopReplay(`回放已停止：已打开${kind === 'help' ? '航行手册' : kind === 'menu' ? '任务菜单' : '结算'}。当前进度保留。`);
  modal = kind; renderModal(); renderControls();
}
function playRecordedActions(actions: string[], nextScenario: ScenarioId, nextSeed: number, label: string) {
  startGame(nextScenario, nextSeed); replay = [...actions]; replayIndex = 0; replayLabel = label;
  const advance = () => {
    if (!replay) return;
    if (replayIndex >= replay.length || observation.outcome.terminal) {
      stopReplay('已记录动作回放结束；这不是一次新的实时模型请求。');
      return;
    }
    const action = replay[replayIndex++];
    if (!submit(action, true)) { stopReplay('回放停止：记录中的动作与当前规则不兼容。'); return; }
    replayTimer = setTimeout(advance, 1100);
  };
  render(); advance();
}
async function loadModelDemo(): Promise<ModelDemo> {
  const response = await fetch('model-demo.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('真实模型演示记录尚不可用；没有使用替代或模拟数据。');
  const text = await response.text();
  if (text.length > 2_000_000) throw new Error('演示记录超出大小限制。');
  let value: ModelDemo;
  try { value = JSON.parse(text); } catch { throw new Error('真实模型演示记录尚不可用；没有使用替代或模拟数据。'); }
  const tokenParts = value as ModelDemo & { inputTokens?: number; outputTokens?: number };
  if (value && value.tokens === undefined && typeof tokenParts.inputTokens === 'number' && typeof tokenParts.outputTokens === 'number') value.tokens = tokenParts.inputTokens + tokenParts.outputTokens;
  if (!value || !['A', 'B', 'C'].includes(value.scenario) || !Number.isSafeInteger(value.seed) || !Array.isArray(value.actions) || value.actions.length === 0 || value.actions.length > 2000 || !value.actions.every(action => typeof action === 'string' && action.length < 80) || typeof value.model !== 'string' || value.model.length > 100 || !Number.isSafeInteger(value.calls) || value.calls < 1 || (typeof value.tokens !== 'number' && typeof value.tokens !== 'string') || typeof value.sourceLabel !== 'string' || value.sourceLabel.length > 240) throw new Error('模型演示记录格式不正确。');
  // Preflight with the real core, never by trusting a claimed successful outcome.
  const verifier = createGame(value.seed, value.scenario);
  for (const action of value.actions) if (!verifier.step('recorded-model', { id: action }).accepted) throw new Error('模型记录与当前规则不兼容，不能将它作为一致回放展示。');
  const actual = verifier.outcome();
  if (value.outcome) for (const key of ['terminal', 'reason', 'returned', 'success', 'score'] as const) {
    if (key in value.outcome && value.outcome[key] !== actual[key]) throw new Error('模型记录的结果与当前规则重放不同。');
  }
  return value;
}
async function playModelDemo() {
  if (loadingDemo) return;
  loadingDemo = true;
  showToast('正在加载并验证真实模型已记录的公开动作。');
  try {
    const demo = await loadModelDemo();
    playRecordedActions(demo.actions, demo.scenario, demo.seed, `真实模型已记录动作回放，非实时请求 · ${demo.model}`);
    showToast(`${demo.sourceLabel} · ${demo.calls} 次真实调用 · ${demo.tokens} tokens。现在只重放记录。`);
  } catch (error) { showToast(error instanceof Error ? error.message : '模型记录加载失败。'); }
  finally { loadingDemo = false; }
}
async function exportModelDemonstration() {
  if (loadingDemo || recordingAbort) return;
  if (!sea || !canRecordDemonstration()) { showToast('当前浏览器不支持 Canvas/MediaRecorder。仍可使用模型实测回放。'); return; }
  loadingDemo = true;
  showToast('正在验证真实模型轨迹。导出仅录制游戏合成画布，不捕获其他页面。');
  try {
    const demo = await loadModelDemo();
    stopReplay(); modal = null; renderModal();
    recordingSeconds = 0; recordingAbort = new AbortController();
    render();
    const result = await startDemonstrationRecording({
      sourceCanvas: sea.canvas, sourceLabel: demo.sourceLabel, model: demo.model,
      seed: demo.seed, scenario: demo.scenario, calls: demo.calls, tokens: demo.tokens,
      actions: demo.actions, getObservation: () => observation,
      reset: () => startGame(demo.scenario, demo.seed),
      applyAction: action => submit(action, true) === true,
      onProgress: seconds => { recordingSeconds = Math.min(180, Math.floor(seconds)); renderPlaybackBanner(); },
      signal: recordingAbort.signal,
    });
    const url = URL.createObjectURL(result.blob);
    const anchor = document.createElement('a'); anchor.href = url;
    anchor.download = `echo-fishery-${demo.model.replace(/[^a-z0-9._-]/gi, '-')}-recorded-demo-180s.${result.mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
    anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 60_000);
    showToast('3 分钟演示已生成并下载：真实模型已记录动作回放，非实时请求。');
  } catch (error) {
    showToast(error instanceof Error && error.name === 'AbortError' ? '录制已取消，没有导出未完成的视频。' : error instanceof Error ? error.message : '演示视频生成失败。');
  } finally { recordingAbort = null; loadingDemo = false; render(); }
}
function startGame(nextScenario: ScenarioId, nextSeed?: number) {
  stopReplay(); scenario = nextScenario; seed = nextSeed ?? (scenario === 'A' ? 101 : scenario === 'B' ? 202 : 303);
  game = createGame(seed, scenario); observation = game.observe('human'); actionTrace = []; logs = []; lastError = '';
  modal = null; selectedDirection = 'NE'; sea?.update(observation, true); render(); renderModal();
}
const tutorialPages = [
  { number: '01', title: '声音会改变这片海', subtitle: '找鱼，也在被听见。', body: '<p>声呐给你的是<strong>那一刻的回波</strong>，不是实时鱼群位置。虚线范围会随行动变得不确定；等待输入不会让它老化。</p><p>弱探测较安静，强探测更远、更响。鱼和水下危险都会回应声音。礁石挡住航路，<strong>不阻断声音</strong>。</p>', sketch: '<div class="tutorial-sonar"><i></i><i></i><span>◉</span><b>◌</b></div>' },
  { number: '02', title: '把声音留在别处', subtitle: '用位置与时机，创造捕捞窗口。', body: '<p>声标留在<strong>船当前位置</strong>。选择铃声或低鸣，立即启动或延迟两步，再驾船换位。不同声型的吸引效果不同，两者都会影响鱼与危险。</p><p>点击海面或八向罗盘选方向。缓行较安静，急行更快。下竿只覆盖选定方向的有限区域，<strong>空竿也消耗一步</strong>。</p>', sketch: '<div class="tutorial-plan"><span>◉<small>延迟声标</small></span><i>·········</i><b>↗<small>移动与下竿</small></b></div>' },
  { number: '03', title: '鱼快到手时，仍能止损', subtitle: '有时，切线才是带着收获回家的办法。', body: '<p>稳收慢而低噪；强收快，但张力与声音更高；放线降低张力，却让捕捞窗口流逝。<strong>当前显示的鱼行为会结算下一次收线。</strong></p><p>危险的红色冲撞通道会提前公开，下一次行动后结算。切线急避会<strong>放弃当前鱼并向所选方向移动</strong>。带着渔获回到港口后，还要主动“回港交付”。</p>', sketch: '<div class="tutorial-risk"><span>⋊</span><i>!</i><b>↗</b></div>' },
];
function renderModal() {
  const root = document.querySelector('#modal-root')!;
  if (!modal) { root.innerHTML = ''; return; }
  if (modal === 'menu') {
    root.innerHTML = `<div class="modal-backdrop menu-backdrop"><section class="harbor-menu" role="dialog" aria-modal="true" aria-label="选择夜航任务"><div class="menu-intro"><span class="micro-label">AN ORIGINAL ACOUSTIC STRATEGY GAME</span><h1>回声渔场<span>ECHO FISHERY</span></h1><p class="menu-poem">海面很安静。<br>你制造的每一道声音，<br>都会被什么听见。</p><p class="menu-description">用声呐寻找鱼群，用声标安排机会。<br>在鱼线绷紧之前，留下回家的路。</p><div class="menu-meta"><span>单人 · 指令推进</span><span>本地运行 · 无需账号</span></div></div><div class="mission-selection"><span class="micro-label">CHOOSE YOUR VOYAGE</span><h2>今夜，去哪里？</h2>${SCENARIOS.map((item, index) => `<button class="mission-card ${index === 0 ? 'recommended' : ''}" data-scenario="${item.id}"><span class="mission-card-id">${item.id}</span><div><h3>${safe(item.name)} ${index === 0 ? '<small>建议首次游玩</small>' : ''}</h3><p>${safe(item.subtitle)}</p><span>${item.budget} 步夜晚 <i>·</i> 带回 ${item.quota} 尾鱼</span></div><b>↗</b></button>`).join('')}<div class="menu-bottom"><button id="menu-help" class="text-button">初次出航？阅读航行手册 →</button>${observation.tick > 0 && observation.phase !== 'TERMINAL' ? '<button id="modal-close" class="text-button">继续本次航程</button>' : ''}</div></div></section><div class="menu-footnote">课程原创游戏原型 · 玩法参数尚待真实试玩验证</div></div>`;
    root.querySelector('.mission-selection')?.insertAdjacentHTML('beforeend', `<div class="model-demo-options"><span class="micro-label">RECORDED AGENT EVIDENCE</span><button id="model-demo" class="secondary-button">模型实测回放 →</button><button id="record-demo" class="secondary-button" ${canRecordDemonstration() ? '' : 'disabled title="当前浏览器不支持MediaRecorder"'}>导出 3 分钟演示 ↓</button><p>真实模型已记录动作，由同一规则内核自动重放。<strong>非实时请求，不产生新调用。</strong></p><small>视频为 1280×720 本地游戏合成画布；不录制其他页面，不含音轨。需保持页面可见约 3 分钟。</small></div>`);
  } else if (modal === 'help') {
    const page = tutorialPages[helpPage];
    root.innerHTML = `<div class="modal-backdrop"><section class="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title"><button class="close-button" id="modal-close" aria-label="关闭手册">×</button><span class="micro-label">FIELD GUIDE / 航行手册 ${page.number}</span>${page.sketch}<h2 id="help-title">${page.title}</h2><h3>${page.subtitle}</h3><div class="help-body">${page.body}</div><div class="help-navigation"><span>${tutorialPages.map((_, index) => `<button data-help-page="${index}" class="help-dot ${index === helpPage ? 'active' : ''}" aria-label="手册第${index + 1}页"></button>`).join('')}</span><button class="primary-button" id="help-next">${helpPage === 2 ? '明白了，出航 →' : '下一页 →'}</button></div><small class="help-keyboard">键盘：方向键 / W A S D 选四正向，7 / 9 / Z / C 选四斜向；1 / 2 / 3 操作；Q / E 探测；F 下竿；B 布标；X 切线；R 回港；空格静候。</small></section></div>`;
  } else {
    const outcome = observation.outcome;
    const title = outcome.success ? '灯塔看见你回来了' : outcome.returned ? '这一次，选择平安归航' : outcome.reason === 'sunk' ? '灯光消失在海面上' : '天亮了，航程结束';
    const subtitle = outcome.success ? '任务完成 · 渔获已交付' : outcome.returned ? '已返航 · 未达任务目标' : outcome.reason === 'sunk' ? '船体耗尽 · 舱内渔获未交付' : '行动预算耗尽 · 未完成交付';
    root.innerHTML = `<div class="modal-backdrop"><section class="outcome-modal" role="dialog" aria-modal="true" aria-label="航行结算"><span class="micro-label">VOYAGE REPORT / ${safe(observation.scenario.name)}</span><div class="outcome-symbol ${outcome.success ? 'success' : ''}">${outcome.returned ? '⌂' : '≈'}</div><h2>${title}</h2><p>${subtitle}</p><div class="result-stats"><div><strong>${outcome.score}</strong><span>交付得分</span></div><div><strong>${outcome.delivered.length}<small> / ${observation.scenario.quota}</small></strong><span>交付鱼数</span></div><div><strong>${observation.tick}</strong><span>已用步数</span></div></div><p class="outcome-cargo">${outcome.delivered.length ? outcome.delivered.map(fish => speciesNames[fish.species] ?? fish.species).join(' · ') : '没有渔获交付到港。'}</p><div class="outcome-buttons"><button id="restart" class="primary-button">再航一夜 →</button><button id="outcome-menu" class="secondary-button">选择其他任务</button><button id="export-trace" class="text-button">导出本局航迹 ↓</button><button id="modal-close" class="text-button">查看海图</button></div><small>结算由共享规则内核产生；画面与模型玩家使用同一套公开信息。</small></section></div>`;
  }
}

app.addEventListener('click', async event => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!target || target.disabled) return;
  if (recordingAbort && !['stop-recording', 'audio-toggle'].includes(target.id)) { showToast('录制中，其他操作已暂停。可取消录制。'); return; }
  if (target.dataset.direction) { selectDirection(target.dataset.direction as Direction); return; }
  if (target.dataset.action) { submit(target.dataset.action); return; }
  if (target.dataset.scenario) { startGame(target.dataset.scenario as ScenarioId); return; }
  if (target.dataset.helpPage) { helpPage = Number(target.dataset.helpPage); renderModal(); return; }
  switch (target.id) {
    case 'brand': case 'menu-open': case 'outcome-menu': openModal('menu'); break;
    case 'help-open': case 'menu-help': helpPage = 0; openModal('help'); break;
    case 'modal-close': modal = null; renderModal(); renderControls(); break;
    case 'help-next': if (helpPage < 2) helpPage++; else modal = null; renderModal(); renderControls(); break;
    case 'restart': startGame(scenario); break;
    case 'show-outcome': openModal('outcome'); break;
    case 'model-demo': await playModelDemo(); break;
    case 'record-demo': await exportModelDemonstration(); break;
    case 'stop-recording': recordingAbort?.abort(); break;
    case 'audio-toggle': { const enabled = await audio.toggle(); target.textContent = `声音 ${enabled ? '开' : '关'}`; target.setAttribute('aria-pressed', String(enabled)); break; }
    case 'stop-replay': stopReplay('回放已由你停止。当前进度保留。'); break;
    case 'export-trace': {
      const data = { schemaVersion: 1, kind: 'echo-fishery-public-action-trace', seed, scenario, actions: actionTrace, outcome: observation.outcome };
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = `echo-fishery-${scenario}-${seed}-public-trace.json`; anchor.click(); URL.revokeObjectURL(url); showToast('已导出公共动作航迹；不含隐藏世界状态。'); break;
    }
    case 'import-trace': (document.querySelector('#trace-file') as HTMLInputElement).click(); break;
  }
});
app.addEventListener('change', event => {
  const target = event.target as HTMLSelectElement;
  if (target.id === 'beacon-profile') { beaconProfile = target.value === 'drone' ? 'drone' : 'chime'; renderControls(); }
  if (target.id === 'beacon-delay') { beaconDelay = Number(target.value) === 0 ? 0 : 2; renderControls(); }
});
document.querySelector('#trace-file')!.addEventListener('change', async event => {
  const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
  try {
    if (file.size > 2_000_000) throw new Error('航迹文件过大');
    const value = JSON.parse(await file.text());
    if (value.kind !== 'echo-fishery-public-action-trace' || !['A', 'B', 'C'].includes(value.scenario) || !Number.isSafeInteger(value.seed) || !Array.isArray(value.actions) || value.actions.length > 2000 || !value.actions.every((a: unknown) => typeof a === 'string' && a.length < 80)) throw new Error('不支持的公共动作航迹格式');
    playRecordedActions(value.actions, value.scenario, value.seed, '公共动作航迹回放');
  } catch (error) { showToast(error instanceof Error ? error.message : '无法读取航迹'); }
  input.value = '';
});
document.addEventListener('keydown', event => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key.toLowerCase();
  if (recordingAbort) { if (event.key === 'Escape') recordingAbort.abort(); return; }
  if (event.key === 'Escape') { if (replay) stopReplay('回放已由你停止。当前进度保留。'); else { modal = null; renderModal(); renderControls(); } return; }
  if (key === '?') { helpPage = 0; openModal('help'); return; }
  if (modal || replay || event.repeat || observation.phase === 'TERMINAL') return;
  const directionKeys: Record<string, Direction> = { arrowup: 'N', arrowdown: 'S', arrowleft: 'W', arrowright: 'E', w: 'N', a: 'W', s: 'S', d: 'E', '7': 'NW', '8': 'N', '9': 'NE', '4': 'W', '6': 'E', z: 'SW', c: 'SE' };
  if (directionKeys[key]) { event.preventDefault(); selectDirection(directionKeys[key]); return; }
  let action = '';
  if (key === ' ') { event.preventDefault(); action = 'wait'; }
  else if (observation.fishing) action = ({ '1': 'reel:steady', '2': 'reel:strong', '3': 'reel:slack', x: `evade:${selectedDirection}` } as Record<string, string>)[key] ?? '';
  else action = ({ '1': `move:${selectedDirection}:quiet`, '2': `move:${selectedDirection}:rush`, q: 'ping:weak', e: 'ping:strong', f: `cast:${selectedDirection}`, b: `beacon:${beaconProfile}:${beaconDelay}`, r: 'return' } as Record<string, string>)[key] ?? '';
  if (action) submit(action);
});
render(); renderModal();
