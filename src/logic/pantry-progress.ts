/** Persisted pantry stock. Pure: no DOM, no storage access. */
import type { PantryCategoryId } from './home';

export type PantryStock = Record<PantryCategoryId, number>;

export interface PantryProgress {
  stock: PantryStock;
  /** Household size chosen by the user; null means use the profile default. */
  people: number | null;
  /** True once the user has changed anything themselves. */
  edited: boolean;
}

const IDS: readonly PantryCategoryId[] = ['water', 'carbs', 'veg', 'protein', 'fats'];

function quantity(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

function people(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 4
    ? value
    : null;
}

function copyStock(stock: Readonly<Record<PantryCategoryId, number>>): PantryStock {
  return { ...stock };
}

/**
 * Reads `progress.pantry` defensively. Until the user edits, the example stock is
 * returned so the UI can show it and label it as an example.
 */
export function readPantryProgress(
  progress: Record<string, unknown>,
  example: Readonly<Record<PantryCategoryId, number>>,
): PantryProgress {
  const fallback: PantryProgress = { stock: copyStock(example), people: null, edited: false };
  const raw = progress.pantry;
  if (typeof raw !== 'object' || raw === null) return fallback;
  const { stock, people: p, edited } = raw as Record<string, unknown>;
  if (edited !== true) return fallback;
  const source =
    typeof stock === 'object' && stock !== null ? (stock as Record<string, unknown>) : {};
  const result = {} as PantryStock;
  for (const id of IDS) result[id] = quantity(source[id]);
  return { stock: result, people: people(p), edited: true };
}

export function withPantryProgress(
  progress: Record<string, unknown>,
  pantry: PantryProgress,
): Record<string, unknown> {
  return { ...progress, pantry };
}

/** Adds (or removes, if negative) units of stock; never goes below zero. */
export function addStock(
  current: PantryProgress,
  id: PantryCategoryId,
  amount: number,
): PantryProgress {
  const next = Math.max(0, quantity(current.stock[id]) + amount);
  return { ...current, stock: { ...current.stock, [id]: next }, edited: true };
}

/** Clears all stock to zero. This is the user's own data, so it is no longer an example. */
export function resetStock(current: PantryProgress): PantryProgress {
  const stock = {} as PantryStock;
  for (const id of IDS) stock[id] = 0;
  return { ...current, stock, edited: true };
}

/** Sets the household size, clamped to 1 to 4. */
export function setPeople(current: PantryProgress, count: number): PantryProgress {
  const clamped = Math.min(4, Math.max(1, Math.round(count)));
  return { ...current, people: clamped, edited: true };
}
