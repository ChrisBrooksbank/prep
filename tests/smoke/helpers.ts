import type { Page } from '@playwright/test';

/** Opens the app and gets past first-run onboarding by skipping it. */
export async function openSkippingOnboarding(page: Page, hash = ''): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip setup' }).click();
  await page.getByRole('heading', { level: 1, name: 'Prepare' }).waitFor();
  if (hash) await page.goto(`/${hash}`);
}
