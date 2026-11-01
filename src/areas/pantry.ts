import { examplePantryStock, pantryCategories, pantryIsExampleUntilEdited } from '../data/pantry';
import { tiers } from '../data/tiers';
import { pantryCover, pantryPeople, tiersReached } from '../logic/home';
import {
  addStock,
  readPantryProgress,
  resetStock,
  setPeople,
  withPantryProgress,
  type PantryProgress,
} from '../logic/pantry-progress';
import type { Profile } from '../logic/profile';
import type { Store } from '../storage/store';
import type { ShelfScene } from '../ui/pantry-scene';

const SVG_NS = 'http://www.w3.org/2000/svg';
const MAX_DAYS = Math.max(10, ...tiers.map((t) => t.days));
const RING_RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string>,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

function formatDays(days: number): string {
  return (Math.round(days * 10) / 10).toString();
}

/** Point on the ring for a day count, starting at the top and going clockwise. */
function ringPoint(days: number, radius: number): { x: number; y: number } {
  const angle = (Math.min(days, MAX_DAYS) / MAX_DAYS) * 2 * Math.PI - Math.PI / 2;
  return { x: 60 + radius * Math.cos(angle), y: 60 + radius * Math.sin(angle) };
}

function ring(days: number): SVGSVGElement {
  const root = svg('svg', { viewBox: '0 0 120 120', class: 'pantry-ring', 'aria-hidden': 'true' });
  const r = String(RING_RADIUS);
  root.append(svg('circle', { cx: '60', cy: '60', r, class: 'pantry-ring-bg' }));
  const fraction = Math.min(days, MAX_DAYS) / MAX_DAYS;
  root.append(
    svg('circle', {
      cx: '60',
      cy: '60',
      r,
      class: 'pantry-ring-fill',
      'stroke-dasharray': `${fraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`,
      transform: 'rotate(-90 60 60)',
    }),
  );
  for (const tier of tiers) {
    if (tier.days >= MAX_DAYS) continue;
    const a = ringPoint(tier.days, RING_RADIUS - 8);
    const b = ringPoint(tier.days, RING_RADIUS + 8);
    root.append(
      svg('line', {
        x1: String(a.x),
        y1: String(a.y),
        x2: String(b.x),
        y2: String(b.y),
        class: 'pantry-ring-tick',
      }),
    );
  }
  return root;
}

