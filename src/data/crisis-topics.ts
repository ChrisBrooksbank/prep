import type { Sourced } from './sourced';

export const TOPIC_IDS = [
  'keep-warm',
  'water',
  'food-safety',
  'cook-safely',
  'first-aid',
  'stay-informed',
  'toilets-hygiene',
] as const;
export type TopicId = (typeof TOPIC_IDS)[number];

export interface TopicLine {
  text: string;
  /** Danger lines are styled distinctly and always stay inside their topic. */
  danger?: boolean;
}

export interface KnowTopic extends Sourced {
  id: TopicId;
  title: string;
  lines: readonly TopicLine[];
  /** First aid is a reminder, not training; it links to this Prepare task. */
  prepareTaskLink?: { label: string; taskTitle: string };
}

const CHECKED = '2026-11-01';

/** Draft text seeded from the concept prototype. Verify before release. */
export const knowTopics: readonly KnowTopic[] = [
  {
    id: 'keep-warm',
    title: 'Keep warm',
    source: 'Concept prototype draft; verify against NHS and GOV.UK cold weather guidance',
    lastChecked: CHECKED,
    needsReview: true,
    lines: [
      {
        text: 'Heat people, not the house. Pick one small room, close the doors and hang curtains over windows.',
      },
      {
        text: 'Wear several thin layers, a hat and socks. Use sleeping bags and hot-water bottles.',
      },
      { text: 'Keep moving a little, eat regularly and have warm drinks.' },
      {
        text: 'Never use a barbecue, gas oven or hob to heat a room. Carbon monoxide can kill.',
        danger: true,
      },
      { text: 'Shivering that will not stop, slurred speech or drowsiness: call 999.' },
    ],
  },
  {
    id: 'water',
    title: 'Water',
    source:
      'Concept prototype draft; verify against Water UK and Drinking Water Inspectorate advice',
    lastChecked: CHECKED,
    needsReview: true,
    lines: [
      {
        text: 'Aim for 2 to 3 litres per person per day to drink and cook. Cut washing before you cut drinking.',
      },
      {
        text: 'Cold kitchen tap water is normally safe unless you are told otherwise. Do not drink from the hot tap.',
      },
      {
        text: 'If unsure, boil water until it bubbles and let it cool. Strain cloudy water through a clean cloth first.',
      },
      { text: 'If you get a warning, fill the bath and spare containers early.' },
    ],
  },
  {
    id: 'food-safety',
    title: 'Food safety',
    source: 'Concept prototype draft; verify against Food Standards Agency guidance',
    lastChecked: CHECKED,
    needsReview: true,
    lines: [
      { text: 'Keep fridge and freezer doors shut. Fridge food is safe for about 4 hours.' },
      { text: 'A full freezer holds for about 48 hours, a half-full one for about 24.' },
      { text: 'Eat in this order: fridge, then freezer, then cupboard.' },
      {
        text: 'Throw away food that has been warm for over 4 hours. When in doubt, throw it out.',
        danger: true,
      },
    ],
  },
  {
    id: 'cook-safely',
    title: 'Cook safely',
    source:
      'Concept prototype draft; verify against NHS, fire service and Gas Safe Register advice',
    lastChecked: CHECKED,
    needsReview: true,
    lines: [
      { text: 'Gas hob: light it with a match or lighter and never leave it.' },
      {
        text: 'Camping stoves only outdoors or by an open window, never in a tent or a closed room.',
      },
      { text: 'Never use a barbecue or generator indoors or in a garage.', danger: true },
      {
        text: 'Use torches or LED lanterns. If you use candles, use holders and never leave them.',
      },
      { text: 'Keep a battery carbon monoxide alarm working.' },
    ],
  },
  {
    id: 'first-aid',
    title: 'First aid',
    source:
      'Concept prototype draft; verify against NHS, British Red Cross and St John Ambulance guidance',
    lastChecked: CHECKED,
    needsReview: true,
    lines: [
      {
        text: 'Heavy bleeding: press hard on the wound with a clean cloth, keep pressing and call 999.',
      },
      {
        text: 'Not breathing and not responding: call 999, then push hard and fast in the centre of the chest, 100 to 120 times a minute.',
      },
      { text: 'Burn: cool it under running water for 20 minutes.' },
      {
        text: 'This is a reminder, not training. A first aid course is on your Prepare list.',
        danger: true,
      },
    ],
    prepareTaskLink: { label: 'Book a first aid course', taskTitle: 'Book a first aid course' },
  },
  {
    id: 'stay-informed',
    title: 'Stay informed',
    source: 'Concept prototype draft; verify against BBC and GOV.UK Emergency Alerts guidance',
    lastChecked: CHECKED,
    needsReview: true,
    lines: [
      {
        text: 'Radio: BBC Radio 4 LW 198 kHz, plus BBC Essex. Local frequencies are saved at setup.',
      },
      {
        text: 'Texts use less battery than calls. Use low power mode, lower brightness and close apps.',
      },
      {
        text: 'If your phone sounds a loud Emergency Alert, read it and follow the instructions.',
      },
      { text: 'Check on neighbours, especially anyone older or vulnerable.' },
    ],
  },
  {
    id: 'toilets-hygiene',
    title: 'Toilets and hygiene',
    source: 'Concept prototype draft; verify against NHS and Water UK guidance',
    lastChecked: CHECKED,
    needsReview: true,
    lines: [
      {
        text: 'No water: flush with a bucket of stored or bath water, poured fast into the bowl.',
      },
      { text: 'Use wipes or hand gel, and wash hands before eating when you can.' },
      { text: 'Double-bag waste and keep it outside until collections resume.' },
    ],
  },
];
