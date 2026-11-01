import { callCards } from './crisis-calls';
import { playbooks } from './crisis-playbooks';
import { knowTopics } from './crisis-topics';
import type { Dataset } from './sourced';

/** Every sourced data file, so the dev report can list items awaiting review. */
export const datasets: readonly Dataset[] = [
  { name: 'crisis-playbooks', items: playbooks },
  { name: 'crisis-topics', items: knowTopics },
  { name: 'crisis-calls', items: callCards },
];
