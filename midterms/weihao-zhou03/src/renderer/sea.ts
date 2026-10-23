import * as THREE from 'three';
import type { Direction, PublicObservation, Vec2 } from '../core/types.ts';

const SEA = 0x0a2637, TEAL = 0x6cddd1, AMBER = 0xf0bd70, CORAL = 0xf47767;
const dirAngle: Record<Direction, number> = { N: Math.PI, NE: Math.PI * .75, E: Math.PI / 2, SE: Math.PI / 4, S: 0, SW: -Math.PI / 4, W: -Math.PI / 2, NW: -Math.PI * .75 };
const directions: Direction[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function line(points: THREE.Vector3[], color: number, opacity = 1, dashed = false): THREE.Line {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = dashed ? new THREE.LineDashedMaterial({ color, transparent: true, opacity, dashSize: .55, gapSize: .4 }) : new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  const value = new THREE.Line(geometry, material);
  if (dashed) value.computeLineDistances();
  return value;
}
function ring(radius: number, color: number, opacity: number, dashed = false) {
  return line(Array.from({ length: 97 }, (_, i) => new THREE.Vector3(Math.cos(i / 96 * Math.PI * 2) * radius, .16, Math.sin(i / 96 * Math.PI * 2) * radius)), color, opacity, dashed);
}
function planeShape(vertices: Vec2[], color: number, opacity: number) {
  const shape = new THREE.Shape(vertices.map(p => new THREE.Vector2(p.x, -p.y)));
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }));
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}
function disposeGroup(group: THREE.Group) {
  group.traverse(object => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
      object.geometry.dispose();
      if (Array.isArray(object.material)) object.material.forEach(m => m.dispose());
      else object.material.dispose();
    }
  });
  group.clear();
}

