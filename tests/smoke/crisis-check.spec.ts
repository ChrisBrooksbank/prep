import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openSkippingOnboarding } from './helpers';

const TABS = ['Do', 'Know', 'Call'] as const;

test('crisis mode has no animation, no canvas and no external requests', async ({ page }) => {
  const external: string[] = [];
  const origin = new URL('http://localhost:4173').origin;
  page.on('request', (r) => {
    if (r.url().startsWith('http') && !r.url().startsWith(origin)) external.push(r.url());
  });
  await openSkippingOnboarding(page, '#crisis');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Crisis mode');
  for (const tab of TABS) {
    await page.getByRole('tab', { name: tab, exact: true }).click();
    const found = await page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas').length;
      const animated = Array.from(document.querySelectorAll('*')).filter((e) => {
        const s = getComputedStyle(e);
        const animates = s.animationName !== 'none' && parseFloat(s.animationDuration) > 0;
        return animates || parseFloat(s.transitionDuration) > 0;
      });
      return { canvases, animated: animated.map((e) => e.tagName + '.' + e.className) };
    });
    expect(found.canvases).toBe(0);
    expect(found.animated).toEqual([]);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  }
  expect(external).toEqual([]);
});

for (const tab of TABS) {
  test(`axe finds no violations on the ${tab} tab`, async ({ page }) => {
    await openSkippingOnboarding(page, '#crisis');
    await page.getByRole('tab', { name: tab, exact: true }).click();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
}
