import { knowTopics, type KnowTopic, type TopicId } from '../data/crisis-topics';

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

/** Slug of a Prepare task title, used as the deep link target (e.g. "book-a-first-aid-course"). */
export function taskSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function renderBody(topic: KnowTopic, id: string): HTMLElement {
  const body = el('div', 'crisis-topic-body');
  body.id = id;
  body.setAttribute('role', 'region');
  for (const line of topic.lines) {
    const p = el('p', line.danger ? 'crisis-line crisis-danger' : 'crisis-line');
    if (line.danger) {
      p.append(el('strong', 'crisis-danger-label', 'Danger: '));
    }
    p.append(document.createTextNode(line.text));
    body.append(p);
  }
  if (topic.prepareTaskLink) {
    const link = el('a', 'crisis-link', topic.prepareTaskLink.label);
    link.href = `#prepare/${taskSlug(topic.prepareTaskLink.taskTitle)}`;
    const p = el('p', 'crisis-line');
    p.append(link);
    body.append(p);
  }
  body.append(
    el('p', 'crisis-source', `Source: ${topic.source}. Last checked ${topic.lastChecked}.`),
  );
  return body;
}

/** Know tab: single-open accordion of survival topics. Danger lines stay inside their topic. */
export function renderKnowPanel(): HTMLElement {
  const panel = el('div', 'crisis-panel');
  panel.id = 'crisis-panel-know';
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', 'crisis-tab-know');
  panel.tabIndex = 0;

  const items = new Map<TopicId, { button: HTMLButtonElement; body: HTMLElement }>();
  let open: TopicId | null = null;
  const sync = (): void => {
    for (const [id, { button, body }] of items) {
      const on = id === open;
      button.setAttribute('aria-expanded', String(on));
      body.hidden = !on;
    }
  };

  for (const topic of knowTopics) {
    const bodyId = `crisis-topic-${topic.id}`;
    const heading = el('h2', 'crisis-topic-heading');
    const button = el('button', 'crisis-topic-button', topic.title);
    button.type = 'button';
    button.setAttribute('aria-controls', bodyId);
    button.addEventListener('click', () => {
      open = open === topic.id ? null : topic.id;
      sync();
    });
    heading.append(button);
    const body = renderBody(topic, bodyId);
    items.set(topic.id, { button, body });
    panel.append(heading, body);
  }
  sync();
  return panel;
}
