import { parseRoute } from './route';

/**
 * The "update ready" prompt is only ever shown outside crisis mode, and never applies itself:
 * the user chooses when to reload.
 */
export function shouldShowUpdatePrompt(updateReady: boolean, hash: string): boolean {
  return updateReady && parseRoute(hash) !== 'crisis';
}
