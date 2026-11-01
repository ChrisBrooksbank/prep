/** Pure Crisis mode logic: step filtering and playbook timers. No DOM, no storage. */
import type { PlaybookStep, PlaybookTimer } from '../data/crisis-playbooks';
import { matchesCondition, type Profile } from './profile';

const HOUR_MS = 3_600_000;

/** Steps whose profile condition is true, or that have no condition, in order. */
export function visibleSteps<T extends Pick<PlaybookStep, 'when'>>(
  steps: readonly T[],
  profile: Profile | null,
): T[] {
  return steps.filter((s) => s.when === undefined || matchesCondition(profile, s.when));
}

/** Milliseconds since the playbook started. Never negative; 0 if not started. */
export function elapsedMs(startedAt: number | null, now: number): number {
  if (startedAt === null) return 0;
  return Math.max(0, now - startedAt);
}

/** Compact elapsed time, e.g. "0m", "45m", "3h 05m", "2d 4h". */
export function formatElapsed(ms: number): string {
  const totalMinutes = Math.floor(Math.max(0, ms) / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  return `${minutes}m`;
}

export interface TimerStatus {
  id: string;
  label: string;
  /** True once the timer's duration has passed. */
  expired: boolean;
  /** Time remaining, or 0 when expired. */
  remainingMs: number;
  /** Plain-words status line. */
  text: string;
}

/** Status line for one timer. Before a start time is set, it states the duration only. */
export function timerStatus(
  timer: PlaybookTimer,
  startedAt: number | null,
  now: number,
): TimerStatus {
  const totalMs = timer.hours * HOUR_MS;
  if (startedAt === null) {
    return {
      id: timer.id,
      label: timer.label,
      expired: false,
      remainingMs: totalMs,
      text: `${timer.label}: about ${timer.hours} hours`,
    };
  }
  const remainingMs = Math.max(0, totalMs - elapsedMs(startedAt, now));
  const expired = remainingMs === 0;
  return {
    id: timer.id,
    label: timer.label,
    expired,
    remainingMs,
    text: expired
      ? `${timer.label}: about ${timer.hours} hours passed. Check before eating`
      : `${timer.label}: about ${formatElapsed(remainingMs)} left of ${timer.hours} hours`,
  };
}

export function timerStatuses(
  timers: readonly PlaybookTimer[] | undefined,
  startedAt: number | null,
  now: number,
): TimerStatus[] {
  return (timers ?? []).map((t) => timerStatus(t, startedAt, now));
}

export const CRISIS_TABS = ['do', 'know', 'call'] as const;
export type CrisisTab = (typeof CRISIS_TABS)[number];

export const CRISIS_TAB_LABELS: Record<CrisisTab, string> = {
  do: 'Do',
  know: 'Know',
  call: 'Call',
};

/**
 * Start time of the active playbook, read from `progress.crisis.starts`
 * (playbook id to epoch ms). The most recent valid start wins; null if none.
 */
export function activePlaybookStart(progress: Record<string, unknown>): number | null {
  const crisis = progress.crisis;
  if (typeof crisis !== 'object' || crisis === null) return null;
  const starts = (crisis as Record<string, unknown>).starts;
  if (typeof starts !== 'object' || starts === null) return null;
  let latest: number | null = null;
  for (const value of Object.values(starts)) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      if (latest === null || value > latest) latest = value;
    }
  }
  return latest;
}

/** Elapsed-time text for the banner, e.g. "Elapsed 3h 05m", or a prompt when no playbook is started. */
export function elapsedBannerText(startedAt: number | null, now: number): string {
  return startedAt === null
    ? 'No playbook started'
    : `Elapsed ${formatElapsed(elapsedMs(startedAt, now))}`;
}
