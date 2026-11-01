import {
  AREAS,
  AREA_LABELS,
  ONBOARDING_HASH,
  SETTINGS_HASH,
  isOnboardingRoute,
  isSettingsRoute,
  parseRoute,
  routeHash,
  type Area,
} from '../logic/route';
import { needsOnboarding } from '../logic/onboarding';
import { normaliseProfile } from '../logic/profile';
import { renderOnboarding } from '../areas/onboarding';
import { getStore } from '../storage/instance';
import { renderCrisis } from '../areas/crisis';
import { renderPrepare } from '../areas/prepare';
import { renderSettings } from '../areas/settings';

async function renderArea(area: Area): Promise<HTMLElement> {
  if (area === 'crisis') return renderCrisis();
  if (area === 'prepare') return renderPrepare();
  const { renderHome } = await import('../areas/home');
  return renderHome();
}

function buildNav(current: Area): HTMLElement {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Areas');
  for (const area of AREAS) {
    const a = document.createElement('a');
    a.href = routeHash(area);
    a.textContent = AREA_LABELS[area];
    if (area === current) a.setAttribute('aria-current', 'page');
    nav.append(a);
  }
  return nav;
}

function buildCrisisControl(): HTMLElement {
  const a = document.createElement('a');
  a.href = routeHash('crisis');
  a.className = 'crisis-control';
  a.textContent = 'Crisis mode';
  return a;
}

function buildHouseholdLink(): HTMLElement {
  const a = document.createElement('a');
  a.href = ONBOARDING_HASH;
  a.textContent = 'Household';
  return a;
}

function buildSettingsLink(): HTMLElement {
  const a = document.createElement('a');
  a.href = SETTINGS_HASH;
  a.textContent = 'Settings';
  return a;
}

async function renderOnboardingScreen(): Promise<HTMLElement> {
  const store = await getStore();
  const data = await store.load();
  return renderOnboarding(normaliseProfile(data.profile), (profile) => {
    void store
      .update((d) => ({
        ...d,
        profile: profile ? { ...profile } : d.profile,
        settings: { ...d.settings, onboarded: true },
      }))
      .then(() => {
        location.hash = routeHash('prepare');
      });
  });
}

/** True when a first-run visitor should be sent to onboarding. Crisis is never gated. */
async function firstRunRedirect(area: Area): Promise<boolean> {
  if (area === 'crisis') return false;
  const data = await (await getStore()).load();
  return needsOnboarding(data.settings);
}

export function startRouter(root: HTMLElement): void {
  let token = 0;
  const show = async (): Promise<void> => {
    const onboarding = isOnboardingRoute(location.hash);
    const settings = isSettingsRoute(location.hash);
    const area = parseRoute(location.hash);
    const mine = ++token;
    if (!onboarding && !settings && (await firstRunRedirect(area))) {
      if (mine === token) location.replace(ONBOARDING_HASH);
      return;
    }
    const main = onboarding
      ? await renderOnboardingScreen()
      : settings
        ? await renderSettings()
        : await renderArea(area);
    if (mine !== token) return;
    root.dataset.area = onboarding ? 'onboarding' : settings ? 'settings' : area;
    const header = document.createElement('header');
    const brand = document.createElement('span');
    brand.className = 'brand';
    brand.textContent = 'Ready';
    header.append(brand);
    // Crisis mode is its own full-screen state: no area nav, no way to wander off by accident.
    if (onboarding) header.append(buildCrisisControl());
    else if (settings) header.append(buildNav(area), buildCrisisControl());
    else if (area !== 'crisis')
      header.append(
        buildNav(area),
        buildHouseholdLink(),
        buildSettingsLink(),
        buildCrisisControl(),
      );
    main.id = 'main';
    main.setAttribute('role', 'main');
    root.replaceChildren(header, main);
  };
  window.addEventListener('hashchange', () => void show());
  void show();
}
