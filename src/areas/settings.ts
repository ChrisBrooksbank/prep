import { datasets } from '../data/registry';
import { exportFileName, parseImport, serialiseExport } from '../logic/data-transfer';
import {
  THEME_OPTIONS,
  adviceLastUpdated,
  effectiveReduceMotion,
  readDisplaySettings,
} from '../logic/settings';
import { withoutPrepareProgress } from '../logic/prepare';
import { readBatterySaver } from '../logic/render-control';
import { getStore } from '../storage/instance';
import { applyReduceMotion, applyTheme } from '../ui/theme';

function heading(text: string): HTMLElement {
  const h = document.createElement('h2');
  h.textContent = text;
  return h;
}

function button(label: string, action: () => void, className = ''): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.className = className;
  b.addEventListener('click', action);
  return b;
}

function download(name: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const deviceReducesMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export async function renderSettings(): Promise<HTMLElement> {
  const store = await getStore();
  const display = readDisplaySettings((await store.load()).settings);

  const el = document.createElement('section');
  el.setAttribute('aria-labelledby', 'area-title');
  const title = document.createElement('h1');
  title.id = 'area-title';
  title.textContent = 'Settings';

  const status = document.createElement('p');
  status.setAttribute('role', 'status');

  const saveSetting = (key: string, value: unknown): void => {
    void store.update((d) => ({ ...d, settings: { ...d.settings, [key]: value } }));
  };

  const themeField = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = 'Theme';
  themeField.append(legend);
  for (const option of THEME_OPTIONS) {
    const label = document.createElement('label');
    label.className = 'choice';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'theme';
    input.value = option.value;
    input.checked = option.value === display.theme;
    input.addEventListener('change', () => {
      applyTheme(option.value);
      saveSetting('theme', option.value);
    });
    label.append(input, document.createTextNode(option.label));
    themeField.append(label);
  }

  const motionLabel = document.createElement('label');
  motionLabel.className = 'choice';
  const motion = document.createElement('input');
  motion.type = 'checkbox';
  motion.checked = display.reduceMotion;
  motion.addEventListener('change', () => {
    applyReduceMotion(effectiveReduceMotion(motion.checked, deviceReducesMotion()));
    saveSetting('reduceMotion', motion.checked);
  });
  motionLabel.append(motion, document.createTextNode('Reduce motion'));

  const saverLabel = document.createElement('label');
  saverLabel.className = 'choice';
  const saver = document.createElement('input');
  saver.type = 'checkbox';
  saver.checked = readBatterySaver((await store.load()).settings);
  saver.addEventListener('change', () => saveSetting('batterySaver', saver.checked));
  saverLabel.append(saver, document.createTextNode('Battery saver (2D views only, no 3D)'));

  const file = document.createElement('input');
  file.type = 'file';
  file.accept = 'application/json,.json';
  file.hidden = true;
  file.setAttribute('aria-label', 'Backup file to import');
  file.addEventListener('change', () => {
    const chosen = file.files?.[0];
    if (!chosen) return;
    void chosen
      .text()
      .then(async (text) => {
        const result = parseImport(text);
        if (!result.ok) {
          status.textContent = result.error;
          return;
        }
        await store.save(result.data);
        location.reload();
      })
      .finally(() => {
        file.value = '';
      });
  });

  const exportButton = button('Export my data', () => {
    void store.load().then((data) => {
      download(exportFileName(), serialiseExport(data));
      status.textContent = 'Backup saved to your downloads.';
    });
  });
  const importButton = button('Import a backup', () => file.click());

  const deleteButton = button('Delete all data', () => {
    const confirmRow = document.createElement('div');
    confirmRow.className = 'actions';
    const warning = document.createElement('p');
    warning.textContent = 'This removes your household, progress and settings from this device.';
    confirmRow.append(
      warning,
      button('Cancel', () => confirmRow.remove()),
      button(
        'Yes, delete everything',
        () => {
          void store.clear().then(() => {
            location.hash = '#onboarding';
            location.reload();
          });
        },
        'primary',
      ),
    );
    deleteButton.after(confirmRow);
  });

  const resetPrepare = button('Reset Prepare progress', () => {
    void store
      .update((d) => ({ ...d, progress: withoutPrepareProgress(d.progress) }))
      .then(() => {
        status.textContent =
          'Prepare progress reset. Your household and Crisis mode ticks are kept.';
      });
  });

  const updated = adviceLastUpdated(datasets);
  const advice = document.createElement('p');
  advice.textContent = updated
    ? `Advice data last updated: ${updated}`
    : 'Advice data last updated: no advice data added yet';

  const dataActions = document.createElement('div');
  dataActions.className = 'actions';
  dataActions.append(exportButton, importButton, file);

  el.append(
    title,
    heading('Display'),
    themeField,
    motionLabel,
    saverLabel,
    heading('Your data'),
    dataActions,
    resetPrepare,
    deleteButton,
    status,
    heading('Advice'),
    advice,
  );
  return el;
}
