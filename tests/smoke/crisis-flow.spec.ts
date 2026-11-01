import { expect, test, type Page } from '@playwright/test';
import { openSkippingOnboarding } from './helpers';

const GAS_HOB_STEP = 'Light the gas hob with a match for hot drinks';

/** Walks onboarding: answers the cooking question, skips the rest. */
async function onboardWithCooking(page: Page, cooking: string): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip', exact: true }).click(); // home type
  await page.getByRole('button', { name: 'Skip', exact: true }).click(); // heating
  await page.getByLabel(cooking, { exact: true }).check();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Skip setup' }).click();
  await page.getByRole('heading', { level: 1, name: 'Prepare' }).waitFor();
}

test('a ticked step persists across a reload', async ({ page }) => {
  await openSkippingOnboarding(page, '#crisis');
  const first = page.locator('input[data-step]').first();
  await first.check();
  await expect(first).toBeChecked();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Crisis mode');
  await expect(page.locator('input[data-step]').first()).toBeChecked();
});

test('changing the household cooking answer adds or removes the gas hob step', async ({ page }) => {
  await onboardWithCooking(page, 'gas hob');
  await page.goto('/#crisis');
  await expect(page.getByText(GAS_HOB_STEP)).toBeVisible();

  await page.goto('/#prepare');
  await page.getByRole('link', { name: 'Household' }).click();
  await page.getByRole('button', { name: 'Skip', exact: true }).click();
  await page.getByRole('button', { name: 'Skip', exact: true }).click();
  await page.getByLabel('electric hob', { exact: true }).check();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Skip setup' }).click();
  await page.getByRole('heading', { level: 1, name: 'Prepare' }).waitFor();

  await page.goto('/#crisis');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Crisis mode');
  await expect(page.locator('input[data-step]').first()).toBeVisible();
  await expect(page.getByText(GAS_HOB_STEP)).toHaveCount(0);
});

test('Do, Know and Call tabs work offline', async ({ page, context }) => {
  await openSkippingOnboarding(page, '#crisis');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Crisis mode');
  await expect(page.locator('input[data-step]').first()).toBeVisible();
  await page.getByRole('tab', { name: 'Know', exact: true }).click();
  await expect(page.getByRole('tabpanel')).toBeVisible();
  await page.getByRole('tab', { name: 'Call', exact: true }).click();
  await expect(page.locator('a[href^="tel:"]').first()).toBeVisible();
  await page.getByRole('tab', { name: 'Do', exact: true }).click();
  await expect(page.locator('input[data-step]').first()).toBeVisible();
});
