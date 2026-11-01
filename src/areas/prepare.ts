export function renderPrepare(): HTMLElement {
  const el = document.createElement('section');
  el.setAttribute('aria-labelledby', 'area-title');
  el.innerHTML =
    '<h1 id="area-title">Prepare</h1><p>Your prepare-ahead programme will appear here.</p>';
  return el;
}
