/** Prepare programme logic. Pure: no DOM, no storage access. */
import type { PrepareTask } from '../data/tasks';
import { tiers, type TierNumber } from '../data/tiers';
import { hasGasHob, type Profile } from './profile';

export interface TierProgress {
  tier: TierNumber;
  done: number;
  total: number;
  complete: boolean;
}

/** Tasks that apply to this household: gas hob owners do not get the camping stove. */
export function visibleTasks(tasks: readonly PrepareTask[], profile: Profile): PrepareTask[] {
  const gas = hasGasHob(profile);
  return tasks.filter((t) => !(t.skipIfGasHob && gas));
}

export function tierProgress(
  tasks: readonly PrepareTask[],
  done: ReadonlySet<string>,
  tier: TierNumber,
): TierProgress {
  const inTier = tasks.filter((t) => t.tier === tier);
  const count = inTier.filter((t) => done.has(t.id)).length;
  return {
    tier,
    done: count,
    total: inTier.length,
    complete: inTier.length > 0 && count === inTier.length,
  };
}

export function allTierProgress(
  tasks: readonly PrepareTask[],
  done: ReadonlySet<string>,
): TierProgress[] {
  return tiers.map((t) => tierProgress(tasks, done, t.tier));
}

/** The current tier is the first incomplete tier, or null when every tier is complete. */
export function currentTier(
  tasks: readonly PrepareTask[],
  done: ReadonlySet<string>,
): TierNumber | null {
  const first = allTierProgress(tasks, done).find((p) => !p.complete);
  return first ? first.tier : null;
}

/**
 * Not-done tasks in programme order, with skipped tasks moved to the back
 * (in the order they were skipped), so skipping wraps around.
 */
export function taskQueue(
  tasks: readonly PrepareTask[],
  done: ReadonlySet<string>,
  skipped: readonly string[] = [],
): PrepareTask[] {
  const open = tasks.filter((t) => !done.has(t.id));
  const skippedSet = new Set(skipped);
  const fresh = open.filter((t) => !skippedSet.has(t.id));
  const later = skipped
    .map((id) => open.find((t) => t.id === id))
    .filter((t): t is PrepareTask => t !== undefined);
  return [...fresh, ...later];
}

/** "This week's one thing": the next task, or null when everything is done. */
export function nextTask(
  tasks: readonly PrepareTask[],
  done: ReadonlySet<string>,
  skipped: readonly string[] = [],
): PrepareTask | null {
  return taskQueue(tasks, done, skipped)[0] ?? null;
}

/** "Coming up": the four tasks after the current one. */
export function comingUp(
  tasks: readonly PrepareTask[],
  done: ReadonlySet<string>,
  skipped: readonly string[] = [],
  count = 4,
): PrepareTask[] {
  return taskQueue(tasks, done, skipped).slice(1, 1 + count);
}

/** Skip a task. Once every open task has been skipped, the cycle starts again. */
export function skipTask(
  tasks: readonly PrepareTask[],
  done: ReadonlySet<string>,
  skipped: readonly string[],
  id: string,
): string[] {
  const next = [...skipped.filter((s) => s !== id), id];
  const open = tasks.filter((t) => !done.has(t.id));
  const allSkipped = open.every((t) => next.includes(t.id));
  return allSkipped ? [] : next;
}

export function tierDays(tier: TierNumber): number {
  return tiers.find((t) => t.tier === tier)?.days ?? 0;
}

export function householdSize(profile: Profile): number {
  return profile.adults + profile.children;
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** Litres of water for the household for a task's tier. */
export function waterLitres(task: PrepareTask, profile: Profile): number {
  return Math.ceil(householdSize(profile) * tierDays(task.tier) * (task.perPerson ?? 2.5));
}

export function sleepingBagCount(profile: Profile): number {
  return profile.adults + profile.children;
}

export interface ScaledTask {
  task: PrepareTask;
  /** Household-specific detail line, or null when the task does not scale. */
  detail: string | null;
}

/** Household-specific wording for tasks that scale with the profile. */
export function scaleTask(task: PrepareTask, profile: Profile): ScaledTask {
  const people = plural(householdSize(profile), 'person', 'people');
  switch (task.scaling) {
    case 'water':
      return { task, detail: `${waterLitres(task, profile)} litres for ${people}` };
    case 'foodDays':
      return { task, detail: `${tierDays(task.tier)} days of food for ${people}` };
    case 'sleepingBags':
      return {
        task,
        detail: `${plural(sleepingBagCount(profile), 'sleeping bag', 'sleeping bags')} (${plural(profile.adults, 'adult', 'adults')}, ${plural(profile.children, 'child', 'children')})`,
      };
    default:
      return { task, detail: null };
  }
}
