import type { PantryCategory, PantryCategoryId } from '../logic/home';
import type { Sourced } from './sourced';

export interface PantryCategoryData extends PantryCategory, Sourced {
  name: string;
  /** What one unit is, in plain words. */
  unit: string;
  /** Quick-add button sizes, in units. */
  addSteps: readonly number[];
}

/**
 * Stock shown until the user enters their own. The UI must label it as an example.
 */
export const pantryIsExampleUntilEdited = true;

export const examplePantryStock: Readonly<Record<PantryCategoryId, number>> = {
  water: 36,
  carbs: 4,
  veg: 10,
  protein: 6,
  fats: 2,
};

const SRC =
  'BBK Ein Vorrat für den Krisenfall (energy shares and 2.5 litres of water a day); unit sizes are rough UK pack figures';
const CHECKED = '2026-11-01';

type Seed = Omit<PantryCategoryData, 'source' | 'lastChecked' | 'needsReview'>;

const seeds: readonly Seed[] = [
  {
    id: 'water',
    name: 'Water',
    share: 0,
    perUnit: 1,
    unit: 'litre',
    addSteps: [6, 12],
  },
  {
    id: 'carbs',
    name: 'Carbs',
    share: 0.5,
    perUnit: 3500,
    unit: 'kg of rice, pasta or oats',
    addSteps: [1, 2],
  },
  {
    id: 'veg',
    name: 'Veg and pulses',
    share: 0.15,
    perUnit: 300,
    unit: '400 g tin of beans, lentils or veg',
    addSteps: [4, 8],
  },
  {
    id: 'protein',
    name: 'Protein',
    share: 0.15,
    perUnit: 250,
    unit: 'tin of fish or meat',
    addSteps: [2, 4],
  },
  {
    id: 'fats',
    name: 'Fats and sweet',
    share: 0.2,
    perUnit: 2000,
    unit: 'jar of nut butter or honey',
    addSteps: [1, 2],
  },
];

export const pantryCategories: readonly PantryCategoryData[] = seeds.map((s) => ({
  ...s,
  source: SRC,
  lastChecked: CHECKED,
  needsReview: true,
}));
