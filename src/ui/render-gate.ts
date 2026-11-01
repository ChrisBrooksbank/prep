/** Tracks whether a canvas should draw: on screen and tab in the foreground. Tiny; safe for any chunk. */
import { shouldRender } from '../logic/render-control';

export interface RenderGateHandle {
  dispose(): void;
}

/** Calls `onChange(true|false)` whenever drawing should resume or pause. */
export function watchRenderGate(
  target: Element,
  onChange: (active: boolean) => void,
): RenderGateHandle {
  let inView = true;
  let tabVisible = document.visibilityState !== 'hidden';
  let last: boolean | null = null;
  const emit = (): void => {
    const active = shouldRender({ inView, tabVisible });
    if (active !== last) {
      last = active;
      onChange(active);
    }
  };
  const onVisibility = (): void => {
    tabVisible = document.visibilityState !== 'hidden';
    emit();
  };
  document.addEventListener('visibilitychange', onVisibility);
  let observer: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry) {
        inView = entry.isIntersecting;
        emit();
      }
    });
    observer.observe(target);
  }
  return {
    dispose() {
      document.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
    },
  };
}
