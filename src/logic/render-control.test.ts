import { describe, expect, it } from 'vitest';
import { clampPixelRatio, readBatterySaver, shouldRender, shouldUse3D } from './render-control';

describe('clampPixelRatio', () => {
  it('caps at 2', () => {
    expect(clampPixelRatio(3)).toBe(2);
    expect(clampPixelRatio(2)).toBe(2);
    expect(clampPixelRatio(1.5)).toBe(1.5);
  });
  it('falls back to 1 for missing or invalid values', () => {
    expect(clampPixelRatio(undefined)).toBe(1);
    expect(clampPixelRatio(0)).toBe(1);
    expect(clampPixelRatio(NaN)).toBe(1);
    expect(clampPixelRatio(0.5)).toBe(1);
  });
});

describe('readBatterySaver', () => {
  it('is off unless explicitly true', () => {
    expect(readBatterySaver({})).toBe(false);
    expect(readBatterySaver({ batterySaver: 'yes' })).toBe(false);
    expect(readBatterySaver({ batterySaver: true })).toBe(true);
  });
});

describe('shouldRender', () => {
  it('needs both visibility signals', () => {
    expect(shouldRender({ inView: true, tabVisible: true })).toBe(true);
    expect(shouldRender({ inView: false, tabVisible: true })).toBe(false);
    expect(shouldRender({ inView: true, tabVisible: false })).toBe(false);
  });
});

describe('shouldUse3D', () => {
  it('uses 3D only with WebGL, no battery saver and no Crisis mode', () => {
    expect(shouldUse3D({ webgl: true, batterySaver: false, crisisMode: false })).toBe(true);
    expect(shouldUse3D({ webgl: false, batterySaver: false, crisisMode: false })).toBe(false);
    expect(shouldUse3D({ webgl: true, batterySaver: true, crisisMode: false })).toBe(false);
    expect(shouldUse3D({ webgl: true, batterySaver: false, crisisMode: true })).toBe(false);
  });
});
