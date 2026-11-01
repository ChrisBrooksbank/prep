import { describe, expect, it } from 'vitest';
import { callCards } from './crisis-calls';
import { PLAYBOOK_IDS, playbooks } from './crisis-playbooks';
import { TOPIC_IDS, knowTopics } from './crisis-topics';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe('crisis data files', () => {
  it('has the five playbooks, seven topics and seven call cards', () => {
    expect(playbooks.map((p) => p.id)).toEqual([...PLAYBOOK_IDS]);
    expect(knowTopics.map((t) => t.id)).toEqual([...TOPIC_IDS]);
    expect(callCards).toHaveLength(7);
  });

  it('gives every record a source and an ISO lastChecked', () => {
    for (const item of [...playbooks, ...knowTopics, ...callCards]) {
      expect(item.source.length).toBeGreaterThan(0);
      expect(item.lastChecked).toMatch(ISO_DATE);
    }
  });

  it('flags all topics as needing review', () => {
    expect(knowTopics.every((t) => t.needsReview === true)).toBe(true);
  });

  it('points every playbook at an existing call card', () => {
    const ids = new Set(callCards.map((c) => c.id));
    for (const p of playbooks) expect(ids.has(p.primaryCall)).toBe(true);
  });

  it('uses unique step ids within each playbook', () => {
    for (const p of playbooks) {
      const ids = p.steps.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('includes the required power cut steps and gas hob condition', () => {
    const power = playbooks.find((p) => p.id === 'power-cut');
    expect(power?.steps.find((s) => s.id === 'gas-hob')?.when).toBe('hasGasHob');
    expect(power?.steps.find((s) => s.id === 'boiler-needs-power')?.when).toBe('gasBoiler');
    expect(power?.timers?.map((t) => t.hours)).toEqual([4, 48, 24]);
    expect(power?.steps.length).toBeGreaterThanOrEqual(7);
  });

  it('covers every required power cut step, in order, with the right conditions', () => {
    const power = playbooks.find((p) => p.id === 'power-cut');
    const byId = new Map(power?.steps.map((s) => [s.id, s]));
    const required = [
      'fuse-board',
      'report-105',
      'torches',
      'fridge-shut',
      'boiler-needs-power',
      'charge-phone',
      'gas-hob',
    ];
    expect(power?.steps.map((s) => s.id)).toEqual(required);
    expect(byId.get('fuse-board')?.text).toMatch(/fuse board.*neighbour/i);
    expect(byId.get('report-105')?.text).toContain('105');
    expect(byId.get('torches')?.text).toMatch(/torches.*not candles/i);
    expect(byId.get('fridge-shut')?.note).toMatch(/4 hours/);
    expect(byId.get('boiler-needs-power')?.note).toMatch(/one warm room/i);
    expect(byId.get('charge-phone')?.text).toMatch(/power bank/i);
    expect(byId.get('charge-phone')?.note).toMatch(/low power/i);
    expect(byId.get('gas-hob')?.note).toMatch(/window/i);
    const conditional = power?.steps.filter((s) => s.when).map((s) => s.id);
    expect(conditional).toEqual(['boiler-needs-power', 'gas-hob']);
  });

  it('gives each call card either a number or a profile source', () => {
    for (const c of callCards) expect(Boolean(c.number) !== Boolean(c.fromProfile)).toBe(true);
  });

  it('has a danger line in the warm, food and cooking topics', () => {
    for (const id of ['keep-warm', 'food-safety', 'cook-safely']) {
      expect(knowTopics.find((t) => t.id === id)?.lines.some((l) => l.danger)).toBe(true);
    }
  });
});
