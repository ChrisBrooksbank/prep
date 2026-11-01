import type { Room, RoomItem } from '../logic/home';
import type { Sourced } from './sourced';

export interface HomeItem extends RoomItem, Sourced {
  label: string;
  /** Rough UK price in pounds shown while the item is missing. */
  price?: { min: number; max: number };
  tip?: string;
}

export interface HomeRoom extends Room<HomeItem> {
  name: string;
  note: string;
}

/**
 * Until the user ticks something themselves the ownership shown is a starting
 * example, and the UI must say so. Ownership is stored under these ids.
 */
export const homeIsExampleUntilEdited = true;

/** Items ticked as owned in the example state, from the prototype. */
export const exampleOwnedItemIds: readonly string[] = [
  'torch',
  'power-bank',
  'blankets',
  'stored-water',
  'gas-hob',
  'food-7-days',
  'head-torch',
  'spare-duvet',
  'medication',
  'first-aid-kit',
];

export const pricesCheckedOn = '2026-11-01';

const SRC = 'Ready concept prototype (seed items); prices are rough UK ranges';
const CHECKED = '2026-11-01';

type Seed = Omit<HomeItem, 'source' | 'lastChecked' | 'needsReview'>;

function room(id: string, name: string, note: string, seeds: readonly Seed[]): HomeRoom {
  return {
    id,
    name,
    note,
    items: seeds.map((s) => ({ ...s, source: SRC, lastChecked: CHECKED, needsReview: true })),
  };
}

export const homeRooms: readonly HomeRoom[] = [
  room('lounge', 'Lounge', 'Your warm room', [
    { id: 'torch', label: 'Torch and spare batteries', weight: 2 },
    { id: 'power-bank', label: 'Power bank, 20,000 mAh', weight: 2 },
    {
      id: 'radio',
      label: 'Wind-up or battery radio',
      weight: 3,
      price: { min: 15, max: 25 },
      tip: 'BBC local radio is your main source of news.',
    },
    {
      id: 'sleeping-bags',
      label: 'Sleeping bags, one each',
      weight: 3,
      price: { min: 40, max: 60 },
      tip: 'Heat people, not the house.',
    },
    { id: 'blankets', label: 'Blankets and hats', weight: 1 },
    {
      id: 'pet-supplies',
      label: 'Pet food and water for a week',
      weight: 2,
      requires: 'pets',
      price: { min: 10, max: 25 },
    },
  ]),
  room('kitchen', 'Kitchen', 'Water, food, cooking', [
    { id: 'stored-water', label: 'Stored drinking water', weight: 3 },
    {
      id: 'gas-hob',
      label: 'Gas hob (lights with a match)',
      weight: 1,
      requires: 'hasGasHob',
    },
    {
      id: 'camping-stove',
      label: 'Camping stove and spare canisters',
      weight: 2,
      price: { min: 20, max: 30 },
      tip: 'Use only with a window open.',
    },
    {
      id: 'tin-opener',
      label: 'Manual tin opener',
      weight: 1,
      price: { min: 3, max: 5 },
    },
    { id: 'food-7-days', label: 'Seven days of food', weight: 3 },
  ]),
  room('bedroom', 'Bedroom', 'Sleep and medication', [
    { id: 'head-torch', label: 'Head torch by the bed', weight: 1 },
    { id: 'spare-duvet', label: 'Spare duvet', weight: 1 },
    {
      id: 'medication',
      label: 'Regular medication, a few weeks spare',
      weight: 3,
      requires: 'medication',
      tip: 'Aim for 4 weeks, as Sweden advises.',
    },
    {
      id: 'hot-water-bottles',
      label: 'Hot-water bottles',
      weight: 1,
      price: { min: 6, max: 10 },
    },
  ]),
  room('bath', 'Bathroom', 'Water, hygiene, first aid', [
    { id: 'first-aid-kit', label: 'First aid kit, in date', weight: 2 },
    {
      id: 'fill-bath',
      label: 'Fill the bath if warned',
      weight: 2,
      tip: 'Flushing water for a week.',
    },
    {
      id: 'hygiene-wipes',
      label: 'Hygiene wipes',
      weight: 1,
      price: { min: 2, max: 4 },
    },
    {
      id: 'loo-roll',
      label: 'Spare loo roll',
      weight: 1,
      price: { min: 3, max: 5 },
    },
    {
      id: 'water-carrier',
      label: '10 litre water carrier',
      weight: 1,
      price: { min: 6, max: 10 },
    },
  ]),
];
