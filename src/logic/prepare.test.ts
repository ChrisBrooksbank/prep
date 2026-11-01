import { describe, expect, it } from 'vitest';
import { prepareTasks } from '../data/tasks';
import {
  allTierProgress,
  comingUp,
  costLine,
  currentTier,
  nextTask,
  readPrepareProgress,
  setTaskDone,
  skipInProgress,
  scaleTask,
  skipTask,
  tierProgress,
  visibleTasks,
  withoutPrepareProgress,
  withPrepareProgress,
  waterLitres,
} from './prepare';
import { defaultProfile, type Profile } from './profile';

const base: Profile = { ...defaultProfile(), adults: 2, children: 0 };
const byId = (id: string) => prepareTasks.find((t) => t.id === id)!;
const tier1 = prepareTasks.filter((t) => t.tier === 1).map((t) => t.id);

describe('tier progress', () => {
  it('counts done tasks per tier', () => {
    const p = tierProgress(prepareTasks, new Set(['torch', 'radio', 'cash']), 1);
    expect(p.done).toBe(2);
    expect(p.total).toBe(tier1.length);
    expect(p.complete).toBe(false);
  });
  it('marks a finished tier complete', () => {
    expect(tierProgress(prepareTasks, new Set(tier1), 1).complete).toBe(true);
  });
  it('reports all three tiers', () => {
    expect(allTierProgress(prepareTasks, new Set())).toHaveLength(3);
  });
});

describe('currentTier', () => {
  it('starts at tier 1', () => {
    expect(currentTier(prepareTasks, new Set())).toBe(1);
  });
  it('moves on when a tier is complete', () => {
    expect(currentTier(prepareTasks, new Set(tier1))).toBe(2);
  });
  it('is null when everything is done', () => {
    expect(currentTier(prepareTasks, new Set(prepareTasks.map((t) => t.id)))).toBeNull();
  });
});

describe('nextTask and skip', () => {
  const three = prepareTasks.slice(0, 3);
  const done = new Set<string>();
  it('returns the first open task', () => {
    expect(nextTask(three, done)?.id).toBe(three[0]!.id);
  });
  it('skips to the next task', () => {
    const skipped = skipTask(three, done, [], three[0]!.id);
    expect(nextTask(three, done, skipped)?.id).toBe(three[1]!.id);
  });
  it('wraps around after every task is skipped', () => {
    let skipped: string[] = [];
    for (const t of three) skipped = skipTask(three, done, skipped, t.id);
    expect(skipped).toEqual([]);
    expect(nextTask(three, done, skipped)?.id).toBe(three[0]!.id);
  });
  it('ignores done tasks and returns null when none are left', () => {
    const all = new Set(three.map((t) => t.id));
    expect(nextTask(three, all)).toBeNull();
    expect(nextTask(three, new Set([three[0]!.id]))?.id).toBe(three[1]!.id);
  });
  it('lists the next four after the current one', () => {
    expect(comingUp(prepareTasks, done).map((t) => t.id)).toEqual(
      prepareTasks.slice(1, 5).map((t) => t.id),
    );
  });
  it('puts skipped tasks at the back of coming up', () => {
    const skipped = [prepareTasks[0]!.id];
    const ids = comingUp(prepareTasks, done, skipped, 100).map((t) => t.id);
    expect(ids[ids.length - 1]).toBe(prepareTasks[0]!.id);
  });
});

describe('household scaling', () => {
  it('scales water by household size and tier days', () => {
    expect(waterLitres(byId('water-3'), base)).toBe(15);
    expect(waterLitres(byId('water-7'), { ...base, adults: 2, children: 2 })).toBe(70);
  });
  it('describes food days and sleeping bags', () => {
    expect(scaleTask(byId('food-7'), base).detail).toContain('7 days of food for 2 people');
    expect(scaleTask(byId('sleeping-bags'), { ...base, children: 1 }).detail).toContain(
      '3 sleeping bags',
    );
    expect(scaleTask(byId('torch'), base).detail).toBeNull();
  });
  it('drops the camping stove for gas hob owners only', () => {
    const gas = visibleTasks(prepareTasks, { ...base, cooking: 'gas-hob' });
    const electric = visibleTasks(prepareTasks, { ...base, cooking: 'induction' });
    expect(gas.some((t) => t.id === 'camping-stove')).toBe(false);
    expect(electric.some((t) => t.id === 'camping-stove')).toBe(true);
  });
});

describe('prepare progress storage', () => {
  it('reads malformed progress as empty', () => {
    expect(readPrepareProgress({})).toEqual({ done: [], skipped: [] });
    expect(readPrepareProgress({ prepare: 'x' })).toEqual({ done: [], skipped: [] });
    expect(readPrepareProgress({ prepare: { done: ['a', 1, 'a'], skipped: 'b' } })).toEqual({
      done: ['a'],
      skipped: [],
    });
  });
  it('keeps other progress keys when writing and when removing', () => {
    const next = withPrepareProgress({ crisis: { ticks: {} } }, { done: ['torch'], skipped: [] });
    expect(next.crisis).toEqual({ ticks: {} });
    const cleared = withoutPrepareProgress(next);
    expect(cleared).toEqual({ crisis: { ticks: {} } });
  });
  it('marks done and undone, clearing skips', () => {
    const a = setTaskDone({ done: [], skipped: ['torch'] }, 'torch', true);
    expect(a).toEqual({ done: ['torch'], skipped: [] });
    expect(setTaskDone(a, 'torch', false).done).toEqual([]);
  });
  it('skips with wraparound', () => {
    const ids = prepareTasks.map((t) => t.id);
    let p = { done: [] as string[], skipped: [] as string[] };
    for (const id of ids) p = skipInProgress(prepareTasks, p, id);
    expect(p.skipped).toEqual([]);
    expect(skipInProgress(prepareTasks, p, ids[0]!).skipped).toEqual([ids[0]]);
  });
});

describe('costLine', () => {
  it('formats ranges and times', () => {
    expect(costLine(byId('torch'))).toBe('about £6 to £12');
    expect(costLine(byId('isolators'))).toBe('10 min');
  });
});
