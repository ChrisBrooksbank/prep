import { describe, expect, it } from 'vitest';
import { resolveCall } from './calls';
import type { Profile } from './profile';

const profile = {
  waterCompany: { name: 'Thames Water', phone: '0800 316 9800' },
} as Profile;

describe('resolveCall', () => {
  it('uses fixed numbers and strips spaces for tel', () => {
    const r = resolveCall({ title: 'Gas', description: 'd', number: '0800 111 999' }, null);
    expect(r.number).toBe('0800 111 999');
    expect(r.tel).toBe('0800111999');
  });
  it('uses the saved contact from the profile', () => {
    const r = resolveCall(
      { title: 'Water company', description: 'd', fromProfile: 'waterCompany' },
      profile,
    );
    expect(r.number).toBe('0800 316 9800');
    expect(r.tel).toBe('08003169800');
    expect(r.description).toBe('Thames Water');
  });
  it('says so when no contact is saved', () => {
    const r = resolveCall({ title: 'GP surgery', description: 'd', fromProfile: 'gp' }, profile);
    expect(r.number).toBeUndefined();
    expect(r.description).toMatch(/Not saved/);
  });
});
