import { expect, test, type Page } from '@playwright/test';
import { openSkippingOnboarding } from './helpers';

/** Waits until the service worker is active (it controls the page from the next load). */
async function waitForWorker(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
}

test('offline reload still renders Crisis, Prepare and Home', async ({ page, context }) => {
  await openSkippingOnboarding(page);
  await waitForWorker(page);
  await page.reload(); // second load so the active worker controls the page
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prepare');
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Home');
  await page.getByRole('link', { name: 'Crisis mode' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Crisis mode');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Crisis mode');
  await page.goto('/#home');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Home');
});

test('no cross-origin requests are made while using every area', async ({ page }) => {
  const external: string[] = [];
  const origin = new URL('http://localhost:4173').origin;
  page.on('request', (r) => {
    if (r.url().startsWith('http') && !r.url().startsWith(origin)) external.push(r.url());
  });
  await openSkippingOnboarding(page);
  for (const hash of ['#home', '#crisis', '#settings', '#prepare']) {
    await page.goto(`/${hash}`);
    await page.waitForLoadState('networkidle');
  }
  expect(external).toEqual([]);
});

test('installability: manifest, icons and service worker are in place', async ({
  page,
  request,
}) => {
  await openSkippingOnboarding(page);
  await waitForWorker(page);
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBeTruthy();
  const res = await request.get(new URL(href ?? '', page.url()).toString());
  expect(res.ok()).toBe(true);
  const manifest = (await res.json()) as {
    name: string;
    short_name: string;
    display: string;
    start_url: string;
    lang: string;
    icons: { src: string; sizes: string; purpose?: string }[];
  };
  expect(manifest.name).toBe('Ready');
  expect(manifest.short_name).toBeTruthy();
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toBeTruthy();
  expect(manifest.lang).toBe('en-GB');
  expect(manifest.icons.some((i) => i.sizes === '192x192')).toBe(true);
  expect(manifest.icons.some((i) => i.sizes === '512x512')).toBe(true);
  expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);
  for (const icon of manifest.icons) {
    const r = await request.get(new URL(icon.src, new URL(href ?? '', page.url())).toString());
    expect(r.ok()).toBe(true);
  }
});
