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

/** Crisis progress as stored under `progress.crisis`. */
export interface CrisisProgress {
  /** Playbook id to start time (epoch ms). */
  starts: Record<string, number>;
  /** `playbookId:stepId` to true for ticked steps. */
  ticks: Record<string, true>;
}

export function tickKey(playbookId: string, stepId: string): string {
  return `${playbookId}:${stepId}`;
}

/** Reads `progress.crisis` defensively; anything malformed is dropped. */
export function readCrisisProgress(progress: Record<string, unknown>): CrisisProgress {
  const out: CrisisProgress = { starts: {}, ticks: {} };
  const crisis = progress.crisis;
  if (typeof crisis !== 'object' || crisis === null) return out;
  const { starts, ticks } = crisis as Record<string, unknown>;
  if (typeof starts === 'object' && starts !== null) {
    for (const [k, v] of Object.entries(starts)) {
      if (typeof v === 'number' && Number.isFinite(v) && v > 0) out.starts[k] = v;
    }
  }
  if (typeof ticks === 'object' && ticks !== null) {
    for (const [k, v] of Object.entries(ticks)) if (v === true) out.ticks[k] = true;
  }
  return out;
}

/** Returns a new progress object with the crisis part replaced; other keys are kept. */
export function withCrisisProgress(
  progress: Record<string, unknown>,
  crisis: CrisisProgress,
): Record<string, unknown> {
  return { ...progress, crisis };
}

export function toggleTick(
  crisis: CrisisProgress,
  playbookId: string,
  stepId: string,
): CrisisProgress {
  const key = tickKey(playbookId, stepId);
  const ticks = { ...crisis.ticks };
  if (ticks[key]) delete ticks[key];
  else ticks[key] = true;
  return { ...crisis, ticks };
}

export function startPlaybook(
  crisis: CrisisProgress,
  playbookId: string,
  now: number,
): CrisisProgress {
  return { ...crisis, starts: { ...crisis.starts, [playbookId]: now } };
}

/** Clears ticks and the start time for one playbook only. */
export function resetPlaybook(crisis: CrisisProgress, playbookId: string): CrisisProgress {
  const prefix = `${playbookId}:`;
  const starts = { ...crisis.starts };
  delete starts[playbookId];
  const ticks: Record<string, true> = {};
  for (const k of Object.keys(crisis.ticks)) if (!k.startsWith(prefix)) ticks[k] = true;
  return { starts, ticks };
}

/** Number of visible steps ticked. */
export function tickedCount(
  crisis: CrisisProgress,
  playbookId: string,
  steps: readonly { id: string }[],
): number {
  return steps.filter((s) => crisis.ticks[tickKey(playbookId, s.id)]).length;
}
