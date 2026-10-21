"use strict";
const $ = (id) => document.getElementById(id);
const fragment = new URLSearchParams(location.hash.slice(1));
let token = fragment.get("access") || sessionStorage.getItem("catacomb-access") || "";
if (fragment.has("access")) history.replaceState(null, "", location.pathname);
if (token) sessionStorage.setItem("catacomb-access", token);
let session = null, sequence = 0, running = false, busy = false, connected = false;
let keyboardEnabled = false, terminal = false, timer = null, renderVersion = 0;
const held = new Set(), touched = new Set(), items = [];
const pendingInputs = [];
let lastSentInput = {direction: "none", fire: false, strafe: false};
let debugMode = false, lastStartOptions = {}, starting = false;
const labels = {running: "Playing", dead: "Player died", cleared: "Level cleared", truncated: "Tick limit reached", stopped: "Session ended"};

async function api(path, data, timeout = 20000) {
  const started = performance.now();
  const response = await fetch(path, {
    method: data === undefined ? "GET" : "POST",
    headers: {Authorization: "Bearer " + token, ...(data === undefined ? {} : {"Content-Type": "application/json"})},
    body: data === undefined ? undefined : JSON.stringify(data),
    cache: "no-store", signal: AbortSignal.timeout(timeout)
  });
  const result = await response.json();
  if (!response.ok) { const error = new Error(result.error || "Connection failed"); error.status = response.status; throw error; }
  $("latency").textContent = Math.round(performance.now() - started) + " ms";
  return result;
}

function setConnection(text, active) {
  $("connection-status").textContent = text;
  $("connection-dot").classList.toggle("active", active);
}

function draw(snapshot) {
  sequence = snapshot.sequence;
  terminal = snapshot.status !== "running";
  const version = ++renderVersion;
  const img = new Image();
  img.onload = () => {
    if (version !== renderVersion) return;
    $("game-frame").src = img.src;
    $("game-frame").hidden = false;
    $("screen-grid").hidden = true;
  };
  img.src = "data:image/png;base64," + snapshot.png;
  $("tick-count").textContent = snapshot.ticks.toLocaleString() + " ticks";
  $("game-status").textContent = terminal ? labels[snapshot.status] : (running ? "Playing" : "Paused");
  if (terminal) {
    pause();
    $("game-status").textContent = labels[snapshot.status];
    $("paused-label").hidden = true;
    $("notice").textContent = snapshot.status === "cleared" ? "You cleared this level. Restart to play again." : "This session has ended. Click Restart to begin a new game.";
  }
  $("pause-button").disabled = terminal;
}

function clearInputs() {
  held.clear(); touched.clear(); items.length = 0;
  pendingInputs.length = 0;
  lastSentInput = {direction: "none", fire: false, strafe: false};
  document.querySelectorAll(".held").forEach((el) => el.classList.remove("held"));
}

function pause() {
  running = false;
  clearTimeout(timer);
  clearInputs();
  $("game-dot").classList.remove("active");
  $("pause-button").textContent = "Resume";
  if (session && !terminal) {
    $("game-status").textContent = "Paused";
    $("paused-label").hidden = false;
  }
}

function resume() {
  if (!session || terminal || busy || document.hidden) return;
  keyboardEnabled = true;
  running = true;
  $("paused-label").hidden = true;
  $("game-status").textContent = "Playing";
  $("game-dot").classList.add("active");
  $("pause-button").textContent = "Pause";
  $("notice").textContent = "Arrows / WASD to move · Hold J to charge, release to fire · Esc to pause";
  $("screen").focus({preventScroll: true});
  pump();
}

function direction() {
  const north = held.has("ArrowUp") || held.has("KeyW") || [...touched].some((x) => x.includes("north"));
  const south = held.has("ArrowDown") || held.has("KeyS") || [...touched].some((x) => x.includes("south"));
  const east = held.has("ArrowRight") || held.has("KeyD") || [...touched].some((x) => x.includes("east"));
  const west = held.has("ArrowLeft") || held.has("KeyA") || [...touched].some((x) => x.includes("west"));
  return ((north && !south ? "north" : south && !north ? "south" : "") + (east && !west ? "east" : west && !east ? "west" : "")) || "none";
}

function controlState() {
  return {direction: direction(),
    fire: held.has("KeyJ") || held.has("ControlLeft") || held.has("ControlRight") || touched.has("fire"),
    strafe: held.has("ShiftLeft") || held.has("ShiftRight") || touched.has("strafe")};
}

function queueControls() {
  if (!running) return;
  const next = controlState();
  const previous = pendingInputs.at(-1) || lastSentInput;
  if (next.direction !== previous.direction || next.fire !== previous.fire || next.strafe !== previous.strafe) {
    // Preserve short presses AND releases while a network request is pending.
    // In particular, two quick fire taps must not become one held charge.
    if (pendingInputs.length >= 32) {
      pause();
      $("notice").textContent = "Too many queued inputs. The game is paused and the queue is cleared. Click Resume when the connection recovers.";
      return;
    }
    pendingInputs.push(next);
  }
  if (!busy) {
    clearTimeout(timer);
    timer = setTimeout(pump, 0);
  }
}

