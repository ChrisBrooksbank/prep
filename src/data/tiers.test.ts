import { describe, expect, it } from 'vitest';
import { DEFAULT_TARGET_TIER, tiers } from './tiers';

describe('tiers data', () => {
  it('defines 3, 7 and 10 day tiers in order', () => {
    expect(tiers.map((t) => t.days)).toEqual([3, 7, 10]);
    expect(tiers.map((t) => t.tier)).toEqual([1, 2, 3]);
  });

  it('carries source, lastChecked and an explanation on every tier', () => {
    for (const t of tiers) {
      expect(t.source).not.toBe('');
      expect(t.lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(t.explanation).not.toBe('');
      expect(t.sources.length).toBeGreaterThan(0);
    }
  });

  it('defaults the working target to the 7 day tier', () => {
    expect(tiers.find((t) => t.tier === DEFAULT_TARGET_TIER)?.days).toBe(7);
  });
});
