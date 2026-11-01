import { DEFAULT_THEME_PREFERENCE, resolveTheme, type ThemePreference } from '../logic/theme';

export function applyTheme(preference: ThemePreference = DEFAULT_THEME_PREFERENCE): void {
  const light = window.matchMedia('(prefers-color-scheme: light)').matches;
  document.documentElement.dataset.theme = resolveTheme(preference, light);
}

export function applyReduceMotion(reduce: boolean): void {
  document.documentElement.dataset.reduceMotion = String(reduce);
}
