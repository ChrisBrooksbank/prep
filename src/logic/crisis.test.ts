import { describe, expect, it } from 'vitest';
import { playbooks } from '../data/crisis-playbooks';
import {
  activePlaybookStart,
  elapsedBannerText,
  elapsedMs,
  readCrisisProgress,
  resetPlaybook,
  startPlaybook,
  tickedCount,
  toggleTick,
  withCrisisProgress,
  formatElapsed,
  timerStatus,
  timerStatuses,
  visibleSteps,
} from './crisis';
import { defaultProfile } from './profile';

const power = playbooks.find((p) => p.id === 'power-cut')!;
const HOUR = 3_600_000;

describe('visibleSteps', () => {
  it('shows the gas hob step only with a gas hob', () => {
    const gas = visibleSteps(power.steps, defaultProfile());
    const electric = visibleSteps(power.steps, { ...defaultProfile(), cooking: 'induction' });
    expect(gas.some((s) => s.id === 'gas-hob')).toBe(true);
    expect(electric.some((s) => s.id === 'gas-hob')).toBe(false);
    expect(electric.length).toBe(gas.length - 1);
  });

  it('hides the boiler step without a gas boiler', () => {
    const p = { ...defaultProfile(), heating: 'electric' as const };
    expect(visibleSteps(power.steps, p).some((s) => s.id === 'boiler-needs-power')).toBe(false);
  });

  it('hides conditional steps with no profile but keeps others in order', () => {
    const steps = visibleSteps(power.steps, null);
    expect(steps.every((s) => s.when === undefined)).toBe(true);
    expect(steps[0]?.id).toBe('fuse-board');
  });
});

describe('elapsed time', () => {
  it('is zero when not started and never negative', () => {
    expect(elapsedMs(null, 1000)).toBe(0);
    expect(elapsedMs(2000, 1000)).toBe(0);
    expect(elapsedMs(1000, 4000)).toBe(3000);
  });

  it('formats minutes, hours and days', () => {
    expect(formatElapsed(0)).toBe('0m');
    expect(formatElapsed(45 * 60_000)).toBe('45m');
    expect(formatElapsed(3 * HOUR + 5 * 60_000)).toBe('3h 05m');
    expect(formatElapsed(52 * HOUR)).toBe('2d 4h');
  });
});

describe('timers', () => {
  const fridge = { id: 'fridge', label: 'Fridge food', hours: 4 };

  it('states the duration before a start time', () => {
    const s = timerStatus(fridge, null, 0);
    expect(s.expired).toBe(false);
    expect(s.text).toBe('Fridge food: about 4 hours');
  });

  it('counts down from the start time', () => {
    const s = timerStatus(fridge, 0, 1 * HOUR);
    expect(s.expired).toBe(false);
    expect(s.remainingMs).toBe(3 * HOUR);
    expect(s.text).toContain('3h 00m left');
  });

  it('expires at the duration', () => {
    const s = timerStatus(fridge, 0, 4 * HOUR);
    expect(s.expired).toBe(true);
    expect(s.remainingMs).toBe(0);
  });

  it('covers fridge 4h, full freezer 48h and half-full 24h', () => {
    const at25h = timerStatuses(power.timers, 0, 25 * HOUR);
    expect(at25h.map((t) => [t.id, t.expired])).toEqual([
      ['fridge', true],
      ['freezer-full', false],
      ['freezer-half', true],
    ]);
    expect(timerStatuses(undefined, 0, 0)).toEqual([]);
  });
});

describe('crisis shell helpers', () => {
  it('reads the most recent playbook start', () => {
    expect(activePlaybookStart({})).toBeNull();
    expect(activePlaybookStart({ crisis: { starts: {} } })).toBeNull();
    expect(activePlaybookStart({ crisis: { starts: { a: 100, b: 300, c: 'x', d: -1 } } })).toBe(
      300,
    );
  });

  it('words the banner elapsed time', () => {
    expect(elapsedBannerText(null, 5000)).toBe('No playbook started');
    expect(elapsedBannerText(0 + 1, 1 + 65 * 60_000)).toBe('Elapsed 1h 05m');
  });
});

describe('crisis progress', () => {
  const empty = readCrisisProgress({});

  it('reads malformed progress as empty', () => {
    expect(readCrisisProgress({ crisis: 5 })).toEqual(empty);
    expect(readCrisisProgress({ crisis: { starts: { a: -1, b: 'x' }, ticks: { c: 1 } } })).toEqual(
      empty,
    );
  });

  it('toggles ticks on and off', () => {
    const on = toggleTick(empty, 'power-cut', 'torches');
    expect(on.ticks['power-cut:torches']).toBe(true);
    expect(tickedCount(on, 'power-cut', power.steps)).toBe(1);
    expect(toggleTick(on, 'power-cut', 'torches').ticks).toEqual({});
  });

  it('resets only the chosen playbook', () => {
    let c = toggleTick(empty, 'power-cut', 'torches');
    c = toggleTick(c, 'storm', 'stay-in');
    c = startPlaybook(startPlaybook(c, 'power-cut', 1000), 'storm', 2000);
    const r = resetPlaybook(c, 'power-cut');
    expect(r.ticks).toEqual({ 'storm:stay-in': true });
    expect(r.starts).toEqual({ storm: 2000 });
  });

  it('keeps other progress keys', () => {
    expect(withCrisisProgress({ tasks: 1 }, empty)).toEqual({ tasks: 1, crisis: empty });
  });
});
