export function renderCrisis(): HTMLElement {
  const el = document.createElement('section');
  el.setAttribute('aria-labelledby', 'area-title');
  el.innerHTML =
    '<h1 id="area-title">Crisis mode</h1><p>Steps for the first hours will appear here.</p>';
  return el;
}
