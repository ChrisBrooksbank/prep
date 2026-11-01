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

test('pantry 2D view: example label, add stock changes cover, persists, reset', async ({
  page,
}) => {
  await openSkippingOnboarding(page, '#home');
  await page.getByRole('button', { name: 'Pantry' }).click();
  await expect(page.locator('.pantry-example')).toBeVisible();
  const days = page.locator('[data-pantry-days]');
  const before = await days.textContent();
  await page.locator('[data-people="1"]').click();
  await expect(days).not.toHaveText(before ?? '');
  await page.locator('[data-add="fats:2"]').click();
  await expect(page.locator('.pantry-example')).toHaveCount(0);
  const after = await days.textContent();
  await page.reload();
  await page.getByRole('button', { name: 'Pantry' }).click();
  await expect(page.locator('[data-pantry-days]')).toHaveText(after ?? '');
  await page.locator('[data-pantry-reset]').click();
  await expect(page.locator('[data-pantry-days]')).toHaveText('0');
  await expect(page.locator('[data-tier="3"]')).not.toHaveClass(/reached/);
});

test('3D view: canvas is non-blank, tapping a room changes the sheet title, 2D matches', async ({
  page,
}) => {
  await openSkippingOnboarding(page, '#home');
  const canvas = page.locator('canvas.home-canvas:not(.pantry-canvas)');
  await expect(canvas).toBeVisible();

  const nonBlank = await canvas.evaluate((node) => {
    const c = node as HTMLCanvasElement;
    const copy = document.createElement('canvas');
    copy.width = c.width;
    copy.height = c.height;
    const ctx = copy.getContext('2d')!;
    ctx.drawImage(c, 0, 0);
    const data = ctx.getImageData(0, 0, copy.width, copy.height).data;
    let painted = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i]! > 0) painted++;
    return painted;
  });
  expect(nonBlank).toBeGreaterThan(100);

  // Find a room other than the selected one, then tap where its label sits.
  const initial = await page.locator('#sheet-title').textContent();
  const labels = page.locator('.home-label[data-room]');
  const count = await labels.count();
  expect(count).toBeGreaterThan(1);
  let changed = false;
  const box = (await canvas.boundingBox())!;
  for (let i = 0; i < count && !changed; i++) {
    const lb = await labels.nth(i).boundingBox();
    if (!lb) continue;
    const x = lb.x + lb.width / 2;
    const y = lb.y + lb.height / 2;
    if (x < box.x || x > box.x + box.width || y < box.y || y > box.y + box.height) continue;
    await page.mouse.click(x, y);
    await page.waitForTimeout(100);
    changed = (await page.locator('#sheet-title').textContent()) !== initial;
  }
  expect(changed).toBe(true);

  // 2D list shows the same percentages as the 3D labels.
  const rooms = page.locator('button[data-room]');
  for (let i = 0; i < (await rooms.count()); i++) {
    const id = await rooms.nth(i).getAttribute('data-room');
    const pct = (await rooms.nth(i).locator('.home-room-percent').textContent()) ?? '';
    const label = (await page.locator(`.home-label[data-room="${id}"]`).textContent()) ?? '';
    expect(label.endsWith(pct)).toBe(true);
  }
});

test('Home chunks load only when Home is opened', async ({ page }) => {
  const scripts: string[] = [];
  page.on('request', (r) => {
    if (r.resourceType() === 'script') scripts.push(r.url());
  });
  await openSkippingOnboarding(page);
  expect(scripts.some((u) => /\/assets\/(home|home-scene|pantry-scene)-/.test(u))).toBe(false);
  await page.goto('/#home');
  await expect(page.getByRole('heading', { level: 1, name: 'Home' })).toBeVisible();
  await expect.poll(() => scripts.some((u) => /\/assets\/home-scene-/.test(u))).toBe(true);
});
