import { callCards } from '../data/crisis-calls';
import { resolveCall } from '../logic/calls';
import type { Profile } from '../logic/profile';

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

/** Call tab: one card per number. Tappable tel: link plus the same number as selectable text. */
export function renderCallPanel(profile: Profile | null): HTMLElement {
  const panel = el('div', 'crisis-panel');
  panel.id = 'crisis-panel-call';
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', 'crisis-tab-call');
  panel.tabIndex = 0;

  for (const card of callCards) {
    const call = resolveCall(card, profile);
    const box = el('div', 'crisis-contact');
    box.dataset.call = card.id;
    box.append(el('h2', '', call.title));
    if (call.number && call.tel) {
      const a = el('a', 'crisis-tel', call.number);
      a.href = `tel:${call.tel}`;
      a.setAttribute('aria-label', `Call ${call.title} on ${call.number}`);
      box.append(a);
    }
    if (call.description) box.append(el('p', '', call.description));
    box.append(
      el('p', 'crisis-source', `Source: ${card.source}. Last checked ${card.lastChecked}.`),
    );
    panel.append(box);
  }
  return panel;
}
