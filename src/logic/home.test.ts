import { describe, expect, it } from 'vitest';
import {
  allRoomScores,
  categoryCover,
  filterItems,
  homeScore,
  mostValuableMissing,
  pantryCover,
  pantryPeople,
  readiness,
  roomScore,
  tiersReached,
  weakestRoom,
  type PantryCategory,
  type Room,
  type RoomItem,
} from './home';
import { defaultProfile } from './profile';

const items: RoomItem[] = [
  { id: 'a', weight: 3 },
  { id: 'b', weight: 1 },
  { id: 'gas', weight: 2, requires: 'hasGasHob' },
  { id: 'camp', weight: 2, hiddenIf: 'hasGasHob' },
  { id: 'meds', weight: 2, requires: 'medication' },
  { id: 'pet', weight: 1, requires: 'pets' },
];
const room: Room = { id: 'kitchen', items };

describe('filterItems', () => {
  it('applies profile conditions', () => {
    const p = defaultProfile();
    expect(filterItems(items, p).map((i) => i.id)).toEqual(['a', 'b', 'gas']);
    const electric = { ...p, cooking: 'electric-hob' as const, medication: true, pets: true };
    expect(filterItems(items, electric).map((i) => i.id)).toEqual([
      'a',
      'b',
      'camp',
      'meds',
      'pet',
    ]);
  });

  it('hides conditional items with no profile', () => {
    expect(filterItems(items, null).map((i) => i.id)).toEqual(['a', 'b', 'camp']);
  });
});

describe('room and home scores', () => {
  const p = defaultProfile();
  it('weights items', () => {
    // visible: a(3) b(1) gas(2) = 6
    expect(roomScore(room, new Set(['a']), p).percent).toBe(50);
    expect(roomScore(room, new Set(['a', 'b', 'gas']), p).percent).toBe(100);
    expect(roomScore(room, new Set(), p)).toMatchObject({ percent: 0, owned: 0, total: 3 });
  });

  it('ignores owned ids that are filtered out', () => {
    expect(roomScore(room, new Set(['meds']), p).percent).toBe(0);
  });

  it('scores an empty room as 0', () => {
    expect(roomScore({ id: 'x', items: [] }, new Set(), p).percent).toBe(0);
  });

  it('averages rooms for the home score', () => {
    const rooms: Room[] = [room, { id: 'bed', items: [{ id: 'torch', weight: 1 }] }];
    const scores = allRoomScores(rooms, new Set(['a', 'b', 'gas']), p);
    expect(scores.map((s) => s.percent)).toEqual([100, 0]);
    expect(homeScore(scores)).toBe(50);
    expect(homeScore([])).toBe(0);
  });
});

describe('readiness', () => {
  it('uses 75 and 50 thresholds', () => {
    expect(readiness(75)).toBe('green');
    expect(readiness(74)).toBe('amber');
    expect(readiness(50)).toBe('amber');
    expect(readiness(49)).toBe('red');
  });
});

describe('weakest room and missing item', () => {
  it('picks the lowest score, first on tie', () => {
    const scores = [
      { roomId: 'a', percent: 60, owned: 1, total: 2 },
      { roomId: 'b', percent: 20, owned: 0, total: 2 },
      { roomId: 'c', percent: 20, owned: 0, total: 2 },
    ];
    expect(weakestRoom(scores)?.roomId).toBe('b');
    expect(weakestRoom([])).toBeNull();
  });

  it('picks the heaviest missing item', () => {
    const p = defaultProfile();
    expect(mostValuableMissing(room, new Set(), p)?.id).toBe('a');
    expect(mostValuableMissing(room, new Set(['a']), p)?.id).toBe('gas');
    expect(mostValuableMissing(room, new Set(['a', 'b', 'gas']), p)).toBeNull();
  });
});

describe('pantry cover', () => {
  const categories: PantryCategory[] = [
    { id: 'water', share: 0, perUnit: 1 },
    { id: 'carbs', share: 0.5, perUnit: 1100 },
    { id: 'veg', share: 0.15, perUnit: 330 },
    { id: 'protein', share: 0.15, perUnit: 330 },
    { id: 'fats', share: 0.2, perUnit: 440 },
  ];

  it('computes water cover by litres', () => {
    expect(categoryCover(categories[0]!, 25, 1)).toBeCloseTo(10);
    expect(categoryCover(categories[0]!, 25, 2)).toBeCloseTo(5);
  });

  it('computes food cover by energy share', () => {
    // carbs: 1100 kcal/day per person; 11 units = 12100 kcal => 11 days for one person
    expect(categoryCover(categories[1]!, 11, 1)).toBeCloseTo(11);
    expect(categoryCover(categories[1]!, 11, 4)).toBeCloseTo(2.75);
  });

  it('returns 0 for no stock or no people', () => {
    expect(categoryCover(categories[1]!, 0, 2)).toBe(0);
    expect(categoryCover(categories[1]!, 5, 0)).toBe(0);
  });

  it('takes the minimum across categories and names the weakest', () => {
    const stock = { water: 50, carbs: 22, veg: 10, protein: 30, fats: 30 };
    const cover = pantryCover(categories, stock, 2);
    expect(cover.weakest).toBe('veg');
    expect(cover.overall).toBeCloseTo(categoryCover(categories[2]!, 10, 2));
  });

  it('treats missing stock as zero', () => {
    const cover = pantryCover(categories, { water: 10 }, 1);
    expect(cover.overall).toBe(0);
    expect(cover.weakest).toBe('carbs');
  });

  it('changes with household size', () => {
    const stock = { water: 30, carbs: 30, veg: 30, protein: 30, fats: 30 };
    expect(pantryCover(categories, stock, 1).overall).toBeGreaterThan(
      pantryCover(categories, stock, 3).overall,
    );
  });
});

describe('tiersReached and pantryPeople', () => {
  it('lists reached targets', () => {
    expect(tiersReached(7.5, [3, 7, 10])).toEqual([3, 7]);
    expect(tiersReached(2, [3, 7, 10])).toEqual([]);
  });

  it('defaults household size from the profile, clamped 1 to 4', () => {
    const p = defaultProfile();
    expect(pantryPeople(p)).toBe(2);
    expect(pantryPeople({ ...p, adults: 4, children: 3 })).toBe(4);
    expect(pantryPeople({ ...p, adults: 0, children: 0 })).toBe(1);
    expect(pantryPeople(null)).toBe(2);
  });
});
