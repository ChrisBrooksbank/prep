import { describe, expect, it } from 'vitest';
import { defaultProfile } from '../logic/profile';
import { pantryCover, roomScore } from '../logic/home';
import { exampleOwnedItemIds, homeRooms } from './home-rooms';
import { examplePantryStock, pantryCategories } from './pantry';

describe('home room data', () => {
  const items = homeRooms.flatMap((r) => r.items);

  it('has four rooms with globally unique item ids', () => {
    expect(homeRooms.map((r) => r.id)).toEqual(['lounge', 'kitchen', 'bedroom', 'bath']);
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });

  it('carries source, lastChecked and needsReview on every item', () => {
    for (const i of items) {
      expect(i.source).not.toBe('');
      expect(i.lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(i.needsReview).toBe(true);
      expect(i.weight).toBeGreaterThan(0);
      if (i.price) expect(i.price.min).toBeLessThanOrEqual(i.price.max);
    }
  });

  it('only marks real items as owned in the example', () => {
    const ids = new Set(items.map((i) => i.id));
    for (const id of exampleOwnedItemIds) expect(ids.has(id)).toBe(true);
  });

  it('drops profile-conditional items for a household without them', () => {
    const profile = {
      ...defaultProfile(),
      cooking: 'electric-hob' as const,
      pets: false,
      medication: false,
    };
    const kitchen = homeRooms.find((r) => r.id === 'kitchen')!;
    expect(roomScore(kitchen, new Set(), profile).total).toBe(kitchen.items.length - 1);
  });
});

describe('pantry data', () => {
  it('has five categories and energy shares summing to 1 for food', () => {
    expect(pantryCategories.map((c) => c.id)).toEqual(['water', 'carbs', 'veg', 'protein', 'fats']);
    const share = pantryCategories.reduce((s, c) => s + c.share, 0);
    expect(share).toBeCloseTo(1);
  });

  it('is sourced and flagged for review', () => {
    for (const c of pantryCategories) {
      expect(c.source).not.toBe('');
      expect(c.needsReview).toBe(true);
      expect(c.addSteps.length).toBeGreaterThan(0);
    }
  });

  it('gives the example stock a sensible weakest category', () => {
    const cover = pantryCover(pantryCategories, examplePantryStock, 2);
    expect(cover.weakest).not.toBeNull();
    expect(cover.overall).toBeGreaterThan(0);
  });
});
