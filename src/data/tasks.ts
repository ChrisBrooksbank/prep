import type { Sourced } from './sourced';
import type { TierNumber } from './tiers';

export type TaskKind = 'buy' | 'learn' | 'plan' | 'drill';

/** Which household figure a task scales with. Resolved by pure logic, not here. */
export type TaskScaling =
  | 'water' // litres: people x days x litres per person per day
  | 'foodDays' // days of food for the whole household
  | 'sleepingBags' // one per adult and child
  | 'none';

export interface PrepareTask extends Sourced {
  id: string;
  tier: TierNumber;
  kind: TaskKind;
  title: string;
  why: string;
  /** Price range in pounds, for the default two-adult household. */
  cost?: { min: number; max: number };
  /** Time as plain words, for tasks that cost time rather than money. */
  time?: string;
  scaling: TaskScaling;
  /** Gas hob owners do not get this task as essential (camping stove). */
  skipIfGasHob?: boolean;
  /** For scaling tasks: the per-person figure used by the logic module. */
  perPerson?: number;
}

/** Date the price ranges below were last checked. */
export const pricesCheckedOn = '2026-11-01';

const SRC = 'Ready concept prototype (seed tasks); prices are rough UK ranges';
const CHECKED = '2026-11-01';

type Seed = Omit<PrepareTask, 'source' | 'lastChecked' | 'needsReview' | 'scaling'> & {
  scaling?: TaskScaling;
};

const seeds: readonly Seed[] = [
  {
    id: 'torch',
    tier: 1,
    kind: 'buy',
    title: 'Torch and spare batteries',
    why: 'Light without plugs or candles.',
    cost: { min: 6, max: 12 },
  },
  {
    id: 'isolators',
    tier: 1,
    kind: 'learn',
    title: 'Find your stopcock, gas and electric isolators',
    why: 'In a flood or burst pipe you have minutes. Label them.',
    time: '10 min',
  },
  {
    id: 'water-3',
    tier: 1,
    kind: 'buy',
    title: 'Store water for three days',
    why: 'Enough for everyone in the household for three days.',
    cost: { min: 4, max: 10 },
    scaling: 'water',
    perPerson: 2.5,
  },
  {
    id: 'power-bank',
    tier: 1,
    kind: 'buy',
    title: 'Power bank, 20,000 mAh',
    why: 'Several phone charges when the mains is off.',
    cost: { min: 12, max: 25 },
  },
  {
    id: 'household-plan',
    tier: 1,
    kind: 'plan',
    title: 'Write the household plan',
    why: 'Contacts, meeting place, medication list. One page, kept in the grab bag.',
    time: '20 min',
  },
  {
    id: 'radio',
    tier: 1,
    kind: 'buy',
    title: 'Wind-up or battery radio',
    why: 'Local radio is how you get news when masts are down.',
    cost: { min: 15, max: 35 },
  },
  {
    id: 'food-3',
    tier: 1,
    kind: 'buy',
    title: 'Three days of food that needs no cooking',
    why: 'Things you would actually eat.',
    cost: { min: 10, max: 25 },
    scaling: 'foodDays',
  },
  {
    id: 'water-7',
    tier: 2,
    kind: 'buy',
    title: 'Raise stored water to seven days',
    why: 'Seven days at 2.5 litres each per day.',
    cost: { min: 8, max: 20 },
    scaling: 'water',
    perPerson: 2.5,
  },
  {
    id: 'camping-stove',
    tier: 2,
    kind: 'buy',
    title: 'Camping stove and 4 canisters',
    why: 'Hot food and drinks when the hob is not an option.',
    cost: { min: 20, max: 40 },
    skipIfGasHob: true,
  },
  {
    id: 'sleeping-bags',
    tier: 2,
    kind: 'buy',
    title: 'Sleeping bags',
    why: 'Heat people, not the house. One each.',
    cost: { min: 30, max: 90 },
    scaling: 'sleepingBags',
  },
  {
    id: 'first-aid-course',
    tier: 2,
    kind: 'learn',
    title: 'Book a first aid course',
    why: 'St John Ambulance or Red Cross. Half a day.',
    time: '3 hours',
  },
  {
    id: 'lights-out',
    tier: 2,
    kind: 'drill',
    title: 'Lights-out evening',
    why: 'Three hours with the mains off. Find out what you forgot.',
    time: '3 hours',
  },
  {
    id: 'food-7',
    tier: 2,
    kind: 'buy',
    title: 'Seven days of food',
    why: 'Add tins of fish, beans and rice.',
    cost: { min: 20, max: 45 },
    scaling: 'foodDays',
  },
  {
    id: 'neighbours',
    tier: 2,
    kind: 'plan',
    title: 'Meet your neighbours',
    why: 'Swap numbers. Note who may need help.',
    time: '30 min',
  },
  {
    id: 'cash',
    tier: 2,
    kind: 'buy',
    title: 'Keep some cash in small notes',
    why: 'Card tills fail in a power cut.',
    cost: { min: 50, max: 50 },
  },
  {
    id: 'protein-10',
    tier: 3,
    kind: 'buy',
    title: 'Add protein to reach ten days',
    why: 'Your pantry shelf shows where the thin spot is.',
    cost: { min: 15, max: 35 },
    scaling: 'foodDays',
  },
  {
    id: 'medication',
    tier: 3,
    kind: 'plan',
    title: 'Ask the pharmacy about a month of medication',
    why: 'Swedish guidance advises a month. Ask what your pharmacy can do.',
    time: '10 min',
  },
  {
    id: 'no-mains-24h',
    tier: 3,
    kind: 'drill',
    title: '24 hours with no mains',
    why: 'A weekend rehearsal.',
    time: '24 hours',
  },
  {
    id: 'purification',
    tier: 3,
    kind: 'buy',
    title: 'Water purification tablets',
    why: 'For when stored water runs out.',
    cost: { min: 6, max: 15 },
  },
];

export const prepareTasks: readonly PrepareTask[] = seeds.map((s) => ({
  ...s,
  scaling: s.scaling ?? 'none',
  source: SRC,
  lastChecked: CHECKED,
  needsReview: true,
}));
