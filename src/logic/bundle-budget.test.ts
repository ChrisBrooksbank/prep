import { describe, expect, it } from 'vitest';
// @ts-expect-error plain .mjs build script without types
import { initialScripts, BUDGET_BYTES } from '../../scripts/check-bundle.mjs';

describe('bundle budget script', () => {
  it('finds the entry script and modulepreload links only', () => {
    const html = `<script type="module" crossorigin src="/assets/index-a.js"></script>
      <link rel="modulepreload" crossorigin href="/assets/shared-b.js">
      <link rel="stylesheet" href="/assets/index.css">`;
    expect(initialScripts(html)).toEqual(['assets/index-a.js', 'assets/shared-b.js']);
  });
  it('budget is 150 KB', () => {
    expect(BUDGET_BYTES).toBe(150 * 1024);
  });
});
