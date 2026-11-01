import { describe, expect, it } from 'vitest';
import { createLocalStorageBackend, createMemoryBackend } from './backends';
import { CURRENT_VERSION, MigrationError, migrate, toAppData } from './migrations';
import { createStore } from './store';

class FakeStorage {
  items = new Map<string, string>();
  getItem(k: string) {
    return this.items.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.items.set(k, v);
  }
  removeItem(k: string) {
    this.items.delete(k);
  }
}

describe('migrate', () => {
  const steps = [
    (d: unknown) => ({ ...(d as object), a: 1 }),
    (d: unknown) => ({ ...(d as object), b: 2 }),
  ];

  it('runs every step from the stored version', () => {
    expect(migrate({ version: 0, data: {} }, steps, 2)).toEqual({
      version: 2,
      data: { a: 1, b: 2 },
    });
    expect(migrate({ version: 1, data: { a: 1 } }, steps, 2).data).toEqual({ a: 1, b: 2 });
  });

  it('leaves current data alone', () => {
    expect(migrate({ version: 2, data: 'x' }, steps, 2)).toEqual({ version: 2, data: 'x' });
  });

  it('rejects newer or invalid versions', () => {
    expect(() => migrate({ version: 3, data: {} }, steps, 2)).toThrow(MigrationError);
    expect(() => migrate({ version: -1, data: {} }, steps, 2)).toThrow(MigrationError);
  });
});

describe('toAppData', () => {
  it('returns empty data when nothing is stored', () => {
    expect(toAppData(undefined)).toEqual({ profile: null, settings: {}, progress: {} });
  });

  it('migrates unversioned data to the current shape', () => {
    expect(toAppData({ profile: { adults: 2 }, junk: true })).toEqual({
      profile: { adults: 2 },
      settings: {},
      progress: {},
    });
  });
});

describe('store', () => {
  it('round-trips, updates and clears', async () => {
    const store = createStore(createMemoryBackend());
    expect((await store.load()).profile).toBeNull();
    await store.update((d) => ({ ...d, profile: { adults: 2 } }));
    expect((await store.load()).profile).toEqual({ adults: 2 });
    await store.clear();
    expect((await store.load()).profile).toBeNull();
  });

  it('migrates old stored data on load and saves the current version', async () => {
    const backend = createMemoryBackend();
    await backend.set('data', { version: 0, data: { settings: { theme: 'light' } } });
    const store = createStore(backend);
    expect((await store.load()).settings).toEqual({ theme: 'light' });
    await store.save(await store.load());
    expect(await backend.get('data')).toMatchObject({ version: CURRENT_VERSION });
  });

  it('works over the localStorage backend and survives corrupt text', async () => {
    const fake = new FakeStorage();
    const store = createStore(createLocalStorageBackend(fake));
    await store.update((d) => ({ ...d, progress: { done: ['a'] } }));
    expect((await store.load()).progress).toEqual({ done: ['a'] });
    fake.setItem('ready:data', '{not json');
    expect((await store.load()).progress).toEqual({});
  });
});
