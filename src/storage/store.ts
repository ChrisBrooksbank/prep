import { openBestBackend, type Backend } from './backends';
import { CURRENT_VERSION, toAppData, type AppData } from './migrations';

const DATA_KEY = 'data';

export interface Store {
  load(): Promise<AppData>;
  save(data: AppData): Promise<void>;
  update(change: (data: AppData) => AppData): Promise<AppData>;
  clear(): Promise<void>;
}

export function createStore(backend: Backend): Store {
  const load = async (): Promise<AppData> => toAppData(await backend.get(DATA_KEY));
  const save = (data: AppData): Promise<void> =>
    backend.set(DATA_KEY, { version: CURRENT_VERSION, data });
  return {
    load,
    save,
    update: async (change) => {
      const next = change(await load());
      await save(next);
      return next;
    },
    clear: () => backend.remove(DATA_KEY),
  };
}

export async function openStore(): Promise<Store> {
  return createStore(await openBestBackend());
}
