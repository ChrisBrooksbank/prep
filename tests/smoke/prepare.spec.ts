import { expect, test } from '@playwright/test';
import { openSkippingOnboarding } from './helpers';

test('marking the first task done persists the ladder count across a reload', async ({ page }) => {
  await openSkippingOnboarding(page, '#prepare');
  const count = page.locator('[data-tier-count="1"]');
  await expect(count).toHaveText(/^0 of \d+ done$/);
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(count).toHaveText(/^1 of \d+ done$/);
  await page.reload();
  await expect(page.locator('[data-tier-count="1"]')).toHaveText(/^1 of \d+ done$/);
});

test('Not now moves to a different task and the current tier is highlighted', async ({ page }) => {
  await openSkippingOnboarding(page, '#prepare');
  const title = page.locator('.prepare-card .prepare-task-title');
  const first = await title.textContent();
  await page.getByRole('button', { name: 'Not now' }).click();
  await expect(title).not.toHaveText(first ?? '');
  await expect(page.locator('.prepare-rung.current')).toHaveCount(1);
});
