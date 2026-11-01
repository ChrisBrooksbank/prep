import { describe, expect, it } from 'vitest';
import { readingGroups, readingLinks } from '../data/reading';
import { groupReading, unverifiedLinks } from './reading';

describe('reading data', () => {
  it('has unique ids and https urls', () => {
    expect(new Set(readingLinks.map((l) => l.id)).size).toBe(readingLinks.length);
    for (const l of readingLinks) expect(l.url).toMatch(/^https:\/\//);
  });

  it('puts every link in a known group with source and lastChecked', () => {
    for (const l of readingLinks) {
      expect(readingGroups).toContain(l.group);
      expect(l.source).not.toBe('');
      expect(l.lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('groupReading', () => {
  it('returns groups in order and omits empty ones', () => {
    const sections = groupReading(readingLinks, readingGroups);
    expect(sections.map((s) => s.group)).toEqual([...readingGroups]);
    const only = groupReading(
      readingLinks.filter((l) => l.group === 'UK official'),
      readingGroups,
    );
    expect(only).toHaveLength(1);
  });
});

describe('unverifiedLinks', () => {
  it('lists links without verifiedOn', () => {
    const verified = { ...readingLinks[0]!, verifiedOn: '2026-11-01' };
    const result = unverifiedLinks([verified, readingLinks[1]!]);
    expect(result.map((l) => l.id)).toEqual([readingLinks[1]!.id]);
  });
});
