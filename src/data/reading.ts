import type { Sourced } from './sourced';

export type ReadingGroup = 'UK official' | 'Charities and skills' | 'The longer standards';

export const readingGroups: readonly ReadingGroup[] = [
  'UK official',
  'Charities and skills',
  'The longer standards',
];

export interface ReadingLink extends Sourced {
  id: string;
  title: string;
  url: string;
  blurb: string;
  group: ReadingGroup;
  country: string;
  /** ISO date the link was opened and confirmed, or null if not yet verified. */
  verifiedOn: string | null;
}

const CHECKED = '2026-11-01';

/**
 * Seeded from the prototype's reading section. The prototype notes the links were found by
 * searching and not all opened in full, so none is verified yet. Run a link checker before release.
 */
function link(
  id: string,
  group: ReadingGroup,
  country: string,
  title: string,
  url: string,
  blurb: string,
  source: string,
): ReadingLink {
  return {
    id,
    group,
    country,
    title,
    url,
    blurb,
    source,
    lastChecked: CHECKED,
    verifiedOn: null,
    needsReview: true,
  };
}

export const readingLinks: readonly ReadingLink[] = [
  link(
    'gov-small-steps',
    'UK official',
    'UK',
    'GOV.UK: take small, simple steps',
    'https://www.gov.uk/government/news/households-encouraged-to-take-small-simple-steps-to-stay-prepared-in-an-emergency',
    'The Be Ready campaign announcement, with the 72 hour advice.',
    'GOV.UK',
  ),
  link(
    'gov-alerts',
    'UK official',
    'UK',
    'Emergency Alerts',
    'https://www.gov.uk/alerts',
    'How the loud phone alert works, how to check one is genuine, and how to opt out.',
    'GOV.UK',
  ),
  link(
    'nrr-2026',
    'UK official',
    'UK',
    'National Risk Register 2026',
    'https://www.gov.uk/government/publications/national-risk-register-2026',
    "The government's own list of what could go wrong and how likely it is.",
    'GOV.UK',
  ),
  link(
    'nrr-2025',
    'UK official',
    'UK',
    'National Risk Register 2025',
    'https://gov.uk/government/publications/national-risk-register-2025',
    'The previous edition, also online.',
    'GOV.UK',
  ),
  link(
    'fsa-power-cut',
    'UK official',
    'UK',
    'Food safety in a power cut',
    'https://www.gov.uk/government/publications/food-safety-in-a-power-cut-advice-for-consumers/food-safety-in-a-power-cut-advice-for-consumers',
    'From the Food Standards Agency. Fridge and freezer timings.',
    'Food Standards Agency',
  ),
  link(
    'ready-scotland',
    'UK official',
    'Scotland',
    'Ready Scotland',
    'https://ready.scot',
    "The Scottish Government's equivalent, with a home emergency plan builder.",
    'Scottish Government',
  ),
  link(
    'red-cross-kit',
    'Charities and skills',
    'UK',
    'British Red Cross: emergency kit',
    'https://www.redcross.org.uk/get-help/prepare-for-emergencies/prepare-an-emergency-kit',
    'Build the kit one item at a time with the weekly shop, for home, going out and the car.',
    'British Red Cross',
  ),
  link(
    'sja-first-aid',
    'Charities and skills',
    'UK',
    'St John Ambulance first aid advice',
    'https://www.sja.org.uk/first-aid-advice/',
    'CPR, bleeding, the recovery position and more.',
    'St John Ambulance',
  ),
  link(
    'sja-get-advice',
    'Charities and skills',
    'UK',
    'St John Ambulance: get advice',
    'https://www.sja.org.uk/get-advice/',
    'Also find courses, which beat any app.',
    'St John Ambulance',
  ),
  link(
    'ea-flood-api',
    'Charities and skills',
    'England',
    'Environment Agency flood data',
    'https://api.gov.uk/ea/flood-monitoring/',
    'For builders: the open flood warning API. England only.',
    'Environment Agency',
  ),
  link(
    'mcf-week',
    'The longer standards',
    'Sweden',
    'Sweden: home preparedness for a week',
    'https://www.mcf.se/en/advice-for-individuals/home-preparedness--prepping-for-at-least-a-week/basics-of-home-emergency-preparedness/',
    'From the Swedish Civil Defence and Resilience Agency.',
    'Swedish Civil Defence and Resilience Agency (mcf.se)',
  ),
  link(
    'mcf-brochure',
    'The longer standards',
    'Sweden',
    'Sweden: "In case of crisis or war"',
    'https://www.mcf.se/en/advice-for-individuals/the-brochure-in-case-of-crisis-or-war/download-and-order-the-brochure-in-case-of-crisis-or-war/',
    'The brochure itself, free to download in English. Short and very readable.',
    'Swedish Civil Defence and Resilience Agency (mcf.se)',
  ),
  link(
    'dsb-faq',
    'The longer standards',
    'Norway',
    'Norway: self-preparedness FAQ',
    'https://www.dsb.no/en/Safe-everyday-life/Self-preparedness/Frequently-asked-questions-about-self-preparedness/',
    'Why they moved from three days to a week.',
    'Norwegian Directorate for Civil Protection (dsb.no)',
  ),
  link(
    'sikkerhverdag',
    'The longer standards',
    'Norway',
    'Norway: advice for emergencies',
    'https://www.sikkerhverdag.no/en/being-prepared/incidents-and-crises/advice-on-self-preparedness-for-emergencies/',
    'Practical advice, including power and payment outages.',
    'Norwegian Directorate for Civil Protection (sikkerhverdag.no)',
  ),
  link(
    'bbk',
    'The longer standards',
    'Germany',
    'Germany: BBK',
    'https://www.bbk.bund.de',
    'Look for the guide "Vorsorgen für Krisen und Katastrophen" and the 10 day checklist. In German. Links to the home page because the guide address is unconfirmed.',
    'German Federal Office of Civil Protection and Disaster Assistance (BBK)',
  ),
  link(
    'wiki-booklet',
    'The longer standards',
    'Sweden',
    'Wikipedia: the Swedish booklet',
    'https://en.wikipedia.org/wiki/In_case_of_crisis_or_war',
    'History of the brochure since 1943. Good background.',
    'Wikipedia',
  ),
];
