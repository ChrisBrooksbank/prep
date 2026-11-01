import { readingGroups, readingLinks } from '../data/reading';
import { prepareTasks, pricesCheckedOn, type PrepareTask } from '../data/tasks';
import { tiers } from '../data/tiers';
import {
  allTierProgress,
  comingUp,
  costLine,
  currentTier,
  nextTask,
  readPrepareProgress,
  scaleTask,
  setTaskDone,
  skipInProgress,
  visibleTasks,
  withPrepareProgress,
  type PrepareProgress,
} from '../logic/prepare';
import { defaultProfile, normaliseProfile } from '../logic/profile';
import { groupReading } from '../logic/reading';
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

/** Prepare area: this week's one thing, coming up, and the 3 / 7 / 10 day ladder. */
export async function renderPrepare(): Promise<HTMLElement> {
  const store = await getStore();
  const data = await store.load();
  const profile = normaliseProfile(data.profile) ?? defaultProfile();
  const tasks = visibleTasks(prepareTasks, profile);
  let progress: PrepareProgress = readPrepareProgress(data.progress);

  const root = el('section');
  root.setAttribute('aria-labelledby', 'area-title');

  const persist = async (next: PrepareProgress): Promise<void> => {
    progress = next;
    await store.update((d) => ({ ...d, progress: withPrepareProgress(d.progress, next) }));
  };

  const draw = (focusSelector?: string): void => {
    const done = new Set(progress.done);
    const title = el('h1', '', 'Prepare');
    title.id = 'area-title';

    // This week's one thing
    const one = el('div', 'prepare-card');
    one.setAttribute('role', 'group');
    one.setAttribute('aria-labelledby', 'one-title');
    const oneTitle = el('h2', '', "This week's one thing");
    oneTitle.id = 'one-title';
    one.append(oneTitle);
    const current = nextTask(tasks, done, progress.skipped);
    if (current) {
      const scaled = scaleTask(current, profile);
      one.append(el('p', 'prepare-task-title', current.title), el('p', '', current.why));
      if (scaled.detail) one.append(el('p', 'prepare-detail', scaled.detail));
      const meta = costLine(current);
      if (meta) one.append(el('p', 'hint', meta));
      const actions = el('div', 'actions');
      const doneBtn = el('button', 'primary', 'Done');
      doneBtn.type = 'button';
      doneBtn.dataset.action = 'done';
      doneBtn.addEventListener('click', () => {
        void persist(setTaskDone(progress, current.id, true)).then(() => draw());
      });
      const skipBtn = el('button', '', 'Not now');
      skipBtn.type = 'button';
      skipBtn.dataset.action = 'skip';
      skipBtn.addEventListener('click', () => {
        void persist(skipInProgress(tasks, progress, current.id)).then(() => draw());
      });
      actions.append(doneBtn, skipBtn);
      one.append(actions);
    } else {
      one.append(
        el('p', '', 'Everything on the list is done. Well done. Nothing more to do this week.'),
      );
    }

    // Coming up
    const upcoming = comingUp(tasks, done, progress.skipped);
    const parts: HTMLElement[] = [title, one];
    if (upcoming.length > 0) {
      const section = el('div', 'prepare-block');
      section.append(el('h2', '', 'Coming up'));
      const list = el('ul', 'prepare-list');
      for (const task of upcoming) list.append(taskRow(task));
      section.append(list);
      parts.push(section);
    }

    // Ladder
    const currentTierNumber = currentTier(tasks, done);
    const ladder = el('div', 'prepare-block');
    ladder.append(el('h2', '', 'Your ladder'));
    const rungs = el('ol', 'prepare-ladder');
    for (const p of allTierProgress(tasks, done)) {
      const tier = tiers.find((t) => t.tier === p.tier)!;
      const rung = el('li', 'prepare-rung');
      rung.dataset.tier = String(p.tier);
      if (p.tier === currentTierNumber) {
        rung.classList.add('current');
        rung.setAttribute('aria-current', 'step');
      }
      rung.append(el('h3', '', `${tier.label} · ${tier.country}`));
      rung.append(el('p', 'hint', tier.explanation));
      const bar = el('progress');
      bar.max = Math.max(p.total, 1);
      bar.value = p.done;
      bar.setAttribute('aria-label', `${tier.label} progress`);
      const count = el('p', 'prepare-count', `${p.done} of ${p.total} done`);
      count.dataset.tierCount = String(p.tier);
      rung.append(bar, count);
      rungs.append(rung);
    }
    ladder.append(rungs);
    parts.push(ladder);
    parts.push(el('p', 'hint', `Prices are rough UK ranges, checked ${pricesCheckedOn}.`));

    // Read
    const read = el('div', 'prepare-block');
    read.id = 'read';
    read.append(
      el('h2', '', 'Bedtime reading'),
      el(
        'p',
        'hint',
        'This list is saved on your device, but the pages themselves need a connection.',
      ),
    );
    for (const section of groupReading(readingLinks, readingGroups)) {
      read.append(el('h3', '', section.group));
      const list = el('ul', 'reading-list');
      for (const l of section.links) {
        const li = el('li');
        const a = el('a', '', l.title);
        a.href = l.url;
        a.target = '_blank';
        a.rel = 'noopener';
        li.append(a, el('span', 'hint', l.blurb));
        list.append(li);
      }
      read.append(list);
    }
    parts.push(read);

    root.replaceChildren(...parts);
    if (focusSelector) root.querySelector<HTMLElement>(focusSelector)?.focus();

    function taskRow(task: PrepareTask): HTMLElement {
      const li = el('li', 'prepare-row');
      const label = el('label', 'choice');
      const box = el('input');
      box.type = 'checkbox';
      box.checked = done.has(task.id);
      box.dataset.task = task.id;
      box.addEventListener('change', () => {
        void persist(setTaskDone(progress, task.id, box.checked)).then(() => draw());
      });
      const text = el('span', 'prepare-row-text');
      text.append(el('span', '', task.title));
      const scaled = scaleTask(task, profile);
      const meta = [scaled.detail, costLine(task)].filter((s): s is string => s !== null);
      if (meta.length > 0) text.append(el('span', 'hint', meta.join(' · ')));
      label.append(box, text);
      li.append(label);
      return li;
    }
  };

  draw();
  return root;
}
