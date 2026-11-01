# PWA Shell and Offline

## Overview

An installable, offline-first app shell with a household profile, on-device storage and navigation between Crisis, Prepare and Home, with no accounts and no tracking.

## User Stories

- As a householder, I want to install the app and have it work with no signal so that it helps when the power and mobile network are down.
- As a householder, I want to answer a few questions once so that advice fits my home (gas hob or not, medication, pets).
- As a privacy-minded user, I want my data to stay on my phone so that I can trust the app with details about my home and health.
- As a user, I want to export and import my data so that I can move phones or keep a backup.

## Requirements

- [ ] Web app manifest (name "Ready", short name, theme and background colours from the palette, standalone display, maskable icons, `lang="en-GB"`)
- [ ] Service worker via vite-plugin-pwa: precache the whole app shell and all advice data, so everything except external links works offline after first load
- [ ] Update flow: a non-intrusive "update ready" prompt, never reloading the page mid-use, and never during crisis mode
- [ ] Three top-level areas: Crisis, Prepare, Home. Crisis opens in one tap from anywhere. Hash routing, no server needed
- [ ] Three.js and anything 3D loaded lazily and only by the Home area, so Crisis and Prepare stay light
- [ ] Household profile with these fields: home type (flat, terrace, semi, detached, rural/off-grid), heating (gas boiler, electric, heat pump, oil, other), cooking (gas hob, electric hob, induction), adults, children, pets, anyone on regular medication, anyone with mobility or health vulnerability, optional postcode district, optional water company and GP surgery names and phone numbers
- [ ] Profile onboarding: under ten questions, one per screen, skippable, editable later
- [ ] Storage in IndexedDB (or localStorage fallback) behind a small typed storage module; versioned schema with migrations
- [ ] Export and import of all data as a single JSON file; import validates the schema
- [ ] Official targets, emergency numbers and advice live in typed data files, each with `source`, `lastChecked` and optional `needsReview`
- [ ] No accounts, no analytics, no third-party runtime requests (fonts bundled locally, not from a CDN)
- [ ] Respect `prefers-reduced-motion` and `prefers-color-scheme`; dark theme default; a high-contrast option
- [ ] Optional low-battery hint: where the Battery Status API exists, offer to switch to Crisis mode below 20 percent. Progressive enhancement only
- [ ] Performance: initial JS for Crisis plus shell under 150 KB gzipped; three.js chunk separate
- [ ] A settings screen with: export, import, delete all data, theme, reduce motion, "last updated" of the advice data

## Acceptance Criteria

- [ ] Playwright smoke test: load the preview build, go offline, reload, and the app still renders Crisis, Prepare and Home
- [ ] Lighthouse PWA installability checks pass on the preview build
- [ ] Deleting all data returns the app to first-run onboarding
- [ ] Import of a malformed file shows a clear error and changes nothing
- [ ] No network requests to other origins are made at runtime (asserted in a smoke test)
- [ ] Profile changes immediately change which Crisis steps appear (see crisis-mode.md)

## Out of Scope

- Accounts, sync, cloud backup, push notifications
- Native app store builds
- Analytics of any kind
