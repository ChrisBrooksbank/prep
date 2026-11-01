export type ThemePreference = 'dark' | 'light' | 'high-contrast' | 'system';
export type ResolvedTheme = 'dark' | 'light' | 'high-contrast';

export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'dark';

/** Dark is the default; 'system' follows prefers-color-scheme. */
export function resolveTheme(
  preference: ThemePreference,
  systemPrefersLight: boolean,
): ResolvedTheme {
  if (preference === 'system') return systemPrefersLight ? 'light' : 'dark';
  return preference;
}
