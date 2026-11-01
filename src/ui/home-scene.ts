/** three.js house scene. Loaded lazily by the Home area; never imported by Crisis mode. */
import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import {
  isTap,
  pulseScale,
  ROOM_LAYOUT,
  yawFromDrag,
  zoneColour,
  type RoomBox,
} from '../logic/home-scene';

export interface SceneRoom {
  id: string;
  name: string;
  percent: number;
}

export interface HouseScene {
  canvas: HTMLCanvasElement;
  update(rooms: readonly SceneRoom[], selectedId: string): void;
  dispose(): void;
}

export interface HouseSceneOptions {
  container: HTMLElement;
  rooms: readonly SceneRoom[];
  selectedId: string;
  reduceMotion: boolean;
  onSelect(roomId: string): void;
}

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}

function furniture(group: Group, box: RoomBox, kind: string): void {
  const mat = new MeshLambertMaterial({ color: 0x5b6b7d });
  const add = (w: number, h: number, d: number, dx: number, dz: number): void => {
    const m = new Mesh(new BoxGeometry(w, h, d), mat);
    m.position.set(box.x + dx, box.y - box.h / 2 + h / 2 + 0.05, box.z + dz);
    group.add(m);
  };
  if (kind === 'lounge') {
    add(1.4, 0.4, 0.6, 0, -1.0);
    add(0.6, 0.3, 0.6, 0.2, 0.2);
  } else if (kind === 'kitchen') {
    add(2.2, 0.7, 0.5, 0, -1.3);
    add(0.8, 0.5, 0.8, 0, 0.3);
  } else if (kind === 'bedroom') {
    add(1.2, 0.35, 1.8, -0.5, -0.5);
  } else {
    add(0.5, 0.4, 0.8, -0.8, -1);
    add(0.9, 0.3, 0.5, 0.6, 1);
  }
}

/** Returns null when WebGL is unavailable so the caller keeps the 2D view. */
export function createHouseScene(opts: HouseSceneOptions): HouseScene | null {
  if (!webglAvailable()) return null;
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const canvas = renderer.domElement;
  canvas.className = 'home-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute(
    'aria-label',
    '3D cutaway of the home. The room list below has the same information.',
  );
  canvas.style.touchAction = 'pan-y';

  const wrap = document.createElement('div');
  wrap.className = 'home-stage';
  const labels = document.createElement('div');
  labels.className = 'home-labels';
  labels.setAttribute('aria-hidden', 'true');
  wrap.append(canvas, labels);
  opts.container.append(wrap);

  const scene = new Scene();
  scene.add(new AmbientLight(0xffffff, 1.6));
  const sun = new DirectionalLight(0xffffff, 1.6);
  sun.position.set(4, 8, 8);
  scene.add(sun);

  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  const house = new Group();
  scene.add(house);

  // Floors, back wall and a translucent roof frame; the front stays open.
  const shell = new MeshLambertMaterial({ color: 0x1c2735 });
  const floor = (y: number): void => {
    const m = new Mesh(new BoxGeometry(6.2, 0.1, 3.6), shell);
    m.position.set(0, y, 0);
    house.add(m);
  };
  floor(0);
  floor(2);
  const back = new Mesh(new BoxGeometry(6.2, 4.1, 0.1), shell);
  back.position.set(0, 2.05, -1.75);
  house.add(back);
  const roof = new LineSegments(
    new EdgesGeometry(new BoxGeometry(6.4, 0.9, 3.8)),
    new LineBasicMaterial({ color: 0x8fa3b8, transparent: true, opacity: 0.6 }),
  );
  roof.position.set(0, 4.5, 0);
  house.add(roof);

  const zones = new Map<string, Mesh<BoxGeometry, MeshLambertMaterial>>();
  const labelEls = new Map<string, HTMLElement>();
  for (const room of opts.rooms) {
    const box = ROOM_LAYOUT[room.id];
    if (!box) continue;
    const zone = new Mesh(
      new BoxGeometry(box.w - 0.15, box.h - 0.2, box.d - 0.15),
      new MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 }),
    );
    zone.position.set(box.x, box.y, box.z);
    zone.userData.roomId = room.id;
    house.add(zone);
    zones.set(room.id, zone);
    furniture(house, box, room.id);
    const label = document.createElement('div');
    label.className = 'home-label';
    labels.append(label);
    labelEls.set(room.id, label);
  }

  let rooms = opts.rooms;
  let selectedId = opts.selectedId;
  let yaw = 0;
  let raf = 0;
  let disposed = false;

  const applyState = (): void => {
    for (const room of rooms) {
      const zone = zones.get(room.id);
      if (!zone) continue;
      zone.material.color.setHex(zoneColour(room.percent));
      zone.material.opacity = room.id === selectedId ? 0.5 : 0.28;
      const label = labelEls.get(room.id);
      if (label) {
        label.textContent = `${room.name} ${room.percent}%`;
        label.dataset.room = room.id;
      }
    }
  };

  const tmp = new Vector3();
  const render = (time: number): void => {
    if (disposed) return;
    const w = wrap.clientWidth || 320;
    const h = wrap.clientHeight || 280;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.set(0, 4.2, 15);
    camera.lookAt(0, 2.1, 0);
    camera.updateProjectionMatrix();
    house.rotation.y = yaw;
    house.updateMatrixWorld(true);
    for (const z of zones.values()) z.scale.setScalar(1);
    const selected = zones.get(selectedId);
    if (selected) selected.scale.setScalar(pulseScale(time, opts.reduceMotion));
    renderer.render(scene, camera);
    for (const [id, z] of zones) {
      const el = labelEls.get(id);
      if (!el) continue;
      z.getWorldPosition(tmp).project(camera);
      el.style.left = `${((tmp.x + 1) / 2) * w}px`;
      el.style.top = `${((1 - tmp.y) / 2) * h}px`;
    }
  };

  const loop = (time: number): void => {
    render(time);
    raf = opts.reduceMotion ? 0 : requestAnimationFrame(loop);
  };
  const requestRender = (): void => {
    if (disposed) return;
    if (opts.reduceMotion) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame((t) => {
        raf = 0;
        render(t);
      });
    } else if (!raf) {
      raf = requestAnimationFrame(loop);
    }
  };

  // Drag to turn; a press that barely moves is a tap and raycasts for a room.
  const raycaster = new Raycaster();
  let start: { x: number; y: number; yaw: number } | null = null;
  canvas.addEventListener('pointerdown', (e) => {
    start = { x: e.clientX, y: e.clientY, yaw };
    canvas.setPointerCapture?.(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    if (!isTap(dx, e.clientY - start.y)) {
      yaw = yawFromDrag(start.yaw, dx);
      requestRender();
    }
  });
  canvas.addEventListener('pointerup', (e) => {
    const s = start;
    start = null;
    if (!s || !isTap(e.clientX - s.x, e.clientY - s.y)) return;
    const rect = canvas.getBoundingClientRect();
    const ndc = new Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects([...zones.values()], false)[0];
    const id: unknown = hit?.object.userData.roomId;
    if (typeof id === 'string') opts.onSelect(id);
  });
  canvas.addEventListener('pointercancel', () => {
    start = null;
  });

  applyState();
  requestRender();

  return {
    canvas,
    update(next, selected) {
      rooms = next;
      selectedId = selected;
      applyState();
      requestRender();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      renderer.dispose();
      wrap.remove();
    },
  };
}
