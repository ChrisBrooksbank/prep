import { expect, test } from '@playwright/test';
import { openSkippingOnboarding } from './helpers';

test('settings: theme persists across reload', async ({ page }) => {
  await openSkippingOnboarding(page, '#settings');
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
  await page.getByLabel('High contrast').check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'high-contrast');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'high-contrast');
});

test('settings: malformed import shows an error', async ({ page }) => {
  await openSkippingOnboarding(page, '#settings');
  await page.getByLabel('Backup file to import').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('not json'),
  });
  await expect(page.getByRole('status')).toContainText('nothing was imported');
});

test('settings: delete all data returns to onboarding', async ({ page }) => {
  await openSkippingOnboarding(page, '#settings');
  await page.getByRole('button', { name: 'Delete all data' }).click();
  await page.getByRole('button', { name: 'Yes, delete everything' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your household');
});
