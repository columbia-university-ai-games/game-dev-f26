import type { PublicObservation } from '../core/types.ts';

export interface RecordingOptions {
  sourceCanvas: HTMLCanvasElement;
  sourceLabel: string;
  model: string;
  seed: number;
  scenario: string;
  calls: number;
  tokens: number | string;
  actions: string[];
  getObservation: () => PublicObservation;
  reset: () => void;
  applyAction: (action: string, index: number) => boolean;
  onProgress?: (seconds: number) => void;
  signal?: AbortSignal;
}

export interface RecordingResult { blob: Blob; mimeType: string; durationSeconds: number }

const DURATION = 180, PLAY_START = 20, PLAY_END = 150;
const MIME_TYPES = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
const C = { background: '#071b29', panel: '#102c3c', line: '#294957', text: '#edf3ed', muted: '#a7bfca', amber: '#f0bd70', teal: '#6cddd1', danger: '#f49783' };
const FONT = '"Microsoft YaHei", "PingFang SC", system-ui, sans-serif';
const species: Record<string, string> = { 'silver-bell': '银铃鱼', reefback: '礁背鱼', glassfin: '玻璃鳍鱼' };

/** Local canvas capture only. This never requests screen access or calls a model. */
export function canRecordDemonstration(): boolean {
  return typeof document !== 'undefined' && typeof HTMLCanvasElement !== 'undefined'
    && typeof HTMLCanvasElement.prototype.captureStream === 'function'
    && typeof MediaRecorder !== 'undefined';
}

function actionCaption(action: string): string {
  const parts = action.split(':');
  const direction: Record<string, string> = { N: '北', NE: '东北', E: '东', SE: '东南', S: '南', SW: '西南', W: '西', NW: '西北' };
  if (parts[0] === 'move') return `向${direction[parts[1]] ?? parts[1]}${parts[2] === 'rush' ? '急行' : '缓行'}`;
  if (parts[0] === 'cast') return `向${direction[parts[1]] ?? parts[1]}下竿`;
  if (parts[0] === 'evade') return `切线，向${direction[parts[1]] ?? parts[1]}急避`;
  if (parts[0] === 'beacon') return `${parts[1] === 'chime' ? '铃声' : '低鸣'}声标 · ${parts[2] === '0' ? '立即' : `延迟 ${parts[2]} 步`}`;
  const captions: Record<string, string> = { 'ping:weak': '弱探测', 'ping:strong': '强探测', 'reel:steady': '稳收', 'reel:strong': '强收', 'reel:slack': '放线', wait: '静候一步', return: '回港交付' };
  return captions[action] ?? action;
}

