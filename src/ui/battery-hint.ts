import { shouldShowBatteryHint, type BatteryReading } from '../logic/battery-hint';

interface BatteryManagerLike extends EventTarget {
  level: number;
  charging: boolean;
}

type NavigatorWithBattery = Navigator & { getBattery?: () => Promise<BatteryManagerLike> };

/** Progressive enhancement: where the Battery Status API exists, offers Crisis mode on low battery. No network, no storage. */
export function startBatteryHint(): void {
  const getBattery = (navigator as NavigatorWithBattery).getBattery;
  if (typeof getBattery !== 'function') return;

  void getBattery.call(navigator).then(
    (battery) => {
      let dismissed = false;
      const banner = document.createElement('div');
      banner.className = 'update-banner battery-banner';
      banner.setAttribute('role', 'status');
      banner.hidden = true;
      const text = document.createElement('span');
      text.textContent = 'Battery is low. Switch to Crisis mode to use less power?';
      const go = document.createElement('a');
      go.href = '#crisis';
      go.textContent = 'Crisis mode';
      go.className = 'battery-banner-link';
      const later = document.createElement('button');
      later.type = 'button';
      later.textContent = 'Not now';
      banner.append(text, go, later);
      document.body.append(banner);

      const refresh = (): void => {
        const reading: BatteryReading = { level: battery.level, charging: battery.charging };
        banner.hidden = !shouldShowBatteryHint(reading, dismissed, location.hash);
      };
      later.addEventListener('click', () => {
        dismissed = true;
        refresh();
      });
      battery.addEventListener('levelchange', refresh);
      battery.addEventListener('chargingchange', refresh);
      window.addEventListener('hashchange', refresh);
      refresh();
    },
    () => undefined,
  );
}