/** Receives public observations only; there is no engine/world reference here. */
export class SeaView {
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-65, 65, 46, -46, .1, 400);
  private renderer: THREE.WebGLRenderer;
  private terrain = new THREE.Group();
  private contacts = new THREE.Group();
  private markers = new THREE.Group();
  private selection = new THREE.Group();
  private pulses: { ring: THREE.Line; started: number; max: number }[] = [];
  private boat = new THREE.Group();
  private boatTarget = new THREE.Vector3();
  private boatAngle = 0;
  private fishingLine: THREE.Line | null = null;
  private water: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private labelHost: HTMLDivElement;
  private labels: { element: HTMLSpanElement; at: THREE.Vector3 }[] = [];
  private observation: PublicObservation | null = null;
  private mapKey = '';
  private lastTick = -1;
  private selected: Direction = 'N';
  private resizeObserver: ResizeObserver;
  private animationId = 0;
  private raycaster = new THREE.Raycaster();
  private onSelect: (direction: Direction) => void;
  private pendingPointer: { x: number; y: number } | null = null;

  constructor(private host: HTMLElement, onSelect: (direction: Direction) => void) {
    this.onSelect = onSelect;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setClearColor(SEA);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.setAttribute('aria-label', '夜海地图。点击海面选择方向，再使用下方动作按钮。');
    this.renderer.domElement.setAttribute('role', 'img');
    host.append(this.renderer.domElement);
    this.labelHost = document.createElement('div'); this.labelHost.className = 'world-labels'; host.append(this.labelHost);
    this.scene.fog = new THREE.Fog(SEA, 125, 230);
    this.scene.add(new THREE.HemisphereLight(0xa7dce5, 0x122736, 2.1));
    const moon = new THREE.DirectionalLight(0xc8e7f1, 2.5); moon.position.set(-40, 60, -20); this.scene.add(moon);
    const warm = new THREE.DirectionalLight(0xf0bd70, .35); warm.position.set(-25, 20, 60); this.scene.add(warm);
    this.camera.position.set(50, 95, 112); this.camera.lookAt(50, 0, 35);
    this.water = new THREE.Mesh(new THREE.PlaneGeometry(240, 200, 1, 1), new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uBase: { value: new THREE.Color(SEA) } },
      vertexShader: `varying vec3 vPos; void main(){vPos=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `uniform float uTime; uniform vec3 uBase; varying vec3 vPos;
        void main(){
          vec2 p=vPos.xy;
          float broad=.5+.5*sin(p.x*.045+sin(p.y*.06)+uTime*.08);
          float ripple=pow(max(0.,sin(p.x*.24+p.y*.62+uTime*.25)),16.);
          float broken=.5+.5*sin(p.x*.31-p.y*.23-uTime*.17);
          float shimmer=ripple*pow(broken,6.);
          vec3 col=uBase*(.85+broad*.25)+vec3(.001,.003,.004)*shimmer;
          gl_FragColor=vec4(col,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }));
    this.water.rotation.x = -Math.PI / 2; this.water.position.set(50, -.03, 35); this.scene.add(this.water);
    this.scene.add(this.terrain, this.contacts, this.markers, this.selection);
    this.createBoat(); this.scene.add(this.boat);
    this.resizeObserver = new ResizeObserver(() => this.resize()); this.resizeObserver.observe(host); this.resize();
    this.renderer.domElement.addEventListener('pointerdown', event => {
      this.pendingPointer = { x: event.clientX, y: event.clientY };
    });
    this.renderer.domElement.addEventListener('pointerup', event => {
      if (!this.observation || !this.pendingPointer || Math.hypot(event.clientX - this.pendingPointer.x, event.clientY - this.pendingPointer.y) > 12) return;
      const bounds = this.renderer.domElement.getBoundingClientRect();
      this.raycaster.setFromCamera(new THREE.Vector2((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1), this.camera);
      const point = this.raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), new THREE.Vector3());
      if (point) {
        const dx = point.x - this.observation.boat.position.x, dy = point.z - this.observation.boat.position.y;
        if (Math.hypot(dx, dy) < 1) return;
        const index = ((Math.round(Math.atan2(dx, -dy) / (Math.PI / 4)) % 8) + 8) % 8;
        this.onSelect(directions[index]);
      }
      this.pendingPointer = null;
    });
    this.animate(0);
  }
  private createBoat() {
    const hullShape = new THREE.Shape([new THREE.Vector2(-1.05, -1.9), new THREE.Vector2(1.05, -1.9), new THREE.Vector2(1.25, .85), new THREE.Vector2(0, 2.65), new THREE.Vector2(-1.25, .85)]);
    const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(hullShape, { depth: .8, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: .15, bevelThickness: .13 }), new THREE.MeshStandardMaterial({ color: 0xc58c4c, roughness: .85, flatShading: true }));
    hull.rotation.x = Math.PI / 2; hull.position.y = 1; this.boat.add(hull);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.8, .18, 3.25), new THREE.MeshStandardMaterial({ color: 0xd2b68b, roughness: 1 })); deck.position.set(0, 1.08, -.1); this.boat.add(deck);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.1, 1.35), new THREE.MeshStandardMaterial({ color: 0xddd7be, roughness: .9 })); cabin.position.set(0, 1.7, -.45); this.boat.add(cabin);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.6, .18, 1.65), new THREE.MeshStandardMaterial({ color: 0x22484e })); roof.position.set(0, 2.33, -.45); this.boat.add(roof);
    const window = new THREE.Mesh(new THREE.BoxGeometry(1.37, .5, .045), new THREE.MeshBasicMaterial({ color: AMBER })); window.position.set(0, 1.85, .255); this.boat.add(window);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(.2, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffdb91 })); lamp.position.set(0, 2.62, -.45); this.boat.add(lamp);
    const light = new THREE.PointLight(AMBER, 16, 13, 1.6); light.position.copy(lamp.position); this.boat.add(light);
    const glow = new THREE.Mesh(new THREE.CircleGeometry(4.6, 40), new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: .07, depthWrite: false })); glow.rotation.x = -Math.PI / 2; glow.position.y = .1; this.boat.add(glow);
    const wake = line([new THREE.Vector3(-.7, .06, -2), new THREE.Vector3(-1.5, .06, -5), new THREE.Vector3(-2.5, .06, -7)], 0x9fbabb, .25);
    this.boat.add(wake); const wake2 = wake.clone(); wake2.scale.x = -1; this.boat.add(wake2);
  }
  private resize() {
    const width = this.host.clientWidth, height = this.host.clientHeight;
    if (!width || !height) return;
    this.renderer.setSize(width, height);
    const aspect = width / height;
    const halfWidth = Math.max(58, 33 * aspect), halfHeight = halfWidth / aspect;
    this.camera.left = -halfWidth; this.camera.right = halfWidth; this.camera.top = halfHeight; this.camera.bottom = -halfHeight;
    this.camera.updateProjectionMatrix();
  }
  private addLabel(text: string, at: Vec2, className = '') {
    const element = document.createElement('span'); element.className = `map-label ${className}`; element.textContent = text; this.labelHost.append(element);
    this.labels.push({ element, at: new THREE.Vector3(at.x, 1.1, at.y) });
  }
  private drawMap(observation: PublicObservation) {
    disposeGroup(this.terrain);
    for (const polygon of observation.map.reefs) {
      const shape = new THREE.Shape(polygon.map(p => new THREE.Vector2(p.x, -p.y)));
      const stone = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 3.6, bevelEnabled: true, bevelSize: 1.1, bevelThickness: 1.7, bevelSegments: 1, steps: 1 }), new THREE.MeshStandardMaterial({ color: 0x334a52, flatShading: true, roughness: 1 }));
      stone.rotation.x = -Math.PI / 2; stone.position.y = .1; this.terrain.add(stone);
      const shore = line([...polygon, polygon[0]].map(p => new THREE.Vector3(p.x, .12, p.y)), 0x79989a, .45); this.terrain.add(shore);
      const center = polygon.reduce((a, p) => ({ x: a.x + p.x / polygon.length, y: a.y + p.y / polygon.length }), { x: 0, y: 0 });
      for (let i = 0; i < 3; i++) {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.9 + i * .6, 0), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x405a60 : 0x2b414c, roughness: 1, flatShading: true }));
        rock.scale.set(1.1, 1.6, .8); rock.position.set(center.x + (i - 1) * 2.3, 4.3, center.y + Math.sin(i) * 1.8); rock.rotation.set(i, i * 1.6, .2); this.terrain.add(rock);
      }
    }
    const harbor = observation.map.harbor;
    const harborRing = ring(observation.map.harborRadius, AMBER, .45, true); harborRing.position.set(harbor.x, 0, harbor.y); this.terrain.add(harborRing);
    const pierMaterial = new THREE.MeshStandardMaterial({ color: 0x816446, roughness: 1 });
    const pier = new THREE.Mesh(new THREE.BoxGeometry(7.5, .65, 1.4), pierMaterial); pier.position.set(harbor.x - 1.5, .5, harbor.y + 4.8); this.terrain.add(pier);
    for (const offset of [-4.6, .8]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(.16, .22, 2.1, 6), new THREE.MeshStandardMaterial({ color: 0x7c633f })); post.position.set(harbor.x + offset, 1.2, harbor.y + 4.8); this.terrain.add(post);
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(.26, 8, 6), new THREE.MeshBasicMaterial({ color: AMBER })); lantern.position.copy(post.position); lantern.position.y = 2.5; this.terrain.add(lantern);
      const light = new THREE.PointLight(AMBER, 22, 17, 1.7); light.position.copy(lantern.position); this.terrain.add(light);
    }
    const boundary = line([new THREE.Vector3(0, .1, 0), new THREE.Vector3(100, .1, 0), new THREE.Vector3(100, .1, 70), new THREE.Vector3(0, .1, 70), new THREE.Vector3(0, .1, 0)], 0x6a9fa5, .18, true); this.terrain.add(boundary);
    for (let i = 0; i <= 10; i++) {
      const x = i * 10;
      this.terrain.add(line([new THREE.Vector3(x, .08, 0), new THREE.Vector3(x, .08, 1.2)], 0x88b7bc, .25));
      this.terrain.add(line([new THREE.Vector3(x, .08, 68.8), new THREE.Vector3(x, .08, 70)], 0x88b7bc, .25));
    }
  }
  select(direction: Direction) { this.selected = direction; if (this.observation) this.drawSelection(this.observation); }
  private drawSelection(observation: PublicObservation) {
    disposeGroup(this.selection);
    if (observation.phase === 'TERMINAL') return;
    const angle = dirAngle[this.selected], at = observation.boat.position;
    const dx = Math.sin(angle), dy = Math.cos(angle);
    const points = [new THREE.Vector3(at.x + dx * 3.5, .25, at.y + dy * 3.5), new THREE.Vector3(at.x + dx * 11, .25, at.y + dy * 11)];
    this.selection.add(line(points, AMBER, .65, true));
    const tip = new THREE.Vector3(at.x + dx * 11, .25, at.y + dy * 11);
    this.selection.add(line([new THREE.Vector3(tip.x - dx * 2 - dy, .25, tip.z - dy * 2 + dx), tip, new THREE.Vector3(tip.x - dx * 2 + dy, .25, tip.z - dy * 2 - dx)], AMBER, .75));
  }
  update(observation: PublicObservation, snap = false) {
    this.observation = observation;
    const mapKey = JSON.stringify(observation.map);
    if (mapKey !== this.mapKey) { this.mapKey = mapKey; this.drawMap(observation); snap = true; }
    this.boatTarget.set(observation.boat.position.x, 0, observation.boat.position.y);
    this.boatAngle = dirAngle[observation.boat.heading];
    if (snap) { this.boat.position.copy(this.boatTarget); this.boat.rotation.y = this.boatAngle; }
    disposeGroup(this.contacts); disposeGroup(this.markers);
    this.labels.forEach(label => label.element.remove()); this.labels = [];
    this.addLabel('归航港 · HOME', { x: observation.map.harbor.x, y: observation.map.harbor.y + 8 }, 'harbor-label');
    for (const contact of observation.contacts) {
      const age = observation.tick - contact.tick;
      const color = contact.hint === 'large-anomaly' ? CORAL : TEAL;
      const echo = ring(Math.max(1.5, contact.uncertainty), color, Math.max(.2, .8 - age * .06), true);
      echo.position.set(contact.position.x, 0, contact.position.y); this.contacts.add(echo);
      const dot = new THREE.Mesh(new THREE.CircleGeometry(.4, 12), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .8 })); dot.rotation.x = -Math.PI / 2; dot.position.set(contact.position.x, .18, contact.position.y); this.contacts.add(dot);
      const speciesName = contact.species ? ({ 'silver-bell': '银铃鱼', reefback: '礁背鱼', glassfin: '玻璃鳍' }[contact.species]) : null;
      this.addLabel(`${contact.hint === 'large-anomaly' ? '异常回波' : speciesName ?? '鱼群回波'} · ${age === 0 ? '刚刚' : `${age} 步前`}`, { x: contact.position.x, y: contact.position.y - Math.max(2, contact.uncertainty) - 1.2 }, contact.hint === 'large-anomaly' ? 'danger-label' : 'echo-label');
    }
    for (const beacon of observation.beacons) {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(.2, .3, 1.5, 6), new THREE.MeshStandardMaterial({ color: AMBER })); mast.position.set(beacon.position.x, .8, beacon.position.y); this.markers.add(mast);
      const halo = ring(beacon.active ? 2.6 : 1.4, TEAL, .6, !beacon.active); halo.position.set(beacon.position.x, 0, beacon.position.y); this.markers.add(halo);
      this.addLabel(`${beacon.profile === 'chime' ? '铃声' : '低鸣'} ${beacon.active ? `余 ${beacon.life} 步` : `${beacon.startsIn} 步后启动 · 寿命 ${beacon.life}`}`, { x: beacon.position.x, y: beacon.position.y + 3.5 }, 'beacon-label');
    }
    if (observation.threat) {
      const { start, end, width } = observation.threat;
      const length = Math.hypot(end.x - start.x, end.y - start.y) || 1;
      // Public width is the hit radius: use a capsule with 2*width full breadth,
      // including the endpoint disks used by point-to-segment collision.
      const px = -(end.y - start.y) / length * width, py = (end.x - start.x) / length * width;
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const vertices = [
        ...Array.from({ length: 25 }, (_, i) => ({ x: end.x + Math.cos(angle - Math.PI / 2 + i / 24 * Math.PI) * width, y: end.y + Math.sin(angle - Math.PI / 2 + i / 24 * Math.PI) * width })),
        ...Array.from({ length: 25 }, (_, i) => ({ x: start.x + Math.cos(angle + Math.PI / 2 + i / 24 * Math.PI) * width, y: start.y + Math.sin(angle + Math.PI / 2 + i / 24 * Math.PI) * width })),
      ];
      const area = planeShape(vertices, CORAL, .19); area.position.y = .2; this.markers.add(area);
      this.markers.add(line([...vertices, vertices[0]].map(p => new THREE.Vector3(p.x, .28, p.y)), CORAL, .95));
      for (let t = .08; t < .95; t += .13) {
        const x = start.x + (end.x - start.x) * t, y = start.y + (end.y - start.y) * t;
        this.markers.add(line([new THREE.Vector3(x + px, .29, y + py), new THREE.Vector3(x - px, .29, y - py)], CORAL, .45));
      }
      this.addLabel(`冲撞通道 · ${observation.threat.resolvesIn === 1 ? '下次行动后' : `${observation.threat.resolvesIn} 步后`}结算`, { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }, 'threat-label');
    }
    if (this.fishingLine) { this.scene.remove(this.fishingLine); this.fishingLine.geometry.dispose(); (this.fishingLine.material as THREE.Material).dispose(); this.fishingLine = null; }
    if (observation.fishing) {
      const a = observation.boat.position, b = observation.fishing.lineEnd;
      this.fishingLine = line([new THREE.Vector3(a.x, 2.2, a.y), new THREE.Vector3((a.x + b.x) / 2, 1.5, (a.y + b.y) / 2), new THREE.Vector3(b.x, .2, b.y)], AMBER, .85);
      this.scene.add(this.fishingLine);
      const hooked = ring(1.25, AMBER, .9); hooked.position.set(b.x, .25, b.y); this.markers.add(hooked);
    }
    if (observation.tick !== this.lastTick) {
      for (const event of observation.events) {
        if (event.position && /sonar|ping|声呐|探测/.test(`${event.kind} ${event.text}`)) {
          const pulse = ring(.3, TEAL, .9); pulse.position.set(event.position.x, .2, event.position.y); this.scene.add(pulse); this.pulses.push({ ring: pulse, started: performance.now(), max: (event.intensity ?? 0) > 5 ? 40 : 23 });
        }
      }
      this.lastTick = observation.tick;
    }
    this.drawSelection(observation);
  }
  private animate = (time: number) => {
    this.animationId = requestAnimationFrame(this.animate);
    this.water.material.uniforms.uTime.value = time / 1000;
    this.boat.position.lerp(this.boatTarget, .13);
    this.boat.position.y = Math.sin(time * .0018) * .11;
    const difference = Math.atan2(Math.sin(this.boatAngle - this.boat.rotation.y), Math.cos(this.boatAngle - this.boat.rotation.y));
    this.boat.rotation.y += difference * .14; this.boat.rotation.z = Math.sin(time * .0015) * .025;
    for (const pulse of this.pulses) {
      const t = (time - pulse.started) / 1700;
      pulse.ring.scale.setScalar(1 + Math.max(0, t) * pulse.max / .3);
      (pulse.ring.material as THREE.LineBasicMaterial).opacity = Math.max(0, .65 * (1 - t));
    }
    this.pulses = this.pulses.filter(pulse => { if (time - pulse.started > 1700) { this.scene.remove(pulse.ring); pulse.ring.geometry.dispose(); (pulse.ring.material as THREE.Material).dispose(); return false; } return true; });
    this.renderer.render(this.scene, this.camera);
    for (const label of this.labels) {
      const projected = label.at.clone().project(this.camera);
      label.element.style.left = `${(projected.x + 1) / 2 * this.host.clientWidth}px`;
      label.element.style.top = `${(-projected.y + 1) / 2 * this.host.clientHeight}px`;
    }
  };
  get canvas(): HTMLCanvasElement { return this.renderer.domElement; }
  destroy() { cancelAnimationFrame(this.animationId); this.resizeObserver.disconnect(); this.renderer.dispose(); }
}
