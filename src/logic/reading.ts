import type { ReadingGroup, ReadingLink } from '../data/reading';

export interface ReadingSection {
  group: ReadingGroup;
  links: ReadingLink[];
}

/** Groups links in the given group order, dropping empty groups and keeping data order. */
export function groupReading(
  links: readonly ReadingLink[],
  groups: readonly ReadingGroup[],
): ReadingSection[] {
  return groups
    .map((group) => ({ group, links: links.filter((l) => l.group === group) }))
    .filter((s) => s.links.length > 0);
}

/** Links with no `verifiedOn` date, for the dev-only report ahead of a link-checker run. */
export function unverifiedLinks(links: readonly ReadingLink[]): ReadingLink[] {
  return links.filter((l) => !l.verifiedOn);
}
