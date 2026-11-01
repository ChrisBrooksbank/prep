import type { Dataset } from '../data/sourced';

export interface ReviewEntry {
  dataset: string;
  id: string;
  source: string;
  lastChecked: string;
}

/** Lists every item flagged `needsReview`, in dataset then item order. */
export function findNeedsReview(datasets: readonly Dataset[]): ReviewEntry[] {
  return datasets.flatMap((dataset) =>
    dataset.items
      .filter((item) => item.needsReview === true)
      .map((item) => ({
        dataset: dataset.name,
        id: item.id,
        source: item.source,
        lastChecked: item.lastChecked,
      })),
  );
}
