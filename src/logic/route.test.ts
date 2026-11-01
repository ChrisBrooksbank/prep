import { describe, expect, it } from 'vitest';
import { DEFAULT_AREA, parseRoute, routeHash } from './route';

describe('parseRoute', () => {
  it('reads the three areas', () => {
    expect(parseRoute('#crisis')).toBe('crisis');
    expect(parseRoute('#prepare')).toBe('prepare');
    expect(parseRoute('#home')).toBe('home');
  });
  it('accepts a slash and different case', () => {
    expect(parseRoute('#/Home')).toBe('home');
    expect(parseRoute('#crisis/do')).toBe('crisis');
  });
  it('falls back to the default for empty or unknown hashes', () => {
    expect(parseRoute('')).toBe(DEFAULT_AREA);
    expect(parseRoute('#nonsense')).toBe(DEFAULT_AREA);
  });
  it('round-trips', () => {
    expect(parseRoute(routeHash('home'))).toBe('home');
  });
});
