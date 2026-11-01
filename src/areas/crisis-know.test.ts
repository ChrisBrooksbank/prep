import { describe, expect, it } from 'vitest';
import { knowTopics } from '../data/crisis-topics';
import { taskSlug } from './crisis-know';

describe('know tab', () => {
  it('slugs a task title for the Prepare deep link', () => {
    expect(taskSlug('Book a first aid course')).toBe('book-a-first-aid-course');
  });

  it('first aid links to the Prepare task', () => {
    const topic = knowTopics.find((t) => t.id === 'first-aid');
    expect(topic?.prepareTaskLink?.taskTitle).toBe('Book a first aid course');
  });
});
