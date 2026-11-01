import {
  CRISIS_TABS,
  CRISIS_TAB_LABELS,
  activePlaybookStart,
  elapsedBannerText,
  type CrisisTab,
} from '../logic/crisis';
import { householdLine, normaliseProfile } from '../logic/profile';
import { getStore } from '../storage/instance';

const CLOCK_REFRESH_MS = 30_000;

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

function placeholderPanel(tab: CrisisTab): HTMLElement {
  const panel = el('div', 'crisis-panel');
  panel.id = `crisis-panel-${tab}`;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', `crisis-tab-${tab}`);
  panel.tabIndex = 0;
  panel.append(el('p', '', `${CRISIS_TAB_LABELS[tab]} content is coming.`));
  return panel;
}

/** Crisis mode shell: banner, household line, panel area and bottom tabs. No animation, no network. */
export async function renderCrisis(): Promise<HTMLElement> {
  const data = await (await getStore()).load();
  const profile = normaliseProfile(data.profile);
  const startedAt = activePlaybookStart(data.progress);

  const root = el('section', 'crisis');
  root.setAttribute('aria-labelledby', 'area-title');

  const banner = el('div', 'crisis-banner');
  const title = el('h1', '', 'Crisis mode');
  title.id = 'area-title';
  const flags = el('span', 'crisis-flag', '3D off');
  const elapsed = el('span', 'crisis-elapsed', elapsedBannerText(startedAt, Date.now()));
  banner.append(title, flags, elapsed);

  const household = el('p', 'crisis-household', householdLine(profile) || 'Household not set up');

  const panelHost = el('div', 'crisis-panel-host');
  const tabs = el('div', 'crisis-tabs');
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Crisis mode');

  const buttons = new Map<CrisisTab, HTMLButtonElement>();
  const select = (tab: CrisisTab): void => {
    for (const [name, b] of buttons) {
      const on = name === tab;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    }
    panelHost.replaceChildren(placeholderPanel(tab));
    root.dataset.tab = tab;
  };
  for (const tab of CRISIS_TABS) {
    const b = el('button', 'crisis-tab', CRISIS_TAB_LABELS[tab]);
    b.type = 'button';
    b.id = `crisis-tab-${tab}`;
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', `crisis-panel-${tab}`);
    b.addEventListener('click', () => select(tab));
    b.addEventListener('keydown', (e) => {
      const i = CRISIS_TABS.indexOf(tab);
      const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (delta === 0) return;
      const next = CRISIS_TABS[(i + delta + CRISIS_TABS.length) % CRISIS_TABS.length]!;
      select(next);
      buttons.get(next)?.focus();
    });
    buttons.set(tab, b);
    tabs.append(b);
  }
  select('do');

  root.append(banner, household, panelHost, tabs);

  // Plain text refresh once the page is shown; stops when the section leaves the document.
  const timer = window.setInterval(() => {
    if (!root.isConnected) {
      window.clearInterval(timer);
      return;
    }
    elapsed.textContent = elapsedBannerText(startedAt, Date.now());
  }, CLOCK_REFRESH_MS);

  return root;
}
