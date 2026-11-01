import './ui/fonts';
import './ui/theme.css';
import { applyTheme } from './ui/theme';
import { logNeedsReview } from './ui/dev-report';

applyTheme();
logNeedsReview();

import { startRouter } from './ui/router';

const app = document.getElementById('app');
if (app) startRouter(app);
