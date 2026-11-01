// Regenerates docs/demo.gif. Needs the preview server on :4173 and ffmpeg on PATH.
// Usage: npm run build && npm run preview, then: node scripts/make-demo-gif.mjs
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

const OUT = process.argv[2] ?? 'docs/demo.gif';
const TMP = 'test-results/demo-frames';
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await (
  await browser.newContext({
    viewport: { width: 390, height: 780 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
  })
).newPage();

const frames = [];
async function shot(seconds) {
  const file = `${TMP}/f${String(frames.length).padStart(3, '0')}.png`;
  await page.screenshot({ path: file });
  frames.push({ file, seconds });
}
const settle = (ms = 500) => page.waitForTimeout(ms);

await page.goto('http://localhost:4173/');
await shot(2);
await page.getByRole('button', { name: 'Skip setup' }).click();
await page.getByRole('heading', { level: 1, name: 'Prepare' }).waitFor();
await settle();
await shot(2.5);

// Home: 3D house, then a room sheet
await page.goto('http://localhost:4173/#home');
await settle(2500);
await shot(2.5);
await page
  .locator('[data-room="kitchen"]')
  .click()
  .catch(() => {});
await settle();
await shot(2.5);
await page
  .locator('[data-item="tin-opener"]')
  .check()
  .catch(() => {});
await settle();
await shot(2);

// Pantry
await page
  .getByRole('button', { name: 'Pantry' })
  .click()
  .catch(() => {});
await settle(1200);
await shot(2.5);

// Crisis mode
await page.goto('http://localhost:4173/#crisis');
await settle(800);
await shot(2.5);
const steps = page.locator('input[data-step]');
for (let i = 0; i < 3; i++) {
  await steps.nth(i).check();
  await settle(250);
  await shot(1);
}
await page
  .getByRole('button', { name: 'Know' })
  .click()
  .catch(() => {});
await settle();
await shot(2);
await page
  .getByRole('button', { name: 'Call' })
  .click()
  .catch(() => {});
await settle();
await shot(2.5);
await browser.close();

const list =
  frames.map((f) => `file '${f.file.replace(`${TMP}/`, '')}'\nduration ${f.seconds}`).join('\n') +
  `\nfile '${frames.at(-1).file.replace(`${TMP}/`, '')}'\n`;
writeFileSync(`${TMP}/list.txt`, list);
execFileSync(
  'ffmpeg',
  [
    '-y',
    '-loglevel',
    'error',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    `${TMP}/list.txt`,
    '-vf',
    'scale=300:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4',
    OUT,
  ],
  { stdio: 'inherit' },
);
console.log(`wrote ${OUT} from ${frames.length} frames`);
