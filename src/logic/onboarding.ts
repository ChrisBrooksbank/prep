/** Onboarding questions and answer handling. Pure: no DOM, no storage access. */
import {
  COOKING_LABELS,
  COOKING_TYPES,
  HEATING_LABELS,
  HEATING_TYPES,
  HOME_TYPE_LABELS,
  HOME_TYPES,
  normaliseProfile,
  type Profile,
} from './profile';

export type Answers = Partial<Profile>;

export interface Option {
  value: string;
  label: string;
}

export type Question =
  | { id: 'homeType' | 'heating' | 'cooking'; kind: 'choice'; prompt: string; options: Option[] }
  | { id: 'adults' | 'children'; kind: 'count'; prompt: string }
  | { id: 'pets' | 'medication' | 'vulnerable'; kind: 'yesno'; prompt: string }
  | { id: 'postcodeDistrict'; kind: 'text'; prompt: string; hint: string };

function options<T extends string>(values: readonly T[], labels: Record<T, string>): Option[] {
  return values.map((value) => ({ value, label: labels[value] }));
}

/** Fewer than ten, per the spec. One per screen. */
export const QUESTIONS: readonly Question[] = [
  {
    id: 'homeType',
    kind: 'choice',
    prompt: 'What kind of home do you live in?',
    options: options(HOME_TYPES, HOME_TYPE_LABELS),
  },
  {
    id: 'heating',
    kind: 'choice',
    prompt: 'How is your home heated?',
    options: options(HEATING_TYPES, HEATING_LABELS),
  },
  {
    id: 'cooking',
    kind: 'choice',
    prompt: 'What do you cook on?',
    options: options(COOKING_TYPES, COOKING_LABELS),
  },
  { id: 'adults', kind: 'count', prompt: 'How many adults live here?' },
  { id: 'children', kind: 'count', prompt: 'How many children live here?' },
  { id: 'pets', kind: 'yesno', prompt: 'Do you have pets?' },
  { id: 'medication', kind: 'yesno', prompt: 'Does anyone here take regular medication?' },
  {
    id: 'vulnerable',
    kind: 'yesno',
    prompt: 'Does anyone here have a mobility or health vulnerability?',
  },
  {
    id: 'postcodeDistrict',
    kind: 'text',
    prompt: 'What is your postcode district?',
    hint: 'The first half only, for example SW1A. Optional.',
  },
];

/** Returns new answers with `id` set to `value`, or cleared when `value` is undefined (skipped). */
export function setAnswer(answers: Answers, id: Question['id'], value: unknown): Answers {
  const next: Record<string, unknown> = { ...answers };
  if (value === undefined) delete next[id];
  else next[id] = value;
  return next as Answers;
}

/** Existing profile as answers, so editing later starts from what is stored. */
export function answersFromProfile(profile: Profile | null): Answers {
  return profile ? { ...profile } : {};
}

/**
 * Turns answers into a stored profile. Nothing answered gives null, so skipping
 * everything never invents facts about the home. Unanswered fields use defaults.
 */
export function buildProfile(answers: Answers): Profile | null {
  const answered = Object.values(answers).some((v) => v !== undefined);
  return answered ? normaliseProfile(answers) : null;
}

/** First run is until the person has finished or skipped onboarding once. */
export function needsOnboarding(settings: Record<string, unknown>): boolean {
  return settings.onboarded !== true;
}
