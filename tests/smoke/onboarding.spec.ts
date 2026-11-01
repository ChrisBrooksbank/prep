import { expect, test } from '@playwright/test';
import { openSkippingOnboarding } from './helpers';

test('first run shows onboarding, one question per screen, and answers persist', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your household');
  await expect(page.getByText('Question 1 of 9')).toBeVisible();
  await page.getByLabel('flat', { exact: true }).check();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Question 2 of 9')).toBeVisible();
  await page.getByRole('button', { name: 'Skip', exact: true }).click();
  await page.getByRole('button', { name: 'Skip', exact: true }).click();
  await page.getByRole('button', { name: 'Skip setup' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prepare');

  // Reload: no longer first run, and the answer is editable later.
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prepare');
  await page.getByRole('link', { name: 'Household' }).click();
  await expect(page.getByLabel('flat', { exact: true })).toBeChecked();
});

test('skipping onboarding does not block Crisis mode', async ({ page }) => {
  await page.goto('/#crisis');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Crisis mode');
});

test('skipping everything lands on Prepare', async ({ page }) => {
  await openSkippingOnboarding(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prepare');
});