async function pump() {
  if (!running || busy || !session) return;
  clearTimeout(timer);
  busy = true;
  const started = performance.now();
  const item = items.shift();
  lastSentInput = pendingInputs.shift() || controlState();
  const action = {...lastSentInput,
    potion: item === "potion", bolt: item === "bolt", nuke: item === "nuke",
    ticks: debugMode ? Math.max(1, Math.min(32, Number($("debug-ticks").value) || 4)) : 4};
  try {
    draw(await api("/api/action", {session, sequence: sequence + 1, action}));
    setConnection("Connected · No audio", true);
  } catch (error) {
    pause();
    setConnection("Disconnected · Paused", false);
    $("notice").textContent = "Connection lost. The game is paused while we check the last action…";
    // A lost HTTP response may still have applied its action. Read before resuming.
    try {
      draw(await api("/api/observation?session=" + encodeURIComponent(session)));
      $("notice").textContent = "Game state recovered. Click Resume to continue.";
      setConnection("Connected · No audio", true);
    } catch (_) {
      $("pause-button").disabled = true;
      $("notice").textContent = "The connection is unavailable or the session has expired. Check that Windows is online, then click Restart.";
    }
  } finally {
    busy = false;
    if (running) timer = setTimeout(pump, pendingInputs.length ? 0 : Math.max(0, 80 - (performance.now() - started)));
  }
}

async function start(options = {}) {
  if (!connected || starting) return;
  starting = true;
  pause();
  $("start-button").disabled = true;
  $("restart-button").disabled = true;
  $("notice").textContent = "Loading native level " + (options.level || 1) + "…";
  // Finish an in-flight request before disposing of its process.
  while (busy) await new Promise((resolve) => setTimeout(resolve, 25));
  busy = true;
  let started = false;
  try {
    if (session) await api("/api/close", {session});
    session = null;
    const snapshot = await api("/api/start", options);
    session = snapshot.session;
    debugMode = options.debug === true;
    lastStartOptions = {...options};
    $("level-heading").textContent = "1991 / LEVEL " + String(options.level || 1).padStart(2, "0") + (debugMode ? " / DEBUG" : "");
    $("play-mode-footer").textContent = debugMode ? "Debug mode · Not for evaluation" : "Normal mode · Original rules";
    draw(snapshot);
    $("overlay").hidden = true;
    $("restart-button").disabled = false;
    $("pause-button").disabled = false;
    started = true;
  } catch (error) {
    $("notice").textContent = "Unable to start: " + error.message;
    $("restart-button").disabled = false;
  } finally { busy = false; starting = false; $("start-button").disabled = false; }
  // resume() starts its own async request; do not clear that request's busy flag.
  if (started) {
    if (debugMode) pause(); else resume();
    window.dispatchEvent(new CustomEvent("catacomb-session", {detail: {debug: debugMode}}));
  }
}

async function connect() {
  if (!token) {
    setConnection("Access key required", false);
    $("access-form").hidden = false;
    $("start-button").hidden = true;
    $("overlay-copy").textContent = "Open the full link containing your access key, or enter the key below.";
    return;
  }
  try {
    const info = await api("/api/info");
    $("debug-button").hidden = !info.debug_tools;
    connected = true;
    sessionStorage.setItem("catacomb-access", token);
    setConnection("Connected · No audio", true);
    $("access-form").hidden = true;
    $("start-button").hidden = false;
    $("start-button").disabled = false;
    $("overlay-copy").textContent = "The native game is ready. Start your first level here.";
  } catch (error) {
    connected = false;
    $("access-form").hidden = false;
    $("start-button").hidden = true;
    $("overlay-copy").textContent = error.status === 401 ? "Invalid access key. Use the full link from the current server launch." : "Unable to connect. Check that the game server is running on Windows.";
    setConnection("Not connected", false);
  }
}

$("access-form").addEventListener("submit", (event) => { event.preventDefault(); token = $("access-key").value.trim(); connect(); });
$("start-button").addEventListener("click", () => start());
$("restart-button").addEventListener("click", () => { if (confirm("Restart? This will end your current game.")) start(lastStartOptions); });
$("pause-button").addEventListener("click", () => running ? pause() : resume());
$("screen").addEventListener("pointerdown", () => { keyboardEnabled = true; });
$("fullscreen-button").addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $("screen").requestFullscreen();
  } catch (_) { $("notice").textContent = "Fullscreen is unavailable in this browser. Try browser zoom instead."; }
});

const keyCodes = new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","KeyW","KeyA","KeyS","KeyD","KeyJ","ControlLeft","ControlRight","ShiftLeft","ShiftRight","KeyP","KeyB","KeyN","Escape"]);
document.addEventListener("keydown", (event) => {
  if (!keyboardEnabled || !session || !keyCodes.has(event.code) || event.target.matches("input,textarea,select")) return;
  if (event.metaKey) return;
  event.preventDefault();
  if (event.code === "Escape") { if (!event.repeat) running ? pause() : resume(); return; }
  if (!running) return;
  const firstPress = !held.has(event.code);
  held.add(event.code);
  const item = {KeyP: "potion", KeyB: "bolt", KeyN: "nuke"}[event.code];
  if (item && !event.repeat && items.length < 4) items.push(item);
  if (firstPress) queueControls();
});
document.addEventListener("keyup", (event) => { if (held.delete(event.code)) queueControls(); });
window.addEventListener("blur", pause);
document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
window.addEventListener("pagehide", () => {
  pause();
  if (session) fetch("/api/close", {method: "POST", headers: {Authorization: "Bearer " + token, "Content-Type": "application/json"}, body: JSON.stringify({session}), keepalive: true}).catch(() => {});
});
document.querySelectorAll("[data-hold]").forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (!running) return;
    button.setPointerCapture(event.pointerId);
    touched.add(button.dataset.hold);
    button.classList.add("held");
    queueControls();
  });
  const release = () => {
    const changed = touched.delete(button.dataset.hold);
    button.classList.remove("held");
    if (changed) queueControls();
  };
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
});
document.querySelectorAll("[data-item]").forEach((button) => button.addEventListener("click", () => {
  if (running && items.length < 4) { items.push(button.dataset.item); queueControls(); }
}));
connect();
