/** Pure layout helpers for the 3D pantry shelf. No DOM, no three.js. */
import type { PantryCategoryId } from './home';

/** Most items drawn for one category, so a big stock does not overflow its slot. */
export const MAX_ITEMS_PER_CATEGORY = 24;
export const SHELF_COLUMNS = 8;
/** Board heights, bottom to top. */
export const BOARD_Y: readonly number[] = [0.9, 2.1, 3.3];

/** Which board and which half of it each category sits on: two on the lower boards, one on top. */
export const SHELF_SLOTS: Readonly<Record<PantryCategoryId, { board: number; slot: 0 | 1 }>> = {
  water: { board: 0, slot: 0 },
  carbs: { board: 0, slot: 1 },
  veg: { board: 1, slot: 0 },
  protein: { board: 1, slot: 1 },
  fats: { board: 2, slot: 0 },
};

/** How many items to draw for a stock quantity. */
export function visibleItems(quantity: number): number {
  if (!Number.isFinite(quantity) || quantity <= 0) return 0;
  return Math.min(MAX_ITEMS_PER_CATEGORY, Math.ceil(quantity));
}

export interface ItemSpot {
  x: number;
  y: number;
  z: number;
}

const SLOT_WIDTH = 2.6;
const SLOT_GAP = 0.2;
const STEP = 0.3;
const ROW_STEP = 0.35;

/** Positions (board surface = y) for `count` items in a category's slot, in a front-to-back grid. */
export function itemSpots(id: PantryCategoryId, count: number): ItemSpot[] {
  const { board, slot } = SHELF_SLOTS[id];
  const left = slot === 0 ? -SLOT_WIDTH - SLOT_GAP / 2 : SLOT_GAP / 2;
  const surface = BOARD_Y[board] ?? 0;
  const spots: ItemSpot[] = [];
  for (let i = 0; i < count; i += 1) {
    const col = i % SHELF_COLUMNS;
    const row = Math.floor(i / SHELF_COLUMNS);
    spots.push({
      x: left + 0.2 + col * STEP,
      y: surface,
      z: 0.35 - row * ROW_STEP,
    });
  }
  return spots;
}
