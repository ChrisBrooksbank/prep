import { describe, expect, it } from 'vitest';
import { shouldShowBatteryHint } from './battery-hint';

describe('shouldShowBatteryHint', () => {
  it('shows nothing when the Battery Status API is unavailable', () => {
    expect(shouldShowBatteryHint(null, false, '#prepare')).toBe(false);
  });
  it('shows below 20 percent when not charging', () => {
    expect(shouldShowBatteryHint({ level: 0.19, charging: false }, false, '#prepare')).toBe(true);
  });
  it('does not show at exactly 20 percent or above', () => {
    expect(shouldShowBatteryHint({ level: 0.2, charging: false }, false, '#home')).toBe(false);
    expect(shouldShowBatteryHint({ level: 0.8, charging: false }, false, '#home')).toBe(false);
  });
  it('does not show while charging', () => {
    expect(shouldShowBatteryHint({ level: 0.05, charging: true }, false, '#home')).toBe(false);
  });
  it('does not show once dismissed', () => {
    expect(shouldShowBatteryHint({ level: 0.05, charging: false }, true, '#home')).toBe(false);
  });
  it('does not show in Crisis mode', () => {
    expect(shouldShowBatteryHint({ level: 0.05, charging: false }, false, '#crisis')).toBe(false);
  });
});
