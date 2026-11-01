import { describe, expect, it } from 'vitest';
import {
  defaultProfile,
  gasBoiler,
  hasGasHob,
  householdLine,
  householdSize,
  matchesCondition,
  normaliseProfile,
} from './profile';

describe('profile conditions', () => {
  it('detects a gas hob and a gas boiler independently', () => {
    const p = { ...defaultProfile(), heating: 'electric' as const, cooking: 'gas-hob' as const };
    expect(hasGasHob(p)).toBe(true);
    expect(gasBoiler(p)).toBe(false);
    expect(hasGasHob({ ...p, cooking: 'induction' })).toBe(false);
  });

  it('resolves keyed conditions, all false without a profile', () => {
    const p = { ...defaultProfile(), pets: true, medication: true };
    expect(matchesCondition(p, 'hasGasHob')).toBe(true);
    expect(matchesCondition(p, 'gasBoiler')).toBe(true);
    expect(matchesCondition(p, 'pets')).toBe(true);
    expect(matchesCondition(p, 'medication')).toBe(true);
    expect(matchesCondition(null, 'hasGasHob')).toBe(false);
    expect(matchesCondition({ ...p, cooking: 'electric-hob' }, 'hasGasHob')).toBe(false);
  });
});

describe('householdLine', () => {
  it('summarises the default profile', () => {
    expect(householdLine(defaultProfile())).toBe('terrace, gas boiler, gas hob, 2 adults');
  });

  it('adds children and pets, with correct plurals', () => {
    const p = { ...defaultProfile(), adults: 1, children: 1, pets: true };
    expect(householdLine(p)).toBe('terrace, gas boiler, gas hob, 1 adult, 1 child, pets');
    expect(householdLine({ ...p, children: 3 })).toContain('3 children');
  });

  it('is empty without a profile', () => {
    expect(householdLine(null)).toBe('');
  });

  it('counts household size', () => {
    expect(householdSize({ ...defaultProfile(), adults: 2, children: 3 })).toBe(5);
  });
});

describe('normaliseProfile', () => {
  it('returns null for non-objects', () => {
    expect(normaliseProfile(null)).toBeNull();
    expect(normaliseProfile('x')).toBeNull();
    expect(normaliseProfile([])).toBeNull();
  });

  it('fills defaults for an empty object', () => {
    expect(normaliseProfile({})).toEqual(defaultProfile());
  });

  it('rejects invalid values and keeps valid ones', () => {
    const p = normaliseProfile({
      homeType: 'castle',
      heating: 'oil',
      adults: -1,
      children: 2.5,
      pets: 'yes',
      medication: true,
    });
    expect(p?.homeType).toBe('terrace');
    expect(p?.heating).toBe('oil');
    expect(p?.adults).toBe(2);
    expect(p?.children).toBe(0);
    expect(p?.pets).toBe(false);
    expect(p?.medication).toBe(true);
  });

  it('keeps optional fields, trimmed, and drops blank ones', () => {
    const p = normaliseProfile({
      postcodeDistrict: ' sw1a ',
      waterCompany: { name: 'Thames Water', phone: '0800 316 9800' },
      gp: { name: '  ', phone: '' },
    });
    expect(p?.postcodeDistrict).toBe('SW1A');
    expect(p?.waterCompany).toEqual({ name: 'Thames Water', phone: '0800 316 9800' });
    expect(p?.gp).toBeUndefined();
  });
});
