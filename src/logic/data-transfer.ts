/** Export and import of all app data as one JSON file. Pure: no DOM, no storage access. */
import {
  CURRENT_VERSION,
  MigrationError,
  isRecord,
  migrate,
  type AppData,
} from '../storage/migrations';
import { normaliseProfile, type Profile } from './profile';

export const EXPORT_APP_ID = 'ready';

export interface ExportFile {
  app: typeof EXPORT_APP_ID;
  version: number;
  exportedAt: string;
  data: AppData;
}

export type ImportResult = { ok: true; data: AppData } | { ok: false; error: string };

/** Serialises app data to the export file text. */
export function serialiseExport(data: AppData, now: Date = new Date()): string {
  const file: ExportFile = {
    app: EXPORT_APP_ID,
    version: CURRENT_VERSION,
    exportedAt: now.toISOString(),
    data,
  };
  return JSON.stringify(file, null, 2);
}

/** Suggested download name, e.g. "ready-backup-2026-11-01.json". */
export function exportFileName(now: Date = new Date()): string {
  return `ready-backup-${now.toISOString().slice(0, 10)}.json`;
}

function toRecord(profile: Profile | null): Record<string, unknown> | null {
  return profile ? { ...profile } : null;
}

function fail(error: string): ImportResult {
  return { ok: false, error };
}

/**
 * Validates and migrates an exported file. Never throws: any problem returns
 * a plain-words error, and the caller must then leave stored data untouched.
 */
export function parseImport(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return fail('This file is not valid JSON, so nothing was imported.');
  }
  if (!isRecord(raw) || raw.app !== EXPORT_APP_ID) {
    return fail('This file is not a backup from this app, so nothing was imported.');
  }
  if (typeof raw.version !== 'number' || !Number.isInteger(raw.version) || raw.version < 0) {
    return fail('This backup has no valid version number, so nothing was imported.');
  }
  if (!isRecord(raw.data)) {
    return fail('This backup has no data in it, so nothing was imported.');
  }
  let migrated: unknown;
  try {
    migrated = migrate({ version: raw.version, data: raw.data }).data;
  } catch (error) {
    if (error instanceof MigrationError && raw.version > CURRENT_VERSION) {
      return fail('This backup is from a newer version of the app, so nothing was imported.');
    }
    return fail('This backup could not be upgraded, so nothing was imported.');
  }
  if (!isRecord(migrated)) return fail('This backup is damaged, so nothing was imported.');
  const { profile, settings, progress } = migrated;
  if (profile !== null && !isRecord(profile)) {
    return fail('The household profile in this backup is damaged, so nothing was imported.');
  }
  if (!isRecord(settings) || !isRecord(progress)) {
    return fail('The settings or progress in this backup are damaged, so nothing was imported.');
  }
  return {
    ok: true,
    data: {
      profile: profile === null ? null : toRecord(normaliseProfile(profile)),
      settings,
      progress,
    },
  };
}
