import './ui/fonts';
import './ui/theme.css';
import { applyReduceMotion, applyTheme } from './ui/theme';
import { effectiveReduceMotion, readDisplaySettings } from './logic/settings';
import { getStore } from './storage/instance';
import { logNeedsReview } from './ui/dev-report';

import { startUpdatePrompt } from './ui/update-prompt';

applyTheme();
logNeedsReview();

import { startRouter } from './ui/router';

const deviceReducesMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
applyReduceMotion(deviceReducesMotion);
void getStore()
  .then((store) => store.load())
  .then((data) => {
    const display = readDisplaySettings(data.settings);
    applyTheme(display.theme);
    applyReduceMotion(effectiveReduceMotion(display.reduceMotion, deviceReducesMotion));
  });

const app = document.getElementById('app');
if (app) startRouter(app);
startUpdatePrompt();
