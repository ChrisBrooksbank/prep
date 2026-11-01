import type { CallId } from './crisis-playbooks';
import type { Sourced } from './sourced';

export interface CallCard extends Sourced {
  id: CallId;
  title: string;
  description: string;
  /** Display number. Absent for cards filled in from the user's profile. */
  number?: string;
  /** Which profile contact supplies the number, when `number` is absent. */
  fromProfile?: 'waterCompany' | 'gp';
}

const CHECKED = '2026-11-01';
const SPEC = 'Ready spec crisis-mode.md (Call tab numbers)';

export const callCards: readonly CallCard[] = [
  {
    id: 'power-cut',
    title: 'Power cut',
    description: 'Report or get updates',
    number: '105',
    source: SPEC,
    lastChecked: CHECKED,
  },
  {
    id: 'gas-emergency',
    title: 'Gas emergency',
    description: 'National Gas Emergency Service',
    number: '0800 111 999',
    source: SPEC,
    lastChecked: CHECKED,
  },
  {
    id: 'floodline',
    title: 'Floodline',
    description: 'Flood advice, 24 hours',
    number: '0345 988 1188',
    source: SPEC,
    lastChecked: CHECKED,
  },
  {
    id: 'nhs-111',
    title: 'NHS 111',
    description: 'Medical help, not urgent',
    number: '111',
    source: SPEC,
    lastChecked: CHECKED,
  },
  {
    id: 'emergency',
    title: 'Emergency',
    description: 'Police, fire, ambulance',
    number: '999',
    source: SPEC,
    lastChecked: CHECKED,
  },
  {
    id: 'water-company',
    title: 'Water company',
    description: 'Saved for your address at setup',
    fromProfile: 'waterCompany',
    source: 'Entered by the user in their profile',
    lastChecked: CHECKED,
  },
  {
    id: 'gp',
    title: 'GP surgery',
    description: 'Saved at setup',
    fromProfile: 'gp',
    source: 'Entered by the user in their profile',
    lastChecked: CHECKED,
  },
];
