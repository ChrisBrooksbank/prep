/** Typed view of the persisted settings record, and advice-data freshness. Pure: no DOM, no storage. */
import { DEFAULT_THEME_PREFERENCE, type ThemePreference } from './theme';
import type { Dataset } from '../data/sourced';

export const THEME_OPTIONS: readonly { value: ThemePreference; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'high-contrast', label: 'High contrast' },
  { value: 'system', label: 'Follow device' },
];

export interface DisplaySettings {
  theme: ThemePreference;
  /** User override. When false, the device's reduced-motion preference still applies. */
  reduceMotion: boolean;
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_OPTIONS.some((o) => o.value === value);
}

/** Reads display settings from the stored record, ignoring anything invalid. */
export function readDisplaySettings(settings: Record<string, unknown>): DisplaySettings {
  return {
    theme: isThemePreference(settings.theme) ? settings.theme : DEFAULT_THEME_PREFERENCE,
    reduceMotion: settings.reduceMotion === true,
  };
}

/** Reduced motion applies if the user asked for it or the device does. */
export function effectiveReduceMotion(setting: boolean, deviceReduces: boolean): boolean {
  return setting || deviceReduces;
}

/** Most recent `lastChecked` across all datasets, or null when there is no advice data yet. */
export function adviceLastUpdated(datasets: readonly Dataset[]): string | null {
  let latest: string | null = null;
  for (const set of datasets) {
    for (const item of set.items) {
      if (latest === null || item.lastChecked > latest) latest = item.lastChecked;
    }
  }
  return latest;
}
