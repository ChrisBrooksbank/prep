import { expect, test } from '@playwright/test';
import { openSkippingOnboarding } from './helpers';

test('page loads and renders the app', async ({ page }) => {
  await openSkippingOnboarding(page);
  await expect(page).toHaveTitle('Ready');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
  await expect(page.locator('#app')).toContainText('Prepare');
});

test('dark theme is the default and fonts are served locally', async ({ page }) => {
  const external: string[] = [];
  const origin = new URL(process.env.BASE_URL ?? 'http://localhost').origin;
  page.on('request', (r) => {
    if (r.url().startsWith('http') && !r.url().startsWith(origin)) external.push(r.url());
  });
  await openSkippingOnboarding(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.evaluate(() => document.fonts.ready);
  expect(external).toEqual([]);
});
