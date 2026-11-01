/** Home model and pantry logic. Pure: no DOM, no storage access. */
import { matchesCondition, type Profile, type ProfileCondition } from './profile';

/** Daily need per person. Figures follow the BBK checklist and need review. */
export const DAILY_KCAL = 2200;
export const DAILY_WATER_LITRES = 2.5;

/** Score thresholds for colouring a room. */
export const GREEN_AT = 75;
export const AMBER_AT = 50;

export type Readiness = 'green' | 'amber' | 'red';

export interface RoomItem {
  id: string;
  /** Importance weight; higher counts for more in the room score. */
  weight: number;
  /** Only shown when this profile condition holds. */
  requires?: ProfileCondition;
  /** Hidden when this profile condition holds (e.g. no gas hob item for gas owners). */
  hiddenIf?: ProfileCondition;
}

export interface Room<I extends RoomItem = RoomItem> {
  id: string;
  items: readonly I[];
}

export interface RoomScore {
  roomId: string;
  /** Whole percent, 0 to 100. */
  percent: number;
  owned: number;
  total: number;
}

/** Items that apply to this household. A null profile hides conditional items. */
export function filterItems<I extends RoomItem>(items: readonly I[], profile: Profile | null): I[] {
  return items.filter((item) => {
    if (item.requires && !matchesCondition(profile, item.requires)) return false;
    if (item.hiddenIf && profile && matchesCondition(profile, item.hiddenIf)) return false;
    return true;
  });
}

/** Weighted share of items owned, as a whole percent. An empty room scores 0. */
export function roomScore<I extends RoomItem>(
  room: Room<I>,
  owned: ReadonlySet<string>,
  profile: Profile | null,
): RoomScore {
  const items = filterItems(room.items, profile);
  let totalWeight = 0;
  let ownedWeight = 0;
  let ownedCount = 0;
  for (const item of items) {
    totalWeight += item.weight;
    if (owned.has(item.id)) {
      ownedWeight += item.weight;
      ownedCount += 1;
    }
  }
  const percent = totalWeight > 0 ? Math.round((ownedWeight / totalWeight) * 100) : 0;
  return { roomId: room.id, percent, owned: ownedCount, total: items.length };
}

export function allRoomScores<I extends RoomItem>(
  rooms: readonly Room<I>[],
  owned: ReadonlySet<string>,
  profile: Profile | null,
): RoomScore[] {
  return rooms.map((r) => roomScore(r, owned, profile));
}

/** Whole-home score: mean of room scores, rounded. */
export function homeScore(scores: readonly RoomScore[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, s) => sum + s.percent, 0) / scores.length);
}

export function readiness(percent: number): Readiness {
  if (percent >= GREEN_AT) return 'green';
  if (percent >= AMBER_AT) return 'amber';
  return 'red';
}

/** The lowest-scoring room; the first one wins a tie. Null when there are no rooms. */
export function weakestRoom(scores: readonly RoomScore[]): RoomScore | null {
  let weakest: RoomScore | null = null;
  for (const s of scores) {
    if (weakest === null || s.percent < weakest.percent) weakest = s;
  }
  return weakest;
}

/** The highest-weight item not yet owned in a room; the first one wins a tie. */
export function mostValuableMissing<I extends RoomItem>(
  room: Room<I>,
  owned: ReadonlySet<string>,
  profile: Profile | null,
): I | null {
  let best: I | null = null;
  for (const item of filterItems(room.items, profile)) {
    if (owned.has(item.id)) continue;
    if (best === null || item.weight > best.weight) best = item;
  }
  return best;
}

/* ---------------------------------------------------------------- Pantry */

export type PantryCategoryId = 'water' | 'carbs' | 'veg' | 'protein' | 'fats';

export interface PantryCategory {
  id: PantryCategoryId;
  /** Share of daily energy; unused for water. */
  share: number;
  /** kcal per unit (litres per unit for water). */
  perUnit: number;
}

/** Days of cover for one category for a given number of people. */
export function categoryCover(category: PantryCategory, quantity: number, people: number): number {
  if (people <= 0 || quantity <= 0) return 0;
  const perDay =
    category.id === 'water' ? DAILY_WATER_LITRES * people : category.share * DAILY_KCAL * people;
  const supplied = quantity * category.perUnit;
  return supplied / perDay;
}

export interface PantryCover {
  perCategory: { id: PantryCategoryId; days: number }[];
  /** Minimum across categories. */
  overall: number;
  weakest: PantryCategoryId | null;
}

export function pantryCover(
  categories: readonly PantryCategory[],
  stock: Readonly<Partial<Record<PantryCategoryId, number>>>,
  people: number,
): PantryCover {
  const perCategory = categories.map((c) => ({
    id: c.id,
    days: categoryCover(c, stock[c.id] ?? 0, people),
  }));
  let weakest: PantryCategoryId | null = null;
  let overall = 0;
  perCategory.forEach((c, i) => {
    if (i === 0 || c.days < overall) {
      overall = c.days;
      weakest = c.id;
    }
  });
  return { perCategory, overall, weakest };
}

/** Which of the official day targets the cover reaches, e.g. [3, 7]. */
export function tiersReached(days: number, targets: readonly number[]): number[] {
  return targets.filter((t) => days >= t);
}

/** Household size selector range is 1 to 4; default comes from the profile. */
export function pantryPeople(profile: Profile | null): number {
  if (!profile) return 2;
  const size = profile.adults + profile.children;
  return Math.min(4, Math.max(1, size));
}
