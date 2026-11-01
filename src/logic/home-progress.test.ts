import { describe, expect, it } from 'vitest';
import { readHomeProgress, setOwned, withHomeProgress } from './home-progress';

const example = ['a', 'b'];

describe('home progress', () => {
  it('falls back to the example when nothing is stored', () => {
    expect(readHomeProgress({}, example)).toEqual({ owned: ['a', 'b'], edited: false });
  });

  it('ignores malformed data', () => {
    expect(readHomeProgress({ home: 'x' }, example).edited).toBe(false);
    expect(readHomeProgress({ home: { owned: [1], edited: 'yes' } }, example).edited).toBe(false);
  });

  it('keeps only string ids once edited', () => {
    expect(readHomeProgress({ home: { owned: ['c', 3], edited: true } }, example)).toEqual({
      owned: ['c'],
      edited: true,
    });
  });

  it('setOwned adds, removes and marks edited without duplicates', () => {
    const start = readHomeProgress({}, example);
    const added = setOwned(start, 'c', true);
    expect(added).toEqual({ owned: ['a', 'b', 'c'], edited: true });
    expect(setOwned(added, 'c', true).owned).toEqual(['a', 'b', 'c']);
    expect(setOwned(added, 'a', false).owned).toEqual(['b', 'c']);
  });

  it('withHomeProgress keeps other keys', () => {
    expect(withHomeProgress({ prepare: 1 }, { owned: [], edited: true })).toEqual({
      prepare: 1,
      home: { owned: [], edited: true },
    });
  });
});
