import { describe, expect, it } from 'vitest';
import {
  addStock,
  readPantryProgress,
  resetStock,
  setPeople,
  withPantryProgress,
} from './pantry-progress';

const example = { water: 10, carbs: 1, veg: 2, protein: 3, fats: 4 };

describe('pantry progress', () => {
  it('falls back to the example when nothing is stored', () => {
    expect(readPantryProgress({}, example)).toEqual({
      stock: example,
      people: null,
      edited: false,
    });
  });

  it('ignores malformed data', () => {
    expect(readPantryProgress({ pantry: 'x' }, example).edited).toBe(false);
    expect(readPantryProgress({ pantry: { edited: 'yes' } }, example).edited).toBe(false);
  });

  it('sanitises stock and people once edited', () => {
    const read = readPantryProgress(
      { pantry: { edited: true, people: 9, stock: { water: 5, carbs: -2, veg: 'x' } } },
      example,
    );
    expect(read).toEqual({
      stock: { water: 5, carbs: 0, veg: 0, protein: 0, fats: 0 },
      people: null,
      edited: true,
    });
  });

  it('adds stock, floors at zero and marks edited', () => {
    const start = readPantryProgress({}, example);
    const more = addStock(start, 'water', 6);
    expect(more.stock.water).toBe(16);
    expect(more.edited).toBe(true);
    expect(addStock(more, 'water', -100).stock.water).toBe(0);
    expect(start.stock.water).toBe(10);
  });

  it('resets to zero stock', () => {
    const reset = resetStock(readPantryProgress({}, example));
    expect(Object.values(reset.stock).every((v) => v === 0)).toBe(true);
    expect(reset.edited).toBe(true);
  });

  it('clamps household size to 1 to 4', () => {
    const start = readPantryProgress({}, example);
    expect(setPeople(start, 0).people).toBe(1);
    expect(setPeople(start, 7).people).toBe(4);
    expect(setPeople(start, 3).people).toBe(3);
  });

  it('round-trips through storage shape', () => {
    const saved = withPantryProgress(
      { other: 1 },
      addStock(readPantryProgress({}, example), 'veg', 1),
    );
    expect(saved.other).toBe(1);
    expect(readPantryProgress(saved, example).stock.veg).toBe(3);
  });
});
