/** Persisted Home ownership. Pure: no DOM, no storage access. */

export interface HomeProgress {
  /** Ids of items the user owns. */
  owned: string[];
  /** True once the user has ticked or unticked anything themselves. */
  edited: boolean;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

/**
 * Reads `progress.home` defensively. Until the user edits, the example ownership
 * is returned so the UI can show it and label it as an example.
 */
export function readHomeProgress(
  progress: Record<string, unknown>,
  exampleOwned: readonly string[],
): HomeProgress {
  const raw = progress.home;
  if (typeof raw !== 'object' || raw === null) return { owned: [...exampleOwned], edited: false };
  const { owned, edited } = raw as Record<string, unknown>;
  if (edited !== true) return { owned: [...exampleOwned], edited: false };
  return { owned: stringList(owned), edited: true };
}

export function withHomeProgress(
  progress: Record<string, unknown>,
  home: HomeProgress,
): Record<string, unknown> {
  return { ...progress, home };
}

/** Tick or untick an item. Any change marks the data as the user's own. */
export function setOwned(current: HomeProgress, id: string, isOwned: boolean): HomeProgress {
  const rest = current.owned.filter((x) => x !== id);
  return { owned: isOwned ? [...rest, id] : rest, edited: true };
}
