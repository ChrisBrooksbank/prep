import { parseRoute } from './route';

/** Below this fraction of charge we offer Crisis mode (spec: pwa-shell-offline.md, "below 20 percent"). */
export const LOW_BATTERY_LEVEL = 0.2;

export interface BatteryReading {
  level: number;
  charging: boolean;
}

/**
 * The low-battery hint is shown only when the battery is below 20 percent and not charging,
 * the user has not dismissed it, and they are not already in Crisis mode.
 */
export function shouldShowBatteryHint(
  reading: BatteryReading | null,
  dismissed: boolean,
  hash: string,
): boolean {
  if (!reading || dismissed) return false;
  if (parseRoute(hash) === 'crisis') return false;
  return !reading.charging && reading.level < LOW_BATTERY_LEVEL;
}
