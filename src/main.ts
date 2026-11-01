import './ui/fonts';
import './ui/theme.css';
import { applyTheme } from './ui/theme';
import { logNeedsReview } from './ui/dev-report';

applyTheme();
logNeedsReview();

const app = document.getElementById('app');
if (app) {
  app.textContent = 'Ready';
}
