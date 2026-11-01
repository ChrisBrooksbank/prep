import type { ProfileCondition } from '../logic/profile';
import type { Sourced } from './sourced';

export const PLAYBOOK_IDS = ['power-cut', 'no-water', 'gas-smell', 'flood', 'storm'] as const;
export type PlaybookId = (typeof PLAYBOOK_IDS)[number];

/** Identifies a call card in `crisis-calls.ts`. */
export type CallId =
  'power-cut' | 'gas-emergency' | 'floodline' | 'nhs-111' | 'emergency' | 'water-company' | 'gp';

export interface PlaybookStep {
  /** Stable within the playbook; tick state is stored against `playbookId:id`. */
  id: string;
  text: string;
  /** Short sub-note shown under the step. */
  note?: string;
  /** Step is shown only when this profile condition is true. */
  when?: ProfileCondition;
}

/** A countdown shown as a status line, measured from the playbook start time. */
export interface PlaybookTimer {
  id: string;
  label: string;
  hours: number;
}

export interface Playbook extends Sourced {
  id: PlaybookId;
  name: string;
  /** The call card shown at the top of the playbook. */
  primaryCall: CallId;
  steps: readonly PlaybookStep[];
  timers?: readonly PlaybookTimer[];
}

const CHECKED = '2026-11-01';

export const playbooks: readonly Playbook[] = [
  {
    id: 'power-cut',
    name: 'Power cut',
    primaryCall: 'power-cut',
    source: 'Ready spec crisis-mode.md (required Power cut steps and timers)',
    lastChecked: CHECKED,
    steps: [
      {
        id: 'fuse-board',
        text: 'Check the fuse board, then ask a neighbour',
        note: 'If the whole street is dark, report on 105',
      },
      { id: 'report-105', text: 'Report the power cut on 105' },
      { id: 'torches', text: 'Use torches, not candles' },
      {
        id: 'fridge-shut',
        text: 'Keep fridge and freezer doors shut',
        note: 'Fridge safe for about 4 hours',
      },
      {
        id: 'boiler-needs-power',
        text: 'Heating is off: your boiler needs power',
        note: 'Move to one warm room, close doors, sleeping bags on',
        when: 'gasBoiler',
      },
      {
        id: 'charge-phone',
        text: 'Charge your phone from a power bank',
        note: 'Low power mode on, calls and texts first',
      },
      {
        id: 'gas-hob',
        text: 'Light the gas hob with a match for hot drinks',
        note: 'Window open',
        when: 'hasGasHob',
      },
    ],
    timers: [
      { id: 'fridge', label: 'Fridge food', hours: 4 },
      { id: 'freezer-full', label: 'Full freezer', hours: 48 },
      { id: 'freezer-half', label: 'Half-full freezer', hours: 24 },
    ],
  },
  {
    id: 'no-water',
    name: 'No water',
    primaryCall: 'water-company',
    source: 'Concept prototype playbook text; verify against Water UK and your water company',
    lastChecked: CHECKED,
    needsReview: true,
    steps: [
      { id: 'check-neighbours', text: 'Check neighbours and your water company app' },
      { id: 'hot-tap', text: 'Do not drink from the hot tap' },
      {
        id: 'stored-water',
        text: 'Use stored water: 5 L a day for two',
        note: '36 L stored = about 7 days',
      },
      { id: 'cooking-first', text: 'Cooking water first, washing last' },
      {
        id: 'bowser',
        text: 'Collect from bowser if one is set up',
        note: '10 L carrier needed',
      },
    ],
  },
  {
    id: 'gas-smell',
    name: 'Gas smell',
    primaryCall: 'gas-emergency',
    source:
      'Concept prototype playbook text; verify against the National Gas Emergency Service and HSE guidance',
    lastChecked: CHECKED,
    needsReview: true,
    steps: [
      { id: 'no-flames', text: 'No flames, no switches, no phone indoors' },
      { id: 'ventilate', text: 'Open windows and doors' },
      { id: 'meter', text: 'Turn off at the meter if you can do it safely' },
      { id: 'leave-and-call', text: 'Leave the house, then call 0800 111 999' },
      { id: 'warn-neighbours', text: 'Warn neighbours, wait outside' },
    ],
  },
  {
    id: 'flood',
    name: 'Flood',
    primaryCall: 'floodline',
    source: 'Concept prototype playbook text; verify against GOV.UK and Environment Agency advice',
    lastChecked: CHECKED,
    needsReview: true,
    steps: [
      { id: 'move-upstairs', text: 'Move people, pets and medication upstairs' },
      { id: 'mains-off', text: 'Switch off gas, electric and water at the mains' },
      { id: 'grab-bag', text: 'Take the grab bag and phone power bank' },
      {
        id: 'flood-water',
        text: 'Do not walk or drive through flood water',
        note: '15 cm can knock you over',
      },
      { id: 'life-at-risk', text: 'Call 999 if life is at risk' },
    ],
  },
  {
    id: 'storm',
    name: 'Storm',
    primaryCall: 'emergency',
    source: 'Concept prototype playbook text; verify against Met Office and GOV.UK advice',
    lastChecked: CHECKED,
    needsReview: true,
    steps: [
      { id: 'stay-in', text: 'Stay in, away from windows' },
      { id: 'secure-garden', text: 'Bring in or tie down garden items' },
      { id: 'charge-now', text: 'Charge phones and power bank now' },
      { id: 'check-neighbours', text: 'Check on neighbours once it passes' },
      {
        id: 'power-lines',
        text: 'Do not go near downed power lines',
        note: 'Report on 105',
      },
    ],
  },
];
