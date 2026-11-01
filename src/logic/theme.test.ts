import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME_PREFERENCE, resolveTheme } from './theme';

describe('resolveTheme', () => {
  it('defaults to dark', () => {
    expect(resolveTheme(DEFAULT_THEME_PREFERENCE, true)).toBe('dark');
  });
  it('follows the system when asked', () => {
    expect(resolveTheme('system', true)).toBe('light');
    expect(resolveTheme('system', false)).toBe('dark');
  });
  it('keeps explicit choices, including high contrast', () => {
    expect(resolveTheme('high-contrast', true)).toBe('high-contrast');
    expect(resolveTheme('light', false)).toBe('light');
  });
});
