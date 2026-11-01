import { describe, expect, it } from 'vitest';
import {
  isTap,
  pulseScale,
  READINESS_COLOURS,
  ROOM_LAYOUT,
  yawFromDrag,
  zoneColour,
} from './home-scene';
import { homeRooms } from '../data/home-rooms';

describe('home scene helpers', () => {
  it('treats small movement as a tap and large as a drag', () => {
    expect(isTap(2, 3)).toBe(true);
    expect(isTap(20, 0)).toBe(false);
  });
  it('colours zones by readiness thresholds', () => {
    expect(zoneColour(75)).toBe(READINESS_COLOURS.green);
    expect(zoneColour(50)).toBe(READINESS_COLOURS.amber);
    expect(zoneColour(49)).toBe(READINESS_COLOURS.red);
  });
  it('has a layout box for every room', () => {
    for (const r of homeRooms) expect(ROOM_LAYOUT[r.id]).toBeDefined();
  });
  it('does not pulse with reduced motion', () => {
    expect(pulseScale(1234, true)).toBe(1);
    expect(pulseScale(1234, false)).not.toBe(1);
  });
  it('clamps yaw', () => {
    expect(yawFromDrag(0, 10000)).toBeLessThan(Math.PI / 2);
    expect(yawFromDrag(0, -10000)).toBeGreaterThan(-Math.PI / 2);
    expect(yawFromDrag(0.1, 22)).toBeCloseTo(0.2);
  });
});
