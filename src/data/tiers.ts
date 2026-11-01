import type { Sourced } from './sourced';

export type TierNumber = 1 | 2 | 3;

export interface Tier extends Sourced {
  tier: TierNumber;
  /** Country or countries whose official guidance sets the target. */
  country: string;
  /** Target in days. */
  days: number;
  /** Short label, for example "3 days". */
  label: string;
  /** One-line explanation shown on the ladder. */
  explanation: string;
  /** Official bodies cited for this tier. */
  sources: readonly string[];
}

const CHECKED = '2026-11-01';

export const tiers: readonly Tier[] = [
  {
    tier: 1,
    country: 'UK',
    days: 3,
    label: '3 days',
    explanation: 'The UK baseline: enough to manage for 72 hours. A first step, not the goal.',
    sources: ['GOV.UK Be Ready announcement'],
    source: 'GOV.UK Be Ready announcement',
    lastChecked: CHECKED,
    needsReview: true,
  },
  {
    tier: 2,
    country: 'Sweden · Norway',
    days: 7,
    label: '7 days',
    explanation: 'The Nordic guidance: be able to look after your household for a week.',
    sources: [
      'Swedish Civil Defence and Resilience Agency (mcf.se)',
      'Norwegian Directorate for Civil Protection (dsb.no)',
    ],
    source: 'mcf.se and dsb.no household preparedness guidance',
    lastChecked: CHECKED,
    needsReview: true,
  },
  {
    tier: 3,
    country: 'Germany',
    days: 10,
    label: '10 days',
    explanation: 'The German recommendation: ten days of food and water at home.',
    sources: ['German Federal Office of Civil Protection and Disaster Assistance (BBK)'],
    source: 'BBK emergency provisions guidance',
    lastChecked: CHECKED,
    needsReview: true,
  },
];

/** The default working target is the 7 day tier. */
export const DEFAULT_TARGET_TIER: TierNumber = 2;
