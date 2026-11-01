import { describe, expect, it } from 'vitest';
import { shouldShowUpdatePrompt } from './update-prompt';

describe('shouldShowUpdatePrompt', () => {
  it('shows nothing until an update is ready', () => {
    expect(shouldShowUpdatePrompt(false, '#prepare')).toBe(false);
  });
  it('shows the prompt in Prepare and Home', () => {
    expect(shouldShowUpdatePrompt(true, '#prepare')).toBe(true);
    expect(shouldShowUpdatePrompt(true, '#home')).toBe(true);
  });
  it('never shows in crisis mode', () => {
    expect(shouldShowUpdatePrompt(true, '#crisis')).toBe(false);
    expect(shouldShowUpdatePrompt(true, '#/crisis')).toBe(false);
  });
});
