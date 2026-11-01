import { datasets } from '../data/registry';
import { readingLinks } from '../data/reading';
import { findNeedsReview } from '../logic/needs-review';
import { unverifiedLinks } from '../logic/reading';

/** Dev-only: prints data items still flagged `needsReview` to the console. */
export function logNeedsReview(): void {
  if (!import.meta.env.DEV) return;
  const unverified = unverifiedLinks(readingLinks);
  if (unverified.length > 0) {
    console.groupCollapsed(`[data] ${unverified.length} reading link(s) not verified`);
    console.table(unverified.map((l) => ({ id: l.id, url: l.url })));
    console.groupEnd();
  }
  const entries = findNeedsReview(datasets);
  if (entries.length === 0) return;
  console.groupCollapsed(`[data] ${entries.length} item(s) need review`);
  console.table(entries);
  console.groupEnd();
}