/** Replays caller-supplied recorded actions through the real public interface. */
export async function startDemonstrationRecording(options: RecordingOptions): Promise<RecordingResult> {
  // Validate the mutation callbacks before resetting or allocating capture resources.
  if (!options || typeof options.reset !== 'function' || typeof options.applyAction !== 'function') throw new Error('录制需要真实的 reset 和 applyAction 回调。');
  if (typeof options.getObservation !== 'function') throw new Error('录制需要公开观察回调。');
  if (!Array.isArray(options.actions) || options.actions.length > 2000 || options.actions.some(action => typeof action !== 'string')) throw new Error('录制动作必须是最多 2000 条的字符串数组。');
  if (options.signal?.aborted) throw new DOMException('录制已取消。', 'AbortError');
  if (!canRecordDemonstration()) throw new Error('当前浏览器不支持本地 Canvas 视频录制。');
  if (!(options.sourceCanvas instanceof HTMLCanvasElement) || !options.sourceCanvas.width || !options.sourceCanvas.height) throw new Error('录制需要已经渲染的海面画布。');

  const actions = [...options.actions];
  const canvas = document.createElement('canvas');
  canvas.width = 1280; canvas.height = 720;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('无法创建录制合成画布。');
  const ctx = context;
  let observation: PublicObservation;
  options.reset();
  observation = options.getObservation();

  function text(value: string, x: number, y: number, size = 18, color = C.text, weight = 400, width?: number) {
    ctx.fillStyle = color; ctx.font = `${weight} ${size}px ${FONT}`; ctx.textBaseline = 'top';
    if (width === undefined) ctx.fillText(value, x, y); else ctx.fillText(value, x, y, width);
  }
  function wrap(value: string, x: number, y: number, width: number, size = 18, color = C.text, maxLines = 3): number {
    ctx.font = `400 ${size}px ${FONT}`;
    const lines: string[] = []; let line = '';
    for (const char of value) {
      if (char === '\n' || (line && ctx.measureText(line + char).width > width)) { lines.push(line); line = char === '\n' ? '' : char; }
      else line += char;
    }
    if (line) lines.push(line);
    lines.slice(0, maxLines).forEach((row, index) => text(index === maxLines - 1 && lines.length > maxLines ? `${row.slice(0, -1)}…` : row, x, y + index * (size + 7), size, color));
    return Math.min(lines.length, maxLines) * (size + 7);
  }
  function panel(x: number, y: number, w: number, h: number) {
    ctx.fillStyle = C.panel; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
  }
  function bar(label: string, value: number, x: number, y: number, color: string) {
    text(`${label} ${value}/100`, x, y, 16, C.muted);
    ctx.fillStyle = C.background; ctx.fillRect(x, y + 24, 264, 6);
    ctx.fillStyle = color; ctx.fillRect(x, y + 24, Math.max(0, Math.min(100, value)) * 2.64, 6);
  }
  function publicStatus() {
    const o = observation, boat = o.boat;
    let y = 126;
    text('PUBLIC OBSERVATION / 公开状态', 958, y, 14, C.teal, 600); y += 31;
    text(`第 ${o.tick} 步  ·  剩余 ${o.remaining} 步`, 958, y, 20, C.text, 600); y += 35;
    text(`船体 ${boat.hull}/${boat.maxHull}    声标 ${boat.beaconsLeft}`, 958, y, 18, boat.hull < boat.maxHull ? C.danger : C.muted); y += 29;
    text(`舱内 ${boat.cargo.length} 尾 / 目标 ${o.scenario.quota} 尾`, 958, y, 18, C.amber); y += 29;
    text(`船位 ${boat.position.x.toFixed(1)}, ${boat.position.y.toFixed(1)}`, 958, y, 16, C.muted); y += 31;
    if (o.fishing) {
      const cue = { tired: '疲惫', pulling: '拉扯', burst: '冲刺' }[o.fishing.cue];
      text(`${species[o.fishing.species] ?? o.fishing.species} · ${cue}`, 958, y, 18, C.amber, 600); y += 28;
      bar('收线', o.fishing.progress, 958, y, C.teal); y += 40;
      bar('张力', o.fishing.tension, 958, y, C.amber); y += 44;
    }
    if (o.threat) {
      text('已预告的冲撞通道', 958, y, 18, C.danger, 600); y += 26;
      y += wrap(`${o.threat.resolvesIn} 步后结算 · 半宽 ${o.threat.width}；沿海面公开通道判断避让。`, 958, y, 278, 16, C.danger, 2); y += 8;
    } else if (o.warning) {
      y += wrap(`${o.warning.bearing} 向异常 · ${o.warning.urgency === 'near' ? '接近' : '远处'}`, 958, y, 278, 17, C.danger, 1); y += 8;
    }
    if (y < 474) {
      text(`历史回波 ${o.contacts.length} · 不代表当前位置`, 958, y, 16, C.teal); y += 25;
      for (const contact of o.contacts.slice(-2)) {
        if (y > 510) break;
        const name = contact.hint === 'large-anomaly' ? '大型异常' : contact.species ? species[contact.species] : '鱼群';
        y += wrap(`${name} · ${o.tick - contact.tick} 步前 · 不确定半径 ${contact.uncertainty}`, 958, y, 278, 15, C.muted, 2); y += 5;
      }
    }
    const beacon = o.beacons.at(-1);
    const beaconText = beacon ? `${o.beacons.length} 枚声标 · ${beacon.profile === 'chime' ? '铃声' : '低鸣'} · ${beacon.active ? `余 ${beacon.life} 步` : `${beacon.startsIn} 步后启动`}` : '尚无已部署声标';
    text(beaconText, 958, 546, 15, C.amber, 400, 278);
    text('仅公开观察，无隐藏实体位置', 958, 572, 14, C.muted);
  }
  let actionIndex = 0, lastAction = '等待回放开始';
  function draw(seconds: number) {
    ctx.fillStyle = C.background; ctx.fillRect(0, 0, 1280, 720);
    text('回声渔场', 24, 18, 31, C.text, 700);
    text('ECHO FISHERY · MIDTERM DEMONSTRATION', 196, 26, 15, C.teal, 600);
    text('真实模型已记录动作回放，非实时请求', 24, 62, 20, C.amber, 600);
    text(`${Math.min(180, Math.floor(seconds)).toString().padStart(3, '0')} / 180 s`, 1100, 27, 19, C.muted);
    panel(20, 110, 910, 490); panel(944, 110, 316, 490);
    // Contain the complete source canvas; no legal portion of the sea is cropped.
    const scale = Math.min(906 / options.sourceCanvas.width, 486 / options.sourceCanvas.height);
    const width = options.sourceCanvas.width * scale, height = options.sourceCanvas.height * scale;
    ctx.drawImage(options.sourceCanvas, 22 + (906 - width) / 2, 112 + (486 - height) / 2, width, height);
    publicStatus();
    if (seconds < PLAY_START) {
      ctx.fillStyle = 'rgba(7, 27, 41, .93)'; ctx.fillRect(52, 150, 846, 404);
      text('用声音布置机会，也承担被听见的风险', 80, 180, 28, C.amber, 600, 786);
      wrap('探测留下的是历史回波；声音同时影响鱼群和水下危险。', 80, 239, 782, 23, C.text, 2);
      wrap('声标创造作业窗口。捕鱼挣扎会产生新声音，稳收与强收在时间、张力和暴露之间取舍。', 80, 310, 782, 23, C.text, 2);
      wrap('攻击通道提前公开；切线急避会放弃当前鱼。渔获必须回港交付。', 80, 400, 782, 23, C.text, 2);
      text('人类界面与模型玩家调用同一规则内核 · 每个有效动作推进一步', 80, 497, 18, C.teal);
    } else if (seconds >= PLAY_END || observation.outcome.terminal) {
      const outcome = observation.outcome;
      ctx.fillStyle = 'rgba(7, 27, 41, .94)'; ctx.fillRect(52, 158, 846, 388);
      const reason = { returned: '已回港交付', sunk: '船体损毁', night_expired: '夜晚耗尽', runner_limit: '运行器限制' };
      text(outcome.terminal ? (outcome.success ? '本次记录：完成任务' : '本次记录：任务未完成') : '本次动作记录已回放完毕', 80, 188, 30, outcome.success ? C.teal : C.amber, 600);
      text(outcome.reason ? reason[outcome.reason] : '当前记录未达到终局', 80, 241, 22, C.text);
      text(`实际得分 ${outcome.score}  ·  已交付 ${outcome.delivered.length} 尾  ·  舱内 ${observation.boat.cargo.length} 尾`, 80, 283, 23, C.amber);
      text(`回放动作 ${actionIndex}/${actions.length}  ·  世界步数 ${observation.tick}`, 80, 328, 21, C.muted);
      wrap('局限：本片仅展示一条已记录轨迹；回放不产生新模型请求，不能代替完整评测、独立审查或同学试玩。', 80, 385, 782, 21, C.muted, 3);
      text('所有结算取自共享规则内核的实际公开结果', 80, 501, 18, C.teal);
    }
    const event = observation.events.at(-1);
    text(seconds < PLAY_START ? `任务 ${options.scenario} · ${observation.scenario.name}` : `动作 ${actionIndex}/${actions.length} · ${lastAction}`, 24, 615, 23, C.text, 600, 1228);
    text(event?.text ?? '世界时间只随有效动作推进；动画与模型等待不推进规则。', 24, 651, 17, C.muted, 1230);
    text(`来源 ${options.sourceLabel} · 模型 ${options.model} · seed ${options.seed} · calls ${options.calls} · tokens ${options.tokens}`, 24, 687, 14, C.teal, 400, 1230);
  }

  draw(0);
  const stream = canvas.captureStream(24);
  let recorder: MediaRecorder;
  try {
    const mimeType = MIME_TYPES.find(type => MediaRecorder.isTypeSupported(type));
    recorder = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), videoBitsPerSecond: 4_000_000 });
  } catch (error) { stream.getTracks().forEach(track => track.stop()); throw error; }

  return new Promise<RecordingResult>((resolve, reject) => {
    const chunks: Blob[] = [];
    let raf = 0, stopTimer: ReturnType<typeof setTimeout> | undefined;
    let settled = false, stopping = false, progressSecond = -1, startedAt = 0;
    const cleanup = () => {
      cancelAnimationFrame(raf);
      if (stopTimer !== undefined) clearTimeout(stopTimer);
      options.signal?.removeEventListener('abort', abort);
      document.removeEventListener('visibilitychange', visibilityChanged);
      recorder.ondataavailable = null; recorder.onerror = null; recorder.onstop = null;
      stream.getTracks().forEach(track => track.stop());
    };
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      if (recorder.state !== 'inactive') { try { recorder.stop(); } catch { /* Resource cleanup still follows. */ } }
      cleanup(); reject(error);
    };
    const abort = () => fail(new DOMException('录制已取消。', 'AbortError'));
    const visibilityChanged = () => { if (document.hidden) fail(new Error('页面进入后台，录制已取消。请保持游戏页面可见后重新导出。')); };
    const update = (seconds: number) => {
      while (actionIndex < actions.length && !observation.outcome.terminal && seconds >= PLAY_START + actionIndex / Math.max(1, actions.length) * (PLAY_END - PLAY_START)) {
        const action = actions[actionIndex];
        if (!options.applyAction(action, actionIndex)) throw new Error(`回放动作 ${actionIndex + 1} 被共享规则拒绝：${action}`);
        lastAction = `${actionCaption(action)}  [${action}]`;
        actionIndex++;
        observation = options.getObservation();
      }
      draw(seconds);
      const second = Math.min(DURATION, Math.floor(seconds));
      if (second !== progressSecond) { progressSecond = second; options.onProgress?.(second); }
    };
    const frame = (now: number) => {
      if (settled || stopping) return;
      try { update(Math.min(DURATION, (now - startedAt) / 1000)); }
      catch (error) { fail(error); return; }
      if (settled) return;
      raf = requestAnimationFrame(frame);
    };
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    recorder.onerror = () => fail(new Error('浏览器视频编码失败，请重新录制。'));
    recorder.onstop = () => {
      if (settled) return;
      settled = true;
      const mimeType = recorder.mimeType || chunks[0]?.type || 'video/webm';
      const blob = new Blob(chunks, { type: mimeType });
      cleanup();
      if (!blob.size) reject(new Error('浏览器没有生成有效视频数据。'));
      else resolve({ blob, mimeType, durationSeconds: DURATION });
    };
    options.signal?.addEventListener('abort', abort, { once: true });
    document.addEventListener('visibilitychange', visibilityChanged);
    if (options.signal?.aborted) { abort(); return; }
    try {
      recorder.start(1000); startedAt = performance.now();
      raf = requestAnimationFrame(frame);
      stopTimer = setTimeout(() => {
        if (settled) return;
        try { update(DURATION); stopping = true; cancelAnimationFrame(raf); recorder.stop(); }
        catch (error) { fail(error); }
      }, DURATION * 1000);
    } catch (error) { fail(error); }
  });
}
