export const AREAS = ['crisis', 'prepare', 'home'] as const;
export type Area = (typeof AREAS)[number];

export const DEFAULT_AREA: Area = 'prepare';

export const AREA_LABELS: Record<Area, string> = {
  crisis: 'Crisis',
  prepare: 'Prepare',
  home: 'Home',
};

/** Turns a location hash such as "#crisis" or "#/home" into an area. Unknown hashes fall back to the default. */
export function parseRoute(hash: string): Area {
  const name = hash.replace(/^#\/?/, '').split(/[/?]/)[0]?.toLowerCase() ?? '';
  return (AREAS as readonly string[]).includes(name) ? (name as Area) : DEFAULT_AREA;
}

export function routeHash(area: Area): string {
  return `#${area}`;
}

export const ONBOARDING_HASH = '#onboarding';

export function isOnboardingRoute(hash: string): boolean {
  return hash.replace(/^#\/?/, '').toLowerCase() === 'onboarding';
}
