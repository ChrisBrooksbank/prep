import { describe, expect, it } from 'vitest';
import {
  BOARD_Y,
  itemSpots,
  MAX_ITEMS_PER_CATEGORY,
  SHELF_SLOTS,
  visibleItems,
} from './pantry-scene';

describe('pantry shelf layout', () => {
  it('caps and rounds visible items', () => {
    expect(visibleItems(0)).toBe(0);
    expect(visibleItems(-3)).toBe(0);
    expect(visibleItems(NaN)).toBe(0);
    expect(visibleItems(2.2)).toBe(3);
    expect(visibleItems(500)).toBe(MAX_ITEMS_PER_CATEGORY);
  });
  it('places every category on one of the three boards', () => {
    for (const { board } of Object.values(SHELF_SLOTS)) {
      expect(board).toBeGreaterThanOrEqual(0);
      expect(board).toBeLessThan(BOARD_Y.length);
    }
    expect(BOARD_Y).toHaveLength(3);
  });
  it('returns one spot per item, none overlapping within a slot', () => {
    const spots = itemSpots('water', MAX_ITEMS_PER_CATEGORY);
    expect(spots).toHaveLength(MAX_ITEMS_PER_CATEGORY);
    const keys = new Set(spots.map((s) => `${s.x.toFixed(3)}:${s.z.toFixed(3)}`));
    expect(keys.size).toBe(spots.length);
  });
  it('keeps the two slots on a board apart', () => {
    const a = itemSpots('water', MAX_ITEMS_PER_CATEGORY);
    const b = itemSpots('carbs', MAX_ITEMS_PER_CATEGORY);
    expect(Math.max(...a.map((s) => s.x))).toBeLessThan(Math.min(...b.map((s) => s.x)));
  });
});
