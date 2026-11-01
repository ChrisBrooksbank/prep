import { expect, test } from '@playwright/test';
import { openSkippingOnboarding } from './helpers';

test('home 2D view: selecting a room changes the sheet, ticking changes the score and persists', async ({
  page,
}) => {
  await openSkippingOnboarding(page, '#home');
  await expect(page.getByRole('heading', { level: 1, name: 'Home' })).toBeVisible();
  await expect(page.locator('.home-example')).toBeVisible();
  await page.locator('[data-room="kitchen"]').click();
  await expect(page.locator('#sheet-title')).toHaveText('Kitchen');
  const score = page.locator('[data-home-score]');
  const before = await score.textContent();
  await page.locator('[data-item="tin-opener"]').check();
  await expect(score).not.toHaveText(before ?? '');
  await expect(page.locator('.home-example')).toHaveCount(0);
  const after = await score.textContent();
  await page.reload();
  await expect(page.locator('[data-home-score]')).toHaveText(after ?? '');
});
