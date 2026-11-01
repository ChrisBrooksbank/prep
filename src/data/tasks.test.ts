import { describe, expect, it } from 'vitest';
import { prepareTasks, pricesCheckedOn } from './tasks';

describe('prepare tasks data', () => {
  it('has the 19 prototype tasks with unique ids', () => {
    expect(prepareTasks).toHaveLength(19);
    expect(new Set(prepareTasks.map((t) => t.id)).size).toBe(19);
  });

  it('orders tasks by tier and covers all three tiers', () => {
    const tiers = prepareTasks.map((t) => t.tier);
    expect(tiers).toEqual([...tiers].sort());
    expect(new Set(tiers)).toEqual(new Set([1, 2, 3]));
  });

  it('gives every task a cost or a time, never an inverted price range', () => {
    for (const t of prepareTasks) {
      expect(t.cost !== undefined || t.time !== undefined).toBe(true);
      if (t.cost) expect(t.cost.min).toBeLessThanOrEqual(t.cost.max);
    }
  });

  it('carries source, lastChecked and needsReview, and a prices date', () => {
    expect(pricesCheckedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const t of prepareTasks) {
      expect(t.source).not.toBe('');
      expect(t.lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(t.needsReview).toBe(true);
    }
  });

  it('marks the camping stove as skippable for gas hob owners', () => {
    expect(prepareTasks.find((t) => t.id === 'camping-stove')?.skipIfGasHob).toBe(true);
  });
});
