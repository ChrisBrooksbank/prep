import { openStore, type Store } from './store';

let pending: Promise<Store> | undefined;

/** One shared store for the app. */
export function getStore(): Promise<Store> {
  pending ??= openStore();
  return pending;
}
