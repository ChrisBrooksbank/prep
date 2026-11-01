/** three.js pantry shelf. Loaded lazily by the Pantry view; never imported by Crisis mode. */
import {
  AmbientLight,
  BoxGeometry,
  CylinderGeometry,
  DirectionalLight,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import type { PantryCategoryId } from '../logic/home';
import { clampPixelRatio } from '../logic/render-control';
import { watchRenderGate } from './render-gate';
import { BOARD_Y, itemSpots, MAX_ITEMS_PER_CATEGORY, visibleItems } from '../logic/pantry-scene';

export interface ShelfScene {
  canvas: HTMLCanvasElement;
  update(stock: Readonly<Record<string, number>>, weakest: string | null): void;
  dispose(): void;
}

export interface ShelfSceneOptions {
  container: HTMLElement;
  stock: Readonly<Record<string, number>>;
  weakest: string | null;
}

const CATEGORY_COLOURS: Readonly<Record<PantryCategoryId, number>> = {
  water: 0x4aa3df,
  carbs: 0xd9b35a,
  veg: 0x5fae6a,
  protein: 0xc9695c,
  fats: 0xe3c24a,
};
const IDS = Object.keys(CATEGORY_COLOURS) as PantryCategoryId[];

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Returns null when WebGL is unavailable so the caller keeps the 2D view. Static render, no animation. */
export function createShelfScene(opts: ShelfSceneOptions): ShelfScene | null {
  if (!webglAvailable()) return null;
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(clampPixelRatio(window.devicePixelRatio));
  const canvas = renderer.domElement;
  canvas.className = 'home-canvas pantry-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute(
    'aria-label',
    '3D pantry shelf. The category bars below have the same information.',
  );
  const wrap = document.createElement('div');
  wrap.className = 'home-stage';
  wrap.append(canvas);
  opts.container.append(wrap);

  const scene = new Scene();
  scene.add(new AmbientLight(0xffffff, 1.6));
  const sun = new DirectionalLight(0xffffff, 1.6);
  sun.position.set(3, 8, 8);
  scene.add(sun);
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  const shelf = new Group();
  scene.add(shelf);

  const wood = new MeshLambertMaterial({ color: 0x3a4658 });
  for (const y of BOARD_Y) {
    const board = new Mesh(new BoxGeometry(6, 0.1, 1.2), wood);
    board.position.set(0, y - 0.05, 0);
    shelf.add(board);
  }
  const back = new Mesh(
    new BoxGeometry(6, 3.8, 0.08),
    new MeshLambertMaterial({ color: 0x1c2735 }),
  );
  back.position.set(0, 1.9, -0.65);
  shelf.add(back);

  const geometry = new CylinderGeometry(0.11, 0.11, 0.3, 14);
  const meshes = new Map<PantryCategoryId, InstancedMesh<CylinderGeometry, MeshLambertMaterial>>();
  for (const id of IDS) {
    const mesh = new InstancedMesh(
      geometry,
      new MeshLambertMaterial({ color: CATEGORY_COLOURS[id] }),
      MAX_ITEMS_PER_CATEGORY,
    );
    mesh.count = 0;
    shelf.add(mesh);
    meshes.set(id, mesh);
  }

  const m = new Matrix4();
  const apply = (stock: Readonly<Record<string, number>>, weakest: string | null): void => {
    for (const id of IDS) {
      const mesh = meshes.get(id);
      if (!mesh) continue;
      const spots = itemSpots(id, visibleItems(stock[id] ?? 0));
      spots.forEach((s, i) => {
        m.makeTranslation(s.x, s.y + 0.15, s.z);
        mesh.setMatrixAt(i, m);
      });
      mesh.count = spots.length;
      mesh.instanceMatrix.needsUpdate = true;
      // The weakest category glows.
      mesh.material.emissive.setHex(id === weakest ? 0x7a5400 : 0x000000);
    }
  };

  let disposed = false;
  let raf = 0;
  let paused = false;
  const render = (): void => {
    raf = 0;
    if (disposed) return;
    const w = wrap.clientWidth || 320;
    const h = wrap.clientHeight || 280;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.set(0, 2.2, 11);
    camera.lookAt(0, 1.9, 0);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  const requestRender = (): void => {
    if (!raf && !disposed && !paused) raf = requestAnimationFrame(render);
  };

  const gate = watchRenderGate(canvas, (active) => {
    paused = !active;
    if (paused) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else {
      requestRender();
    }
  });

  apply(opts.stock, opts.weakest);
  requestRender();

  return {
    canvas,
    update(stock, weakest) {
      apply(stock, weakest);
      requestRender();
    },
    dispose() {
      disposed = true;
      gate.dispose();
      cancelAnimationFrame(raf);
      geometry.dispose();
      renderer.dispose();
      wrap.remove();
    },
  };
}
