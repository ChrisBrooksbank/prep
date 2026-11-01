import {
  QUESTIONS,
  answersFromProfile,
  buildProfile,
  setAnswer,
  type Answers,
  type Question,
} from '../logic/onboarding';
import type { Profile } from '../logic/profile';

function field(question: Question, answers: Answers): { el: HTMLElement; read(): unknown } {
  const current = answers[question.id];
  const fieldset = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = question.prompt;
  fieldset.append(legend);

  const radio = (value: string, label: string, checked: boolean): HTMLLabelElement => {
    const wrap = document.createElement('label');
    wrap.className = 'choice';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = question.id;
    input.value = value;
    input.checked = checked;
    wrap.append(input, document.createTextNode(label));
    return wrap;
  };
  const checkedValue = (): string | undefined =>
    fieldset.querySelector<HTMLInputElement>('input:checked')?.value;

  if (question.kind === 'choice') {
    for (const o of question.options) fieldset.append(radio(o.value, o.label, current === o.value));
    return { el: fieldset, read: checkedValue };
  }
  if (question.kind === 'yesno') {
    fieldset.append(radio('yes', 'Yes', current === true), radio('no', 'No', current === false));
    return {
      el: fieldset,
      read: () => {
        const v = checkedValue();
        return v === undefined ? undefined : v === 'yes';
      },
    };
  }
  const input = document.createElement('input');
  input.name = question.id;
  input.setAttribute('aria-label', question.prompt);
  if (question.kind === 'count') {
    input.type = 'number';
    input.min = '0';
    input.max = '99';
    input.inputMode = 'numeric';
    if (typeof current === 'number') input.value = String(current);
    fieldset.append(input);
    return {
      el: fieldset,
      read: () => (input.value.trim() === '' ? undefined : Number(input.value)),
    };
  }
  input.type = 'text';
  input.autocomplete = 'off';
  input.maxLength = 8;
  if (typeof current === 'string') input.value = current;
  const hint = document.createElement('p');
  hint.className = 'hint';
  hint.textContent = question.hint;
  fieldset.append(hint, input);
  return { el: fieldset, read: () => (input.value.trim() === '' ? undefined : input.value) };
}

/**
 * One question per screen. Every question can be skipped, and "Skip setup"
 * ends early. `onDone` receives the profile (null if nothing was answered).
 */
export function renderOnboarding(
  existing: Profile | null,
  onDone: (profile: Profile | null) => void,
): HTMLElement {
  const el = document.createElement('section');
  el.setAttribute('aria-labelledby', 'area-title');
  let answers = answersFromProfile(existing);
  let index = 0;

  const finish = (): void => onDone(buildProfile(answers));

  const draw = (): void => {
    const question = QUESTIONS[index];
    if (!question) return finish();
    const { el: fieldEl, read } = field(question, answers);
    const isLast = index === QUESTIONS.length - 1;

    const title = document.createElement('h1');
    title.id = 'area-title';
    title.textContent = 'Your household';
    const progress = document.createElement('p');
    progress.className = 'progress';
    progress.textContent = `Question ${index + 1} of ${QUESTIONS.length}`;

    const button = (label: string, action: () => void, className = ''): HTMLButtonElement => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.className = className;
      b.addEventListener('click', action);
      return b;
    };
    const go = (value: unknown): void => {
      answers = setAnswer(answers, question.id, value);
      index += 1;
      draw();
    };

    const actions = document.createElement('div');
    actions.className = 'actions';
    if (index > 0) {
      actions.append(
        button('Back', () => {
          index -= 1;
          draw();
        }),
      );
    }
    actions.append(
      button('Skip', () => go(undefined)),
      button(isLast ? 'Finish' : 'Next', () => go(read()), 'primary'),
    );
    const skipAll = button('Skip setup', finish, 'link');

    el.replaceChildren(title, progress, fieldEl, actions, skipAll);
    fieldEl.querySelector<HTMLElement>('input')?.focus();
  };

  draw();
  return el;
}
