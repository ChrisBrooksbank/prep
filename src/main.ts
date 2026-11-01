import './ui/fonts';
import './ui/theme.css';
import { applyTheme } from './ui/theme';

applyTheme();

const app = document.getElementById('app');
if (app) {
  app.textContent = 'Ready';
}
