import { describe, expect, it } from 'vitest';
import {
  QUESTIONS,
  answersFromProfile,
  buildProfile,
  needsOnboarding,
  setAnswer,
} from './onboarding';
import { defaultProfile } from './profile';

describe('onboarding', () => {
  it('asks fewer than ten questions with unique ids', () => {
    expect(QUESTIONS.length).toBeLessThan(10);
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
  });

  it('sets and clears answers without mutating', () => {
    const a = setAnswer({}, 'adults', 3);
    expect(a).toEqual({ adults: 3 });
    expect(setAnswer(a, 'adults', undefined)).toEqual({});
    expect(a).toEqual({ adults: 3 });
  });

  it('gives null when everything was skipped', () => {
    expect(buildProfile({})).toBeNull();
  });

  it('fills unanswered fields with defaults', () => {
    const p = buildProfile({ cooking: 'induction', postcodeDistrict: 'sw1a' });
    expect(p).toEqual({ ...defaultProfile(), cooking: 'induction', postcodeDistrict: 'SW1A' });
  });

  it('round-trips an existing profile for editing', () => {
    const p = { ...defaultProfile(), pets: true };
    expect(buildProfile(answersFromProfile(p))).toEqual(p);
    expect(answersFromProfile(null)).toEqual({});
  });

  it('needs onboarding until marked done', () => {
    expect(needsOnboarding({})).toBe(true);
    expect(needsOnboarding({ onboarded: true })).toBe(false);
  });
});
