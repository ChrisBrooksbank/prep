import { datasets } from '../data/registry';
import { findNeedsReview } from '../logic/needs-review';

/** Dev-only: prints data items still flagged `needsReview` to the console. */
export function logNeedsReview(): void {
  if (!import.meta.env.DEV) return;
  const entries = findNeedsReview(datasets);
  if (entries.length === 0) return;
  console.groupCollapsed(`[data] ${entries.length} item(s) need review`);
  console.table(entries);
  console.groupEnd();
}
