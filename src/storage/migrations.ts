/** Versioned storage schema. Pure: no DOM, no storage access. */

/** Everything the app persists. Later tasks extend this and add a migration. */
export interface AppData {
  profile: Record<string, unknown> | null;
  settings: Record<string, unknown>;
  progress: Record<string, unknown>;
}

export interface Envelope {
  version: number;
  data: unknown;
}

export type Migration = (data: unknown) => unknown;

export const CURRENT_VERSION = 1;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** MIGRATIONS[n] upgrades data from version n to n + 1. */
export const MIGRATIONS: readonly Migration[] = [
  // 0 -> 1: unversioned or partial data gains the full v1 shape.
  (data) => {
    const old = isRecord(data) ? data : {};
    return {
      profile: isRecord(old.profile) ? old.profile : null,
      settings: isRecord(old.settings) ? old.settings : {},
      progress: isRecord(old.progress) ? old.progress : {},
    };
  },
];

export function emptyData(): AppData {
  return { profile: null, settings: {}, progress: {} };
}

export class MigrationError extends Error {}

/** Runs every migration from the envelope's version up to `target`. */
export function migrate(
  envelope: Envelope,
  migrations: readonly Migration[] = MIGRATIONS,
  target: number = CURRENT_VERSION,
): Envelope {
  let { version, data } = envelope;
  if (!Number.isInteger(version) || version < 0) {
    throw new MigrationError(`Invalid schema version: ${String(version)}`);
  }
  if (version > target) {
    throw new MigrationError(`Data is from a newer version (${version}) than this app (${target})`);
  }
  while (version < target) {
    const step = migrations[version];
    if (!step) throw new MigrationError(`No migration from version ${version}`);
    data = step(data);
    version += 1;
  }
  return { version, data };
}

/** Reads a raw stored value into current-version AppData. */
export function toAppData(raw: unknown): AppData {
  if (raw === undefined || raw === null) return emptyData();
  const envelope: Envelope =
    isRecord(raw) && typeof raw.version === 'number'
      ? { version: raw.version, data: raw.data }
      : { version: 0, data: raw };
  return migrate(envelope).data as AppData;
}
