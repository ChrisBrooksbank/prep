# AGENTS.md - Operational Guide

Keep this file under 60 lines. It's loaded every iteration.

## Project

Ready (working name): an offline-first, privacy-first UK household preparedness PWA with a crisis mode, a prepare-ahead programme and a 3D home model. Specs are in `specs/`. The visual prototype is `specs/reference/concept-prototype.html`.

## Stack (decided)

Vite + TypeScript (strict), no UI framework, three.js (lazy-loaded, never in crisis mode), vite-plugin-pwa (Workbox), Vitest, Playwright, ESLint, Prettier. Package manager: npm.

## Build Commands

```bash
npm run build          # Production build
npm run dev            # Development server
npm run preview        # Serve the production build
```

## Test Commands

```bash
npm run test:run       # Unit tests once (Vitest)
npm run test:smoke     # Playwright smoke tests against the preview build
```

## Validation (run before committing)

```bash
npm run check          # typecheck + lint + format check + unit tests + build + smoke tests
```

If `package.json` does not exist yet, the first plan task is the scaffold that creates these scripts.

## Rules that apply everywhere

- Crisis mode: no WebGL, no animation, no network requests, AAA contrast, 48px minimum targets.
- No accounts, no analytics, no third-party runtime requests. All data stays on the device.
- Reduced motion is respected. Dark is the default theme.
- UK English, plain words, calm tone. No emoji, no scare copy.
- Official targets (3 / 7 / 10 days), phone numbers and advice text live in data files with `source` and `lastChecked`. Do not hard-code them in components.
- Advice text not taken from a spec must carry `needsReview: true`.
- Pure logic (days of cover, readiness scores, tier progress, timers) lives in its own modules with unit tests.

## Project Notes

- Palette and type follow the prototype: ink navy background, signage amber, Barlow Condensed / IBM Plex Sans / IBM Plex Mono.
- [Add learnings from iterations here]
- TypeScript is pinned to ~6.0 because typescript-eslint does not yet support TS 7 (peer <6.1). Do not bump until it does.
