import { registerSW } from 'virtual:pwa-register';
import { shouldShowUpdatePrompt } from '../logic/update-prompt';

/** Registers the service worker and shows a quiet banner when a new version is waiting. Never reloads by itself. */
export function startUpdatePrompt(): void {
  if (!('serviceWorker' in navigator)) return;
  let updateReady = false;
  const banner = document.createElement('div');
  banner.className = 'update-banner';
  banner.setAttribute('role', 'status');
  banner.hidden = true;
  const text = document.createElement('span');
  text.textContent = 'A new version is ready.';
  const apply = document.createElement('button');
  apply.type = 'button';
  apply.textContent = 'Update now';
  const later = document.createElement('button');
  later.type = 'button';
  later.textContent = 'Later';
  banner.append(text, apply, later);
  document.body.append(banner);

  const refresh = (): void => {
    banner.hidden = !shouldShowUpdatePrompt(updateReady, location.hash);
  };
  const updateSW = registerSW({
    onNeedRefresh() {
      updateReady = true;
      refresh();
    },
  });
  apply.addEventListener('click', () => void updateSW(true));
  later.addEventListener('click', () => {
    updateReady = false;
    refresh();
  });
  window.addEventListener('hashchange', refresh);
}
