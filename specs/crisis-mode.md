# Crisis Mode

## Overview

A flat, high-contrast, fully offline mode with three tabs (Do, Know, Call) that tells a UK household what to do during an emergency, tailored to their home. See `specs/reference/concept-prototype.html` (the Crisis phone).

## User Stories

- As a householder in a power cut, I want a short tick-off list of next steps so that I do the right things in the dark with a nearly flat phone.
- As a householder, I want short survival guides so that I can look up warmth, water, food safety, cooking, first aid and hygiene without a signal.
- As a householder, I want the right phone numbers one tap away so that I do not have to search for them under stress.

## Requirements

### General
- [ ] Black background, white text, amber accents, AAA contrast, minimum 48px touch targets, large type
- [ ] No WebGL, no animation, no network requests, no web fonts that block render (system or locally bundled)
- [ ] Always reachable: a persistent "Crisis mode" control in the other areas, and a deep link `#crisis`
- [ ] Header banner: "Crisis mode", "3D off", and elapsed time since the user started the active playbook
- [ ] Household line under the banner summarising the profile (e.g. terrace, gas boiler, gas hob, 2 adults)
- [ ] Bottom tab bar: Do, Know, Call

### Do tab
- [ ] Playbook chips: Power cut, No water, Gas smell, Flood, Storm
- [ ] Each playbook has a primary contact card at the top (e.g. 105 for power cut) and an ordered list of steps
- [ ] Steps are tickable, ticks persist on the device, and "reset playbook" clears them
- [ ] Steps can carry a sub-note (e.g. "fridge safe for about 4 hours") and a condition on the profile, such as `hasGasHob`, `gasBoiler`, `medication`, `pets`. Steps whose condition is false are hidden
- [ ] Power cut playbook must include: check fuse board and neighbours; report on 105; use torches not candles; keep fridge and freezer shut; explain that a gas boiler needs electricity so move to one warm room; charge phone from a power bank and use low power mode; light a gas hob with a match for hot drinks with a window open (only if gas hob)
- [ ] Timers derived from the playbook start time: fridge about 4 hours, full freezer about 48 hours, half-full about 24 hours. Show as status lines, not notifications
- [ ] Playbook content lives in a typed data file with sources

### Know tab
- [ ] Seven accordion topics: Keep warm, Water, Food safety, Cook safely, First aid, Stay informed, Toilets and hygiene
- [ ] One topic open at a time; danger lines (e.g. carbon monoxide) are styled distinctly and never collapsed away from their topic
- [ ] Each topic cites its source and `lastChecked`; text not yet verified is flagged `needsReview` and listed in a dev-only report
- [ ] Initial text for each topic is in `specs/reference/concept-prototype.html` (the `topics` array). It is a draft and must be verified against NHS, Food Standards Agency, British Red Cross and St John Ambulance guidance before release
- [ ] First aid topic is a reminder, not training, and links back to the Prepare task "Book a first aid course"

### Call tab
- [ ] Cards for: Power cut 105; Gas emergency 0800 111 999; Floodline 0345 988 1188; NHS 111; Emergency 999; Water company (from profile); GP surgery (from profile)
- [ ] Numbers are tappable `tel:` links and also shown as plain selectable text
- [ ] Numbers live in a data file with `source` and `lastChecked`

## Acceptance Criteria

- [ ] With the network offline, all three tabs render and work
- [ ] Changing the profile (e.g. turning off gas hob) removes the gas hob step from the Power cut playbook
- [ ] A Playwright smoke test ticks a step, reloads, and the tick persists
- [ ] A unit test covers profile-conditioned step filtering and the timer calculations
- [ ] An automated check confirms no animation, no canvas, no external requests in Crisis mode
- [ ] Axe accessibility check passes on each tab

## Out of Scope

- Live alerts, flood or weather feeds
- AI chat or free-text questions
- Push notifications or alarms
- Playbooks beyond the five listed (more can be added later as data)
