import { exampleOwnedItemIds, homeIsExampleUntilEdited, homeRooms } from '../data/home-rooms';
import type { HomeRoom } from '../data/home-rooms';
import {
  allRoomScores,
  filterItems,
  homeScore,
  mostValuableMissing,
  readiness,
  roomScore,
  weakestRoom,
} from '../logic/home';
import {
  readHomeProgress,
  setOwned,
  withHomeProgress,
  type HomeProgress,
} from '../logic/home-progress';
import { defaultProfile, normaliseProfile } from '../logic/profile';
import { getStore } from '../storage/instance';
import { renderPantry } from './pantry';

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

/** Home area: the 2D room list and bottom sheet. This is also the fallback for the 3D view. */
export async function renderHome(): Promise<HTMLElement> {
  const store = await getStore();
  const data = await store.load();
  const profile = normaliseProfile(data.profile) ?? defaultProfile();
  let progress: HomeProgress = readHomeProgress(data.progress, exampleOwnedItemIds);
  let selectedId: string = homeRooms[0]?.id ?? '';

  const root = el('section');
  root.setAttribute('aria-labelledby', 'area-title');
  const title = el('h1', '', 'Home');
  title.id = 'area-title';
  const roomsView = el('div', 'home-view');
  const pantryView = renderPantry(store, data.progress, profile);
  pantryView.hidden = true;
  const switcher = el('div', 'home-switch');
  switcher.setAttribute('role', 'group');
  switcher.setAttribute('aria-label', 'Home view');
  const showView = (view: 'rooms' | 'pantry'): void => {
    roomsView.hidden = view !== 'rooms';
    pantryView.hidden = view !== 'pantry';
    for (const b of switcher.querySelectorAll('button')) {
      b.setAttribute('aria-pressed', String(b.dataset.view === view));
    }
  };
  for (const [view, label] of [
    ['rooms', 'Rooms'],
    ['pantry', 'Pantry'],
  ] as const) {
    const b = el('button', '', label);
    b.type = 'button';
    b.dataset.view = view;
    b.addEventListener('click', () => showView(view));
    switcher.append(b);
  }
  root.append(title, switcher, roomsView, pantryView);

  const persist = async (next: HomeProgress): Promise<void> => {
    progress = next;
    await store.update((d) => ({ ...d, progress: withHomeProgress(d.progress, next) }));
  };

  const sheet = (room: HomeRoom, owned: ReadonlySet<string>): HTMLElement => {
    const score = roomScore(room, owned, profile);
    const box = el('div', 'prepare-block home-sheet');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-labelledby', 'sheet-title');
    const heading = el('h2', '', room.name);
    heading.id = 'sheet-title';
    box.append(
      heading,
      el('p', 'hint', room.note),
      el('p', 'prepare-count home-sheet-percent', `${score.percent}% ready`),
    );
    const list = el('ul', 'prepare-list');
    for (const item of filterItems(room.items, profile)) {
      const has = owned.has(item.id);
      const li = el('li', 'prepare-row');
      const label = el('label', 'prepare-row-text');
      const check = el('input');
      check.type = 'checkbox';
      check.checked = has;
      check.dataset.item = item.id;
      check.addEventListener('change', () => {
        void persist(setOwned(progress, item.id, check.checked)).then(() =>
          draw(`[data-item="${item.id}"]`),
        );
      });
      label.append(check, el('span', '', item.label));
      li.append(label);
      const meta: string[] = [`Weight ${item.weight}`];
      if (!has && item.price) meta.push(`about £${item.price.min} to £${item.price.max}`);
      li.append(el('span', 'hint', meta.join(' · ')));
      if (item.tip) li.append(el('span', 'hint', item.tip));
      list.append(li);
    }
    box.append(list);
    return box;
  };

  function draw(focusSelector?: string): void {
    const owned = new Set(progress.owned);
    const scores = allRoomScores(homeRooms, owned, profile);
    const summary = el('div', 'prepare-block home-summary');
    const totalEl = el('p', 'home-total', `${homeScore(scores)}%`);
    totalEl.dataset.homeScore = '';
    summary.append(el('h2', '', 'Whole-home readiness'), totalEl);
    const weakest = weakestRoom(scores);
    const weakestData = weakest ? homeRooms.find((r) => r.id === weakest.roomId) : undefined;
    if (weakestData) {
      const missing = mostValuableMissing(weakestData, owned, profile);
      const line = missing
        ? `Weakest room: ${weakestData.name}. Most valuable missing item: ${missing.label}.`
        : `Weakest room: ${weakestData.name}. Nothing missing there.`;
      summary.append(el('p', 'hint', line));
    }
    if (homeIsExampleUntilEdited && !progress.edited) {
      summary.append(
        el(
          'p',
          'hint home-example',
          'Example data: these ticks are a starting example. Tick what you actually own and they become yours.',
        ),
      );
    }

    const list = el('ul', 'home-rooms');
    for (const room of homeRooms) {
      const score = scores.find((s) => s.roomId === room.id)!;
      const li = el('li');
      const btn = el('button', `home-room ${readiness(score.percent)}`);
      btn.type = 'button';
      btn.dataset.room = room.id;
      btn.setAttribute('aria-pressed', String(room.id === selectedId));
      const bar = el('progress');
      bar.max = 100;
      bar.value = score.percent;
      bar.setAttribute('aria-label', `${room.name} readiness`);
      btn.append(
        el('span', 'home-room-name', room.name),
        el('span', 'home-room-percent', `${score.percent}%`),
        bar,
      );
      btn.addEventListener('click', () => {
        selectedId = room.id;
        draw(`[data-room="${room.id}"]`);
      });
      li.append(btn);
      list.append(li);
    }

    const parts: HTMLElement[] = [summary, list];
    const selected = homeRooms.find((r) => r.id === selectedId);
    if (selected) parts.push(sheet(selected, owned));
    roomsView.replaceChildren(...parts);
    if (focusSelector) roomsView.querySelector<HTMLElement>(focusSelector)?.focus();
  }

  draw();
  showView('rooms');
  return root;
}
