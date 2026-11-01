import { expect, test } from '@playwright/test';

test('page loads and renders the app', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Ready');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
  await expect(page.locator('#app')).toContainText('Ready');
});
