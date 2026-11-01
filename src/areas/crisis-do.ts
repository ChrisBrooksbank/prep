import { callCards } from '../data/crisis-calls';
import { playbooks, type Playbook, type PlaybookId } from '../data/crisis-playbooks';
import {
  activePlaybookStart,
  readCrisisProgress,
  resetPlaybook,
  startPlaybook,
  tickedCount,
  tickKey,
  timerStatuses,
  toggleTick,
  visibleSteps,
  withCrisisProgress,
  type CrisisProgress,
} from '../logic/crisis';
import type { Profile } from '../logic/profile';
import { getStore } from '../storage/instance';

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

interface Contact {
  title: string;
  number?: string;
  tel?: string;
  description: string;
}

function contactFor(playbook: Playbook, profile: Profile | null): Contact {
  const card = callCards.find((c) => c.id === playbook.primaryCall);
  if (!card) return { title: playbook.name, description: '' };
  if (card.number) {
    return {
      title: card.title,
      number: card.number,
      tel: card.number.replace(/\s+/g, ''),
      description: card.description,
    };
  }
  const saved = card.fromProfile ? profile?.[card.fromProfile] : undefined;
  if (saved?.phone) {
    return {
      title: saved.name || card.title,
      number: saved.phone,
      tel: saved.phone.replace(/\s+/g, ''),
      description: card.title,
    };
  }
  return { title: card.title, description: 'Not saved yet. Add it in Settings' };
}

/** Do tab: playbook chips, primary contact, tickable steps, timers. Ticks persist on the device. */
export async function renderDoPanel(
  profile: Profile | null,
  onStartChange: (startedAt: number | null) => void,
): Promise<HTMLElement> {
  const store = await getStore();
  let crisis: CrisisProgress = readCrisisProgress((await store.load()).progress);
  let selected: PlaybookId = playbooks[0]!.id;

  const panel = el('div', 'crisis-panel');
  panel.id = 'crisis-panel-do';
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', 'crisis-tab-do');
  panel.tabIndex = 0;

  const persist = async (next: CrisisProgress): Promise<void> => {
    crisis = next;
    await store.update((d) => ({ ...d, progress: withCrisisProgress(d.progress, next) }));
    onStartChange(activePlaybookStart({ crisis: next }));
  };

  const draw = (focusSelector?: string): void => {
    const playbook = playbooks.find((p) => p.id === selected)!;
    const startedAt = crisis.starts[playbook.id] ?? null;
    const steps = visibleSteps(playbook.steps, profile);

    const chips = el('div', 'crisis-chips');
    chips.setAttribute('role', 'group');
    chips.setAttribute('aria-label', 'Playbooks');
    for (const p of playbooks) {
      const chip = el('button', 'crisis-chip', p.name);
      chip.type = 'button';
      chip.dataset.playbook = p.id;
      chip.setAttribute('aria-pressed', String(p.id === selected));
      chip.addEventListener('click', () => {
        selected = p.id;
        draw(`[data-playbook="${p.id}"]`);
      });
      chips.append(chip);
    }

    const contact = contactFor(playbook, profile);
    const card = el('div', 'crisis-contact');
    card.append(el('h2', '', contact.title));
    if (contact.number && contact.tel) {
      const a = el('a', 'crisis-tel', contact.number);
      a.href = `tel:${contact.tel}`;
      card.append(a);
    }
    if (contact.description) card.append(el('p', '', contact.description));

    const heading = el('h2', 'crisis-playbook-title', playbook.name);
    const progress = el(
      'p',
      'crisis-progress',
      `${tickedCount(crisis, playbook.id, steps)} of ${steps.length} done`,
    );

    const list = el('ol', 'crisis-steps');
    for (const step of steps) {
      const key = tickKey(playbook.id, step.id);
      const li = el('li', 'crisis-step');
      const label = el('label', 'crisis-step-label');
      const box = el('input');
      box.type = 'checkbox';
      box.checked = crisis.ticks[key] === true;
      box.dataset.step = key;
      box.addEventListener('change', () => {
        let next = toggleTick(crisis, playbook.id, step.id);
        if (box.checked && next.starts[playbook.id] === undefined) {
          next = startPlaybook(next, playbook.id, Date.now());
        }
        void persist(next).then(() => draw(`[data-step="${key}"]`));
      });
      const body = el('span', 'crisis-step-text');
      body.append(el('span', '', step.text));
      if (step.note) body.append(el('span', 'crisis-note', step.note));
      label.append(box, body);
      li.append(label);
      list.append(li);
    }

    const controls = el('div', 'crisis-controls');
    const start = el(
      'button',
      'crisis-button',
      startedAt === null ? 'Start now' : 'Restart timer from now',
    );
    start.type = 'button';
    start.dataset.action = 'start';
    start.addEventListener('click', () => {
      void persist(startPlaybook(crisis, playbook.id, Date.now())).then(() =>
        draw('[data-action="start"]'),
      );
    });
    const reset = el('button', 'crisis-button', 'Reset playbook');
    reset.type = 'button';
    reset.dataset.action = 'reset';
    reset.addEventListener('click', () => {
      void persist(resetPlaybook(crisis, playbook.id)).then(() => draw('[data-action="reset"]'));
    });
    controls.append(start, reset);

    const parts: HTMLElement[] = [chips, card, heading, progress, list];
    const timers = timerStatuses(playbook.timers, startedAt, Date.now());
    if (timers.length > 0) {
      const ul = el('ul', 'crisis-timers');
      ul.setAttribute('aria-label', 'Timers');
      for (const t of timers) ul.append(el('li', t.expired ? 'crisis-timer-expired' : '', t.text));
      parts.push(ul);
    }
    parts.push(controls);

    panel.replaceChildren(...parts);
    if (focusSelector) panel.querySelector<HTMLElement>(focusSelector)?.focus();
  };

  draw();
  return panel;
}
