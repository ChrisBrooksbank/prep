import { expect, test } from '@playwright/test';

test('opens on Prepare and navigates between the three areas', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prepare');
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Home');
  await page.getByRole('link', { name: 'Prepare', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prepare');
});

test('#crisis deep link opens Crisis mode and the control is present elsewhere', async ({
  page,
}) => {
  await page.goto('/#crisis');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Crisis mode');
  await page.goto('/#home');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Home');
  await page.getByRole('link', { name: 'Crisis mode' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Crisis mode');
});
