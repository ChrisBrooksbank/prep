/** Household profile model and pure helpers. No DOM, no storage access. */

export const HOME_TYPES = ['flat', 'terrace', 'semi', 'detached', 'rural'] as const;
export const HEATING_TYPES = ['gas-boiler', 'electric', 'heat-pump', 'oil', 'other'] as const;
export const COOKING_TYPES = ['gas-hob', 'electric-hob', 'induction'] as const;

export type HomeType = (typeof HOME_TYPES)[number];
export type HeatingType = (typeof HEATING_TYPES)[number];
export type CookingType = (typeof COOKING_TYPES)[number];

/** A named contact, used for the water company and GP surgery. */
export interface Contact {
  name: string;
  phone: string;
}

export interface Profile {
  homeType: HomeType;
  heating: HeatingType;
  cooking: CookingType;
  adults: number;
  children: number;
  pets: boolean;
  medication: boolean;
  vulnerable: boolean;
  postcodeDistrict?: string;
  waterCompany?: Contact;
  gp?: Contact;
}

/** Profile conditions that Crisis steps may be keyed on. */
export type ProfileCondition = 'hasGasHob' | 'gasBoiler' | 'medication' | 'pets';

export const HOME_TYPE_LABELS: Record<HomeType, string> = {
  flat: 'flat',
  terrace: 'terrace',
  semi: 'semi-detached',
  detached: 'detached house',
  rural: 'rural or off-grid home',
};

export const HEATING_LABELS: Record<HeatingType, string> = {
  'gas-boiler': 'gas boiler',
  electric: 'electric heating',
  'heat-pump': 'heat pump',
  oil: 'oil heating',
  other: 'other heating',
};

export const COOKING_LABELS: Record<CookingType, string> = {
  'gas-hob': 'gas hob',
  'electric-hob': 'electric hob',
  induction: 'induction hob',
};

export function defaultProfile(): Profile {
  return {
    homeType: 'terrace',
    heating: 'gas-boiler',
    cooking: 'gas-hob',
    adults: 2,
    children: 0,
    pets: false,
    medication: false,
    vulnerable: false,
  };
}

export function hasGasHob(profile: Profile): boolean {
  return profile.cooking === 'gas-hob';
}

export function gasBoiler(profile: Profile): boolean {
  return profile.heating === 'gas-boiler';
}

/** Resolves a keyed condition against a profile. A null profile hides nothing-specific: all false. */
export function matchesCondition(profile: Profile | null, condition: ProfileCondition): boolean {
  if (!profile) return false;
  switch (condition) {
    case 'hasGasHob':
      return hasGasHob(profile);
    case 'gasBoiler':
      return gasBoiler(profile);
    case 'medication':
      return profile.medication;
    case 'pets':
      return profile.pets;
  }
}

export function householdSize(profile: Profile): number {
  return profile.adults + profile.children;
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** One-line summary, e.g. "terrace, gas boiler, gas hob, 2 adults". */
export function householdLine(profile: Profile | null): string {
  if (!profile) return '';
  const parts: string[] = [
    HOME_TYPE_LABELS[profile.homeType],
    HEATING_LABELS[profile.heating],
    COOKING_LABELS[profile.cooking],
    plural(profile.adults, 'adult', 'adults'),
  ];
  if (profile.children > 0) parts.push(plural(profile.children, 'child', 'children'));
  if (profile.pets) parts.push('pets');
  return parts.join(', ');
}

function isOneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (list as readonly string[]).includes(value);
}

function count(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 99
    ? value
    : fallback;
}

function text(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function contact(value: unknown): Contact | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const raw = value as Record<string, unknown>;
  const name = text(raw.name);
  const phone = text(raw.phone);
  if (name === undefined && phone === undefined) return undefined;
  return { name: name ?? '', phone: phone ?? '' };
}

/**
 * Builds a valid Profile from stored or imported data. Missing or invalid
 * fields fall back to defaults, so a skipped onboarding still yields a usable
 * profile. Returns null only when the input is not an object.
 */
export function normaliseProfile(raw: unknown): Profile | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const d = defaultProfile();
  const profile: Profile = {
    homeType: isOneOf(HOME_TYPES, r.homeType) ? r.homeType : d.homeType,
    heating: isOneOf(HEATING_TYPES, r.heating) ? r.heating : d.heating,
    cooking: isOneOf(COOKING_TYPES, r.cooking) ? r.cooking : d.cooking,
    adults: count(r.adults, d.adults),
    children: count(r.children, d.children),
    pets: r.pets === true,
    medication: r.medication === true,
    vulnerable: r.vulnerable === true,
  };
  const postcode = text(r.postcodeDistrict);
  if (postcode !== undefined) profile.postcodeDistrict = postcode.toUpperCase();
  const water = contact(r.waterCompany);
  if (water) profile.waterCompany = water;
  const gp = contact(r.gp);
  if (gp) profile.gp = gp;
  return profile;
}
