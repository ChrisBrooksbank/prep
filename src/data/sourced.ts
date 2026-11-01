/**
 * Metadata every advice, target or phone-number record in `src/data/` carries.
 * Components never hard-code these values; they read them from data files.
 */
export interface Sourced {
  /** Where the figure or advice came from (organisation and page or document). */
  source: string;
  /** ISO date (YYYY-MM-DD) when the source was last checked. */
  lastChecked: string;
  /** True when the content is not taken from a spec and must be verified against `source`. */
  needsReview?: boolean;
}

/** A named group of sourced records, used to build the needs-review report. */
export interface Dataset {
  name: string;
  items: readonly (Sourced & { id: string })[];
}
