import { describe, expect, it } from 'vitest';
import { exportFileName, parseImport, serialiseExport } from './data-transfer';
import { defaultProfile } from './profile';
import { CURRENT_VERSION, type AppData } from '../storage/migrations';

const sample: AppData = {
  profile: { ...defaultProfile(), pets: true },
  settings: { theme: 'dark' },
  progress: { done: ['water'] },
};

describe('data transfer', () => {
  it('round-trips export then import', () => {
    const text = serialiseExport(sample, new Date('2026-11-01T10:00:00Z'));
    expect(JSON.parse(text)).toMatchObject({ app: 'ready', version: CURRENT_VERSION });
    expect(parseImport(text)).toEqual({ ok: true, data: sample });
  });

  it('names the file by date', () => {
    expect(exportFileName(new Date('2026-11-01T10:00:00Z'))).toBe('ready-backup-2026-11-01.json');
  });

  it('accepts a null profile', () => {
    const text = serialiseExport({ profile: null, settings: {}, progress: {} });
    expect(parseImport(text)).toEqual({
      ok: true,
      data: { profile: null, settings: {}, progress: {} },
    });
  });

  it('normalises an imported profile', () => {
    const file = {
      app: 'ready',
      version: 1,
      data: { profile: { adults: 'x' }, settings: {}, progress: {} },
    };
    const result = parseImport(JSON.stringify(file));
    expect(result.ok && result.data.profile?.adults).toBe(2);
  });

  it('upgrades an older version', () => {
    const result = parseImport(
      JSON.stringify({ app: 'ready', version: 0, data: { settings: { a: 1 } } }),
    );
    expect(result).toEqual({
      ok: true,
      data: { profile: null, settings: { a: 1 }, progress: {} },
    });
  });

  it.each([
    ['not JSON', '{oops'],
    ['an array', '[]'],
    ['another app', JSON.stringify({ app: 'other', version: 1, data: {} })],
    ['no version', JSON.stringify({ app: 'ready', data: {} })],
    ['a fractional version', JSON.stringify({ app: 'ready', version: 1.5, data: {} })],
    ['no data', JSON.stringify({ app: 'ready', version: 1 })],
    ['a newer version', JSON.stringify({ app: 'ready', version: 99, data: {} })],
    [
      'a bad profile',
      JSON.stringify({
        app: 'ready',
        version: 1,
        data: { profile: [], settings: {}, progress: {} },
      }),
    ],
  ])('rejects %s with a clear error', (_name, text) => {
    const result = parseImport(text);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/nothing was imported/);
  });
});
