import { describe, expect, it } from 'vitest';
import { adviceLastUpdated, effectiveReduceMotion, readDisplaySettings } from './settings';

describe('readDisplaySettings', () => {
  it('defaults to dark and no motion override', () => {
    expect(readDisplaySettings({})).toEqual({ theme: 'dark', reduceMotion: false });
  });
  it('reads valid values and ignores invalid ones', () => {
    expect(readDisplaySettings({ theme: 'high-contrast', reduceMotion: true })).toEqual({
      theme: 'high-contrast',
      reduceMotion: true,
    });
    expect(readDisplaySettings({ theme: 'neon', reduceMotion: 'yes' })).toEqual({
      theme: 'dark',
      reduceMotion: false,
    });
  });
});

describe('effectiveReduceMotion', () => {
  it('is true if either the setting or the device asks', () => {
    expect(effectiveReduceMotion(false, false)).toBe(false);
    expect(effectiveReduceMotion(true, false)).toBe(true);
    expect(effectiveReduceMotion(false, true)).toBe(true);
  });
});

describe('adviceLastUpdated', () => {
  it('is null with no data', () => {
    expect(adviceLastUpdated([])).toBeNull();
    expect(adviceLastUpdated([{ name: 'a', items: [] }])).toBeNull();
  });
  it('returns the latest lastChecked', () => {
    expect(
      adviceLastUpdated([
        { name: 'a', items: [{ id: '1', source: 's', lastChecked: '2026-01-05' }] },
        {
          name: 'b',
          items: [
            { id: '2', source: 's', lastChecked: '2026-03-01' },
            { id: '3', source: 's', lastChecked: '2025-12-31' },
          ],
        },
      ]),
    ).toBe('2026-03-01');
  });
});
