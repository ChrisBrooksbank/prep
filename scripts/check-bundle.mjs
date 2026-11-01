// Bundle budget check. Run after `vite build`: node scripts/check-bundle.mjs
// Initial JS (entry script plus modulepreload links in dist/index.html) must stay under the
// budget when gzipped, and must not contain three.js. Lazy chunks are not counted.
import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const BUDGET_BYTES = 150 * 1024;
const THREE_MARKERS = ['WebGLRenderer', 'THREE.'];

export function initialScripts(html) {
  const found = new Set();
  const tag = /<(script|link)\b[^>]*>/g;
  for (const [match] of html.matchAll(tag)) {
    const isScript = /^<script\b/.test(match) && /type="module"/.test(match);
    const isPreload = /^<link\b/.test(match) && /rel="modulepreload"/.test(match);
    if (!isScript && !isPreload) continue;
    const src = /(?:src|href)="([^"]+)"/.exec(match)?.[1];
    if (src && src.endsWith('.js')) found.add(src.replace(/^\//, '').replace(/^\.\//, ''));
  }
  return [...found];
}

export function checkBundle(distDir) {
  const indexPath = join(distDir, 'index.html');
  if (!existsSync(indexPath)) throw new Error(`${indexPath} not found. Run the build first.`);
  const files = initialScripts(readFileSync(indexPath, 'utf8'));
  if (files.length === 0) throw new Error('No initial scripts found in index.html.');
  const problems = [];
  let total = 0;
  for (const file of files) {
    const code = readFileSync(join(distDir, file));
    total += gzipSync(code).length;
    const text = code.toString('utf8');
    if (/three/i.test(file) || THREE_MARKERS.some((m) => text.includes(m))) {
      problems.push(`${file} looks like three.js; it must load from a lazy chunk only.`);
    }
  }
  if (total > BUDGET_BYTES) {
    problems.push(`Initial JS is ${(total / 1024).toFixed(1)} KB gzipped; budget is 150 KB.`);
  }
  return { files, total, problems };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { files, total, problems } = checkBundle(resolve('dist'));
    console.log(
      `Initial JS: ${files.length} file(s), ${(total / 1024).toFixed(1)} KB gzipped (budget 150 KB)`,
    );
    if (problems.length) {
      for (const p of problems) console.error(`FAIL: ${p}`);
      process.exit(1);
    }
    console.log('Bundle budget OK');
  } catch (e) {
    console.error(`FAIL: ${e.message}`);
    process.exit(1);
  }
}
