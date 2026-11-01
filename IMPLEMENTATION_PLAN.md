# Implementation Plan

## Status

- Planning iterations: 3 (re-verified: codebase still empty, plan still matches all four specs; no changes needed)
- Build iterations: 19
- Last updated: 2026-11-01

Codebase is empty (no package.json, no src). Everything below is unimplemented. One task = one build iteration.

## Tasks

### 1. Scaffold and guard rails
- [x] Scaffold Vite + TypeScript (strict), npm, `index.html` with `lang="en-GB"`, `src/main.ts`, folder layout `src/{areas,data,logic,storage,ui}` (spec: pwa-shell-offline.md)
- [x] ESLint (typescript-eslint) + Prettier configs and scripts `lint`, `format:check`, `typecheck` (spec: AGENTS.md)
- [x] Vitest with one trivial passing test; script `test:run` (spec: AGENTS.md)
- [x] Playwright config against `vite preview`, one smoke test that the page loads; script `test:smoke` (spec: AGENTS.md)
- [x] `npm run check` chaining typecheck, lint, format check, test:run, build, test:smoke; add `.gitignore` entries (node_modules, dist, test-results) (spec: AGENTS.md)

### 2. PWA shell and offline
- [x] Design tokens (CSS variables) from prototype palette; bundle Barlow Condensed / IBM Plex Sans / IBM Plex Mono locally (woff2 via fontsource or files, no CDN); dark default, `prefers-color-scheme`, high-contrast option (spec: pwa-shell-offline.md)
- [x] Typed data-file conventions: shared `Sourced` type (`source`, `lastChecked`, `needsReview?`) and a dev-only report listing `needsReview` items (spec: pwa-shell-offline.md)
- [x] Hash router with three areas (Crisis, Prepare, Home), `#crisis` deep link, top-level nav, persistent "Crisis mode" control in Prepare/Home; Home area is a lazy `import()` stub (spec: pwa-shell-offline.md, crisis-mode.md)
- [x] Typed storage module (IndexedDB with localStorage fallback), versioned schema + migrations, unit tests incl. migration (spec: pwa-shell-offline.md)
- [x] Profile model + pure helpers (e.g. `hasGasHob`, `gasBoiler`, household line summary) with unit tests (spec: pwa-shell-offline.md)
- [x] Onboarding: under ten questions, one per screen, skippable, editable later (spec: pwa-shell-offline.md)
- [x] Export / import JSON with schema validation; malformed file shows clear error and changes nothing; unit tests (spec: pwa-shell-offline.md)
- [x] Settings screen: export, import, delete all data (returns to onboarding), theme, reduce motion, advice data "last updated" (spec: pwa-shell-offline.md)
- [x] Web manifest + maskable icons + vite-plugin-pwa service worker precaching shell and data; update-ready prompt that never reloads mid-use or in crisis mode (spec: pwa-shell-offline.md)
- [x] Optional Battery Status hint (<20 percent suggests Crisis mode), progressive enhancement (spec: pwa-shell-offline.md)
- [x] Smoke tests: offline reload renders all three areas; no cross-origin requests at runtime; delete-all returns to onboarding; Lighthouse/installability check (spec: pwa-shell-offline.md)
- [x] Bundle budget check: Crisis + shell JS under 150 KB gzipped, three.js in separate chunk (spec: pwa-shell-offline.md)

### 3. Crisis mode (core value)
- [x] Crisis data files: playbooks (5), know topics (7, seeded from prototype `topics`, `needsReview: true`), call numbers, each with source/lastChecked (spec: crisis-mode.md)
- [x] Pure logic: profile-conditioned step filtering and playbook timers (fridge ~4h, full freezer ~48h, half ~24h) with unit tests (spec: crisis-mode.md)
- [x] Crisis shell: black/white/amber AAA styling, 48px targets, banner (Crisis mode, 3D off, elapsed time), household line, bottom tabs Do/Know/Call, no animation (spec: crisis-mode.md)
- [x] Do tab: playbook chips, primary contact card, ordered tickable steps with sub-notes, persisted ticks, reset playbook, playbook start time, timer status lines (spec: crisis-mode.md)
- [x] Power cut playbook content complete with all required steps and gas-hob condition (spec: crisis-mode.md)
- [x] Know tab: single-open accordion, distinct danger lines, source + lastChecked per topic, First aid links to Prepare task "Book a first aid course" (spec: crisis-mode.md)
- [x] Call tab: cards with tappable `tel:` and selectable plain text; water company and GP from profile (spec: crisis-mode.md)
- [x] Automated crisis check: no animation, no canvas, no external requests; axe check on each tab (add @axe-core/playwright) (spec: crisis-mode.md)
- [x] Smoke tests: tick step, reload, persists; profile change removes gas hob step; offline tabs work (spec: crisis-mode.md)

