# JustKeepPathing Next TODO

Updated 2026-06-09 after reviewing the current runtime state.

## Already Landed

- Support-room automation now uses floor supplies, HP pressure, and auto-strategy settings for `rest` and `merchant` room appetite.
- Event/trial seed expansion is present in runtime data and handlers:
  - event: `repair_dock`
  - event: `supply_depot`
  - trial: `breach_charge`
  - trial: `guard_cache`
- The read-only collection/codex surface exists and persists discovered event seeds, trial seeds, relics, and finale bosses.
- The stale duplicate hidden-room interaction definitions and duplicate elite builder definition were removed from `index.html`; the surviving interaction path records event/trial seed discoveries.
- Empty treasure-room completion now still routes through `applyThemeChainBonus('treasure', ...)`, so salvage-theme treasure bonuses are not skipped when no cache nodes remain.
- `Reflex Shield` combat text now reports how much damage was blocked and how much damage was actually taken.
- Empty relic-pool rewards now explain that no new core is available instead of saying the core slots are full.

## 1. Theme Chain And Relic Follow-Up

Goal:

- finish the cross-system glue between special rooms, theme chains, and run relics
- keep all bonus text and collection/relic state routed through one obvious runtime path

Outstanding work:

- audit `event`, `trial`, `merchant`, `rest`, `treasure`, and `elite` room completion paths for consistent `applyThemeChainBonus(...)` calls and visible result text
- verify `Echo Engine` always hooks into the final event resolution path, not a stale or bypassed path
- remove or consolidate any remaining duplicate elite/boss reward-roll paths so premium rewards cannot double-apply or silently miss

Acceptance:

- no room type silently applies theme-chain effects without surfacing them in text
- chained bonuses update runtime state and UI consistently
- consecutive elite/event reward flows do not double-apply or silently miss
- collection discoveries still update after event/trial room entry

## 2. Hidden Room Routing Debug Pass

Goal:

- make room-balance work explainable instead of guesswork

Recommended instrumentation:

- expose per-room values in the existing path debug panel:
  - `accessScore`
  - detour cost
  - gate state and progress
  - final diversion score after strategy modifiers
- capture whether each room was:
  - generated
  - reachable
  - entered
  - cleared

Acceptance:

- we can explain why the autopather took or skipped a special room on a given floor
- balancing room appetite no longer depends on reading scattered runtime state by hand

## 3. Browser Smoke Coverage

Goal:

- protect the playable baseline while `index.html` is still the canonical entry point

Recommended slice:

- add a local smoke workflow that can load `http://127.0.0.1:5173/`, wait for the game scene, and fail on console errors
- include a focused collection smoke:
  - open the collection panel
  - verify counts render
  - seed a localStorage discovery fixture if needed
- include a generation-overlay smoke:
  - confirm the loading overlay is hidden on normal startup
  - confirm delayed generation text appears only for slow generation

Acceptance:

- `npm run check` still stays fast and local
- browser smoke can be run manually before risky UI/render changes
- the smoke does not require a production build step

## 4. Refactor Follow-Up

Goal:

- keep reducing `index.html` without changing gameplay feel or static-host deployment

Recommended next extraction candidates:

- special-room scoring and resolution helpers
- collection/codex data helpers
- loading overlay controller
- path debug panel formatting

Acceptance:

- extracted modules stay dependency-light and static-host friendly
- runtime ordering stays stable
- `index.html` remains playable after each slice
