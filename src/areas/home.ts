/** Stub. This module is only reached through a dynamic import, so it stays out of the Crisis and Prepare bundle. */
export function renderHome(): HTMLElement {
  const el = document.createElement('section');
  el.setAttribute('aria-labelledby', 'area-title');
  el.innerHTML = '<h1 id="area-title">Home</h1><p>Your home model will appear here.</p>';
  return el;
}
