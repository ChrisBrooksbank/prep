# Home Model and Pantry

## Overview

A tappable three.js cutaway of the user's house where each room shows how ready it is, plus a 3D pantry shelf that turns stock into "days of cover" against the 3, 7 and 10 day targets. See the Home phone in `specs/reference/concept-prototype.html`.

## User Stories

- As a householder, I want to see my home as a model with rooms coloured by readiness so that I know where the gaps are at a glance.
- As a householder, I want to tick off what I have in each room so that my score and next steps update.
- As a householder, I want one number for how many days I could eat and drink without shops or taps so that I can compare it to the official targets.

## Requirements

### Home model
- [ ] Lazy-loaded three.js scene: two-storey terraced cutaway with four rooms (lounge, kitchen, bedroom, bathroom), open front, simple furniture, translucent roof frame
- [ ] Each room is a translucent zone coloured by readiness (green at 75 percent or more, amber at 50 or more, red below), with an HTML label showing name and percentage
- [ ] Drag horizontally to turn the house; tap a room (raycast, with drag vs tap threshold) to select it; the selected room pulses
- [ ] Bottom sheet for the selected room lists items as tickable rows with a weight, a rough UK price when missing, and an optional tip
- [ ] Room score = weighted share of items owned. Whole-home score = mean of room scores. Strip shows the weakest room and the most valuable missing item in it
- [ ] Items depend on the profile: no gas hob item for an electric hob; medication item only if anyone takes regular medication; pet items when pets exist
- [ ] Room item definitions are data, with `source` or `needsReview`
- [ ] Item ownership persists on the device

### Pantry shelf
- [ ] Categories: Water, Carbs, Veg and pulses, Protein, Fats and sweet, each with quantity, kcal per unit (or litres per unit) and a share of daily energy (carbs 0.5, veg 0.15, protein 0.15, fats 0.2)
- [ ] Daily need per person: 2,200 kcal and 2.5 litres of water (2 to drink plus 0.5 for cooking, following the German BBK checklist; mark as `needsReview` until checked against BBK)
- [ ] Days of cover per category = stock / (share x kcal x people), water = litres / (2.5 x people). Overall cover = the minimum across categories; the weakest category is highlighted
- [ ] Household size selector (1 to 4, defaulting from the profile), ring showing cover out of 10 days with ticks at 3 and 7, tier chips lighting at 3, 7, 10 days, per-category bars
- [ ] Add buttons for quick stock changes and a reset; instanced meshes per category on a three-board shelf; weakest category glows
- [ ] Stock persists on the device

### Shared
- [ ] Fallback 2D view (lists and bars) when WebGL is unavailable, when the user chooses "battery saver", or when the app is in Crisis mode
- [ ] Respect `prefers-reduced-motion` (no drift or pulse; static render on demand)
- [ ] Render only while visible (IntersectionObserver) and pause when the tab is hidden; cap pixel ratio at 2
- [ ] All scoring and days-of-cover maths are pure functions in their own module with unit tests

## Acceptance Criteria

- [ ] Unit tests: room and home scores, days of cover with different household sizes, weakest category selection, profile-driven item filtering
- [ ] Playwright smoke test: Home screen shows a canvas that is non-blank (pixel check), tapping a room changes the sheet title, ticking an item changes the percentage
- [ ] 2D fallback renders the same numbers as the 3D view
- [ ] Home area JS chunk (including three.js) loads only when Home is opened
- [ ] Example data is clearly marked as example until the user enters their own

## Out of Scope

- Barcode scanning, expiry tracking, or shopping integrations
- Custom floor plans or user-built 3D models
- Multiple homes