### 4. Prepare programme
- [x] Tiers data file (3 / 7 / 10 days, sources GOV.UK, mcf.se, dsb.no, BBK, `needsReview` where unverified) (spec: prepare-programme.md)
- [x] Tasks data file: 19 tasks from prototype with UK price ranges, `pricesCheckedOn`, household-scalable fields (spec: prepare-programme.md)
- [x] Pure logic + unit tests: tier progress, current tier, next-task with skip wraparound, household scaling (water, food days, sleeping bags, camping stove vs gas hob) (spec: prepare-programme.md)
- [x] Prepare UI: "This week's one thing" (Done / Not now), "Coming up" (next four, tickable), ladder with progress bars and current tier highlight, persisted done state, reset in settings (spec: prepare-programme.md)
- [x] Reading list data (with `verifiedOn`, groups, countries; URLs from prototype) + Read section UI with `rel="noopener"`, new tab, offline note; dev-only unverified report (spec: prepare-programme.md)
- [x] Smoke test: mark first task done, reload, ladder count persists; reading links carry `rel="noopener"` (spec: prepare-programme.md)

### 5. Home model and pantry
- [x] Pure logic module + unit tests: room/home scores, weakest room, most valuable missing item, profile-driven item filtering, days of cover, weakest category (spec: home-model-pantry.md)
- [x] Room item data and pantry category data (`needsReview` on BBK figures), marked as example until user edits (spec: home-model-pantry.md)
- [x] 2D Home view: room list/bars, bottom sheet with tickable items, persisted ownership; this is also the fallback view (spec: home-model-pantry.md)
- [ ] 2D Pantry view: household selector, cover ring/bars with 3/7/10 ticks and tier chips, add/reset buttons, persisted stock (spec: home-model-pantry.md)
- [ ] three.js house scene (lazy chunk): cutaway, rooms coloured by readiness, HTML labels, drag-to-rotate, raycast tap with drag threshold, pulse (spec: home-model-pantry.md)
- [ ] three.js pantry shelf: instanced meshes per category, weakest glows (spec: home-model-pantry.md)
- [ ] Render controls: IntersectionObserver + visibilitychange pause, pixel ratio cap 2, reduced-motion static render, battery saver toggle, WebGL-unavailable and Crisis-mode fallback to 2D (spec: home-model-pantry.md)
- [ ] Smoke tests: canvas non-blank pixel check, tap room changes sheet title, tick changes percentage, 2D fallback matches numbers, Home chunk loads only when opened (spec: home-model-pantry.md)

## Completed

<!-- Completed tasks move here -->

## Notes

- Priority order: scaffold, PWA shell and offline, crisis mode, prepare programme, home model and pantry. Do not start section 5 before section 3 is done.
- Architecture: vanilla TS, one render function per area returning DOM; shared `ui/` helpers; `logic/` is pure (no DOM, no storage) and unit tested; `data/` is typed constants with `Sourced` metadata; `storage/` is the only code touching IndexedDB/localStorage.
- Crisis mode must not import three.js or anything from the Home chunk; enforce via the lazy `import()` boundary and the bundle check.
- Profile conditions in step data are keyed predicates (`hasGasHob`, `gasBoiler`, `medication`, `pets`), resolved by one function in `logic/`.
- Official numbers, phone numbers and advice are only in `data/`; components never hard-code them. Anything not copied from a spec carries `needsReview: true`.
- Prototype (`specs/reference/concept-prototype.html`) is the source for seed copy (`topics`, `tasks`, reading URLs); do not ship its code.
- Playwright smoke tests run against `npm run preview`; install browsers via `npx playwright install chromium` in the scaffold task.
