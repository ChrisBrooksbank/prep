# Prepare Programme

## Overview

A gentle, ahead-of-time programme that climbs from the UK 72 hour baseline to the Nordic one week and the German ten days, one small task at a time, with a curated reading list. See the Prepare phone and "Bedtime reading" section in `specs/reference/concept-prototype.html`.

## User Stories

- As a householder, I want one clear thing to do this week so that preparing never feels overwhelming.
- As a householder, I want to see how far I am toward 3, 7 and 10 days so that I know what "ready" means.
- As a curious reader, I want links to the best official sources so that I can read more.

## Requirements

### Tiers
- [ ] Three tiers defined in a data file: UK 3 days (72 hours), Sweden and Norway 7 days, Germany 10 days, each with `source`, `lastChecked`, and a one-line explanation
- [ ] Default working target is the 7 day tier; the UK 72 hours is shown as the first step, not the goal
- [ ] Sources to cite: GOV.UK Be Ready announcement; Swedish Civil Defence and Resilience Agency (mcf.se); Norway DSB (dsb.no); German BBK. Mark any figure not directly verified as `needsReview`

### Tasks
- [ ] Task model: `id`, `tier` (1, 2, 3), `kind` (buy, learn, plan, drill), `title`, `why`, `cost` (pounds, optional) or `time` (optional), `done`, `needsReview`
- [ ] Seed with the 19 tasks from the prototype (`tasks` array in `concept-prototype.html`), refined for UK prices as ranges, with a `pricesCheckedOn` date
- [ ] Tier progress = done tasks / tasks in that tier. The "current tier" is the first incomplete tier
- [ ] "This week's one thing" card shows the next not-done task; buttons Done and Not now (skip moves to the next task; wraps around)
- [ ] "Coming up" shows the next four tasks; ticking one marks it done
- [ ] Ladder with three rungs and progress bars; the current tier is highlighted
- [ ] Household-aware: tasks scale with the profile (water litres and food days use household size; the sleeping bag count follows adults and children; gas hob owners do not get "camping stove" as essential)
- [ ] Done state persists on the device; progress can be reset in settings
- [ ] Copy is calm and specific: no streaks, no guilt, no countdowns. UK English

### Bedtime reading
- [ ] A Read section with grouped links, stored in a data file with `title`, `url`, `blurb`, `group` (UK official, Charities and skills, The longer standards), `country`, `verifiedOn`
- [ ] Seed list: GOV.UK small simple steps; Emergency Alerts (gov.uk/alerts); National Risk Register 2026 and 2025; FSA food safety in a power cut; Ready Scotland; British Red Cross emergency kit; St John Ambulance first aid advice and get advice; Environment Agency flood monitoring API; Sweden home preparedness for a week; Sweden "In case of crisis or war" brochure; Norway self-preparedness FAQ and advice; Germany BBK; Wikipedia article on the Swedish booklet (full URLs are in the prototype's reading section)
- [ ] External links open in a new tab with `rel="noopener"`; the list is available offline as a list, with a note that the pages themselves need a connection
- [ ] Each link has a `verifiedOn` date and a dev-only check lists any that have not been verified, so a link checker can run before release

## Acceptance Criteria

- [ ] Unit tests cover tier progress, current tier selection, next-task selection with skip wraparound, and household scaling
- [ ] Playwright smoke test: mark the first task Done, reload, and the ladder count stays updated
- [ ] Completing every task in a tier highlights the next tier
- [ ] All reading links render and carry `rel="noopener"`

## Out of Scope

- Shopping lists linked to retailers, affiliate links, or live prices
- Notifications, reminders, streaks or gamification
- User-created tasks (later)
