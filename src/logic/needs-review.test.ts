import { describe, expect, it } from 'vitest';
import type { Dataset } from '../data/sourced';
import { findNeedsReview } from './needs-review';

const datasets: Dataset[] = [
  {
    name: 'tiers',
    items: [
      { id: 'a', source: 'GOV.UK', lastChecked: '2026-10-01' },
      { id: 'b', source: 'mcf.se', lastChecked: '2026-10-02', needsReview: true },
    ],
  },
  {
    name: 'topics',
    items: [
      { id: 'c', source: 'NHS', lastChecked: '2026-10-03', needsReview: false },
      { id: 'd', source: 'BBK', lastChecked: '2026-10-04', needsReview: true },
    ],
  },
];

describe('findNeedsReview', () => {
  it('lists only flagged items, in order', () => {
    expect(findNeedsReview(datasets)).toEqual([
      { dataset: 'tiers', id: 'b', source: 'mcf.se', lastChecked: '2026-10-02' },
      { dataset: 'topics', id: 'd', source: 'BBK', lastChecked: '2026-10-04' },
    ]);
  });
  it('returns nothing for no datasets', () => {
    expect(findNeedsReview([])).toEqual([]);
  });
});
