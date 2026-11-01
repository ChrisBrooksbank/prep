import { AREAS, AREA_LABELS, parseRoute, routeHash, type Area } from '../logic/route';
import { renderCrisis } from '../areas/crisis';
import { renderPrepare } from '../areas/prepare';

async function renderArea(area: Area): Promise<HTMLElement> {
  if (area === 'crisis') return renderCrisis();
  if (area === 'prepare') return renderPrepare();
  const { renderHome } = await import('../areas/home');
  return renderHome();
}

function buildNav(current: Area): HTMLElement {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Areas');
  for (const area of AREAS) {
    const a = document.createElement('a');
    a.href = routeHash(area);
    a.textContent = AREA_LABELS[area];
    if (area === current) a.setAttribute('aria-current', 'page');
    nav.append(a);
  }
  return nav;
}

function buildCrisisControl(): HTMLElement {
  const a = document.createElement('a');
  a.href = routeHash('crisis');
  a.className = 'crisis-control';
  a.textContent = 'Crisis mode';
  return a;
}

export function startRouter(root: HTMLElement): void {
  let token = 0;
  const show = async (): Promise<void> => {
    const area = parseRoute(location.hash);
    const mine = ++token;
    const main = await renderArea(area);
    if (mine !== token) return;
    root.dataset.area = area;
    const header = document.createElement('header');
    const brand = document.createElement('span');
    brand.className = 'brand';
    brand.textContent = 'Ready';
    header.append(brand);
    // Crisis mode is its own full-screen state: no area nav, no way to wander off by accident.
    if (area !== 'crisis') header.append(buildNav(area), buildCrisisControl());
    main.id = 'main';
    root.replaceChildren(header, main);
  };
  window.addEventListener('hashchange', () => void show());
  void show();
}
