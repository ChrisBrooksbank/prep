/** Key-value backends. The only code that touches IndexedDB / localStorage. */

export interface Backend {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

const DB_NAME = 'ready';
const STORE_NAME = 'kv';

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'));
  });
}

export async function createIndexedDbBackend(factory: IDBFactory): Promise<Backend> {
  const open = factory.open(DB_NAME, 1);
  open.onupgradeneeded = () => {
    open.result.createObjectStore(STORE_NAME);
  };
  const db = await request(open);
  const store = (mode: IDBTransactionMode) =>
    db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
  return {
    get: (key) => request(store('readonly').get(key)),
    set: async (key, value) => {
      await request(store('readwrite').put(value, key));
    },
    remove: async (key) => {
      await request(store('readwrite').delete(key));
    },
  };
}

export function createLocalStorageBackend(
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>,
  prefix = 'ready:',
): Backend {
  return {
    get: async (key) => {
      const text = storage.getItem(prefix + key);
      if (text === null) return undefined;
      try {
        return JSON.parse(text) as unknown;
      } catch {
        return undefined;
      }
    },
    set: async (key, value) => {
      storage.setItem(prefix + key, JSON.stringify(value));
    },
    remove: async (key) => {
      storage.removeItem(prefix + key);
    },
  };
}

export function createMemoryBackend(): Backend {
  const map = new Map<string, unknown>();
  return {
    get: async (key) => map.get(key),
    set: async (key, value) => {
      map.set(key, structuredClone(value));
    },
    remove: async (key) => {
      map.delete(key);
    },
  };
}

/** IndexedDB if it opens, otherwise localStorage, otherwise memory. */
export async function openBestBackend(): Promise<Backend> {
  try {
    if (typeof indexedDB !== 'undefined') return await createIndexedDbBackend(indexedDB);
  } catch {
    // fall through to localStorage
  }
  try {
    if (typeof localStorage !== 'undefined') return createLocalStorageBackend(localStorage);
  } catch {
    // storage blocked
  }
  return createMemoryBackend();
}
