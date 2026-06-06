# JustKeepPathing Next TODO

This file captures the next safe implementation slices after the current hidden-room, relic, and theme systems landed.

## 1. Support Room Automation Polish

Goal:

- make `rest` and `merchant` rooms feel more intentional in unattended play
- keep the room decision fully automatic
- tie the decision more strongly to floor supplies

Implementation notes:

- continue using the existing floor-supply inventory and auto-strategy settings
- weight `rest` room priority by:
  - current HP ratio
  - whether the current floor already consumed a supply
  - whether the most-needed supply is out of stock
- weight `merchant` room priority by:
  - current score relative to discounted upgrade cost
  - supply shortage severity
  - player strategy: `power` / `supplies` / `save`
- keep all outcomes choice-free and immediate

Acceptance:

- low-HP runs noticeably prefer `rest` rooms
- supply-starved runs noticeably prefer `merchant` rooms when score allows
- unattended play never pauses for a decision prompt

## 2. Event And Trial Seed Expansion

Goal:

- deepen run variety without adding new UI complexity
- make special rooms produce more memorable “run stories”

Recommended next seeds:

- event: `repair_dock`
  - heal now
  - reduce incoming damage for the rest of the floor
  - optionally grant one needed floor supply on stronger rolls
- event: `supply_depot`
  - grant one or two floor supplies based on charge count
  - bias the supply type by current floor archetype and shortage
- trial: `breach_charge`
  - grant immediate attack
  - also preheat next-floor attack
  - high roll grants `assault` supply
- trial: `guard_cache`
  - heal now
  - reduce incoming damage for the rest of the floor
  - high roll grants one needed floor supply

Implementation caution:

- `index.html` still contains duplicate method definitions in some areas
- when wiring new room effects, verify which definition is actually the last effective one before editing

Acceptance:

- at least 2 new event seeds and 2 new trial seeds appear in the runtime pool
- each new seed changes either supply state, current-floor survival, or next-floor momentum
- the autopather’s special-room appetite reflects the new seed value

## 3. Theme Chain And Relic Follow-Up

Goal:

- finish the cross-system glue between special rooms, theme chains, and run relics

Outstanding work:

- make sure `event`, `trial`, `merchant`, `rest`, and `elite` all consistently route through theme-chain bonus text and effect application
- make sure `Echo Engine` always hooks into the intended event resolution path
- make the `Reflex Shield` combat message explicit when damage is reduced
- remove duplicate reward-roll paths so elite rewards are handled in one place

Acceptance:

- no room type silently applies theme-chain effects without surfacing them in text
- chained bonuses update runtime state and UI consistently
- consecutive elite / event reward flows do not double-apply or silently miss

## 4. Hidden Room Routing Debug Pass

Goal:

- make future room-balance work easier to tune

Recommended instrumentation:

- log or expose per-room values for:
  - `accessScore`
  - detour cost
  - gate state
  - final diversion score after strategy modifiers
- capture whether the room was:
  - generated
  - reachable
  - entered
  - cleared

Acceptance:

- we can explain why the autopather took or skipped a special room on a given floor
- balancing room appetite no longer depends on guesswork

## 5. Pre-Prestige Progression Groundwork

Goal:

- prepare for the next layer after run content without building full prestige yet

Recommended slice:

- add a persistent codex/collection surface for:
  - discovered room seeds
  - discovered relics
  - discovered finale bosses
- keep it read-only at first

Acceptance:

- the player can see long-term collection progress even before prestige systems ship
- run variety immediately contributes to a visible meta goal