/** Pantry area: household selector, cover ring, tier chips, per-category bars and stock buttons. */
export function renderPantry(
  store: Store,
  initial: Record<string, unknown>,
  profile: Profile | null,
  batterySaver = false,
): HTMLElement {
  let progress: PantryProgress = readPantryProgress(initial, examplePantryStock);
  const root = el('div', 'pantry');

  // The 3D shelf is a lazy chunk. Any failure leaves the 2D bars as the whole experience.
  let shelf: ShelfScene | null = null;
  const stage = el('div', 'home-scene pantry-scene');
  const startShelf = async (): Promise<void> => {
    if (batterySaver) return; // 2D bars only
    try {
      const { createShelfScene } = await import('../ui/pantry-scene');
      const people = progress.people ?? pantryPeople(profile);
      const cover = pantryCover(pantryCategories, progress.stock, people);
      shelf = createShelfScene({
        container: stage,
        stock: progress.stock,
        weakest: cover.weakest,
      });
    } catch {
      shelf = null;
    }
  };

  const persist = async (next: PantryProgress, focusSelector?: string): Promise<void> => {
    progress = next;
    await store.update((d) => ({ ...d, progress: withPantryProgress(d.progress, next) }));
    draw(focusSelector);
  };

  function draw(focusSelector?: string): void {
    const people = progress.people ?? pantryPeople(profile);
    const cover = pantryCover(pantryCategories, progress.stock, people);
    const reached = tiersReached(
      cover.overall,
      tiers.map((t) => t.days),
    );

    const summary = el('div', 'prepare-block pantry-summary');
    summary.append(el('h2', '', 'Days of cover'));

    const selector = el('div', 'pantry-people');
    selector.setAttribute('role', 'group');
    selector.setAttribute('aria-label', 'People in the household');
    for (let n = 1; n <= 4; n += 1) {
      const btn = el('button', '', String(n));
      btn.type = 'button';
      btn.dataset.people = String(n);
      btn.setAttribute('aria-pressed', String(n === people));
      btn.setAttribute('aria-label', `${n} ${n === 1 ? 'person' : 'people'}`);
      btn.addEventListener(
        'click',
        () => void persist(setPeople(progress, n), `[data-people="${n}"]`),
      );
      selector.append(btn);
    }

    const figure = el('div', 'pantry-figure');
    const number = el('p', 'home-total pantry-days', formatDays(cover.overall));
    number.dataset.pantryDays = '';
    figure.append(ring(cover.overall), number);
    const who = `${people} ${people === 1 ? 'person' : 'people'}`;
    const unitLine = el('p', 'hint', `days of food and water for ${who}, out of ${MAX_DAYS}`);

    const chips = el('ul', 'pantry-chips');
    for (const tier of tiers) {
      const hit = reached.includes(tier.days);
      const li = el(
        'li',
        `pantry-chip${hit ? ' reached' : ''}`,
        `${tier.label}${hit ? ' reached' : ''}`,
      );
      li.dataset.tier = String(tier.days);
      chips.append(li);
    }
    summary.append(selector, figure, unitLine, chips);

    const weakest = pantryCategories.find((c) => c.id === cover.weakest);
    if (weakest) {
      summary.append(
        el('p', 'hint', `Weakest category: ${weakest.name}. Your cover is the lowest category.`),
      );
    }
    if (pantryIsExampleUntilEdited && !progress.edited) {
      summary.append(
        el(
          'p',
          'hint pantry-example',
          'Example data: this stock is a starting example. Change it to match your cupboards and it becomes yours.',
        ),
      );
    }

    const list = el('ul', 'prepare-list pantry-list');
    for (const cat of pantryCategories) {
      const days = cover.perCategory.find((c) => c.id === cat.id)?.days ?? 0;
      const li = el('li', `prepare-row pantry-row${cat.id === cover.weakest ? ' weakest' : ''}`);
      li.dataset.category = cat.id;
      const head = el('div', 'pantry-row-head');
      head.append(
        el('strong', '', cat.name),
        el('span', 'home-room-percent', `${formatDays(days)} days`),
      );
      const bar = el('progress');
      bar.max = MAX_DAYS;
      bar.value = Math.min(days, MAX_DAYS);
      bar.setAttribute('aria-label', `${cat.name} days of cover`);
      const stockLine = el('p', 'hint', `In stock: ${progress.stock[cat.id]} × ${cat.unit}`);
      const buttons = el('div', 'pantry-add');
      const addButton = (amount: number, text: string, label: string): void => {
        const btn = el('button', '', text);
        btn.type = 'button';
        const key = `${cat.id}:${amount}`;
        btn.dataset.add = key;
        btn.setAttribute('aria-label', label);
        btn.addEventListener(
          'click',
          () => void persist(addStock(progress, cat.id, amount), `[data-add="${key}"]`),
        );
        buttons.append(btn);
      };
      for (const step of cat.addSteps) addButton(step, `+${step}`, `Add ${step} to ${cat.name}`);
      addButton(-1, '−1', `Remove 1 from ${cat.name}`);
      li.append(head, bar, stockLine, buttons);
      list.append(li);
    }

    const reset = el('button', '', 'Reset stock to zero');
    reset.type = 'button';
    reset.dataset.pantryReset = '';
    reset.addEventListener(
      'click',
      () => void persist(resetStock(progress), '[data-pantry-reset]'),
    );

    root.replaceChildren(stage, summary, list, reset);
    shelf?.update(progress.stock, cover.weakest);
    if (focusSelector) root.querySelector<HTMLElement>(focusSelector)?.focus();
  }

  draw();
  void startShelf();
  return root;
}
