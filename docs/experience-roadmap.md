# JustKeepPathing Experience Roadmap

This document turns the current design direction into a local implementation roadmap for JustKeepPathing.

## 1. Product Thesis

JustKeepPathing should evolve into a hybrid of:

- idle progression
- roguelite run structure
- auto-battler spectacle
- compact route choice

The game should not rely on "the same maze but bigger numbers". It should create long-term playtime through layered loops:

- a short loop with visible action
- a mid loop with build choice
- a long loop with permanent unlocks
- occasional surprises that break repetition

## 2. Reference Takeaways

These are the parts worth borrowing, translated into this project's shape instead of copied literally.

### Slay the Spire

Useful takeaways:

- each run is a chain of risky or safe path choices
- combat, elite, rest, treasure, shop, and event nodes create pacing contrast
- relics change how a run feels, not just how strong it is
- bosses act as chapter exams rather than random spikes

Source: [Slay the Spire on Steam](https://store.steampowered.com/app/646570/Slay_the_Spire/)

### Hades

Useful takeaways:

- every attempt should make the player stronger in some permanent way
- runs need lots of build combinations
- repeated attempts can still feel fresh if the world keeps surprising the player
- permanent progression should reduce frustration without removing tension

Source: [Hades on Steam](https://store.steampowered.com/app/1145360/Hades/)

### FTL

Useful takeaways:

- event choices create texture between battles
- randomized encounters become memorable when they ask for tradeoffs
- route pressure matters more than raw randomness
- each node should ask "fight, spend, risk, or bypass?"

Source: [FTL: Faster Than Light on Steam](https://store.steampowered.com/app/212680/FTL_Faster_Than_Light/)

## 3. Target Loop Structure

### 3.1 Short Loop: 30-90 seconds

One maze floor should deliver:

- auto-pathing
- enemies
- treasure
- 0-2 route events
- floor clear payout

This loop is responsible for visual payoff and momentum.

### 3.2 Run Loop: 8-20 minutes

One run should contain:

- several node-based floors
- 1-2 build pivots
- 1-2 risk decisions
- 1 boss or chapter-end threat

This loop is responsible for "this run has a shape".

### 3.3 Meta Loop: 1-3 hours

Across multiple runs, the player should unlock:

- new enemy families
- new node types
- new relic pools
- new map themes
- new offline automation tools

This loop is responsible for content expansion.

### 3.4 Prestige Loop: 1-7 days

The player should eventually reset a successful profile segment to gain permanent systems:

- core tech
- ship systems
- starting relic slots
- event unlocks
- passive resource gains

This loop is responsible for long-term retention.

## 4. Player Experience Stages

### Stage A: First 20 minutes

Goals:

- understand the game without reading much
- feel stronger every 1-2 floors
- see one elite and one major event early

Requirements:

- keep upgrade count low
- let speed, attack, and maze size do most of the teaching
- avoid dense event stacking

### Stage B: First 2 hours

Goals:

- start making real build choices
- understand that not every run should be played the same way
- see hidden room variety

Requirements:

- unlock relics/modules
- unlock hidden room types
- unlock elite side encounters
- unlock first boss structure

### Stage C: 2-10 hours

Goals:

- give the player chapter identity and theme identity
- make online runs feel better than pure offline waiting
- provide target farming and hidden-room selection pressure

Requirements:

- chapter progression
- biome modifiers
- specialized rewards
- challenge switches

### Stage D: 10+ hours

Goals:

- make resets feel exciting instead of painful
- keep multiple future goals visible
- support both optimization players and casual idle players

Requirements:

- prestige
- long-term unlock trees
- codex/collection goals
- weekly or rotating mutators

## 5. Stage And Maze Structure

The strongest adaptation for this project is:

- a fully automatic chapter-to-floor flow
- hidden special rooms embedded inside a maze floor
- occasional external side-path connections that the autopather may or may not reach in time

This preserves the current "watch the maze and the ship path through it" fantasy while adding roguelite pacing without blocking idle progression.

### 5.1 Automatic Chapter Flow

Each run is divided into Acts.

Recommended starting structure:

- Act 1: 5 floors + boss floor
- Act 2: 5 floors + boss floor
- Act 3: 6 floors + final boss floor

The player should automatically enter the next floor after a clear. No route choice should block unattended play.

### 5.2 Hidden Room System

Instead of choosing between macro nodes, the maze itself should sometimes contain special rooms.

Recommended room types:

- `combat`: default enemy floor
- `elite room`: harder pocket encounter, better rewards
- `event room`: scripted choice or temporary rule change
- `treasure room`: safer pocket with high chest density
- `rest room`: heal, repair, or cleanse
- `merchant room`: spend resources, buy modules
- `trial room`: opt-in hazard for multiplier rewards
- `boss floor`: chapter gate

Core rules:

- one maze can contain at most 2 hidden rooms
- hidden rooms are not guaranteed to be reachable
- some hidden rooms should connect through side branches outside the main efficient route
- some hidden rooms should be placed near the hardest-to-reach path in the floor
- some high-value hidden rooms should require a kill threshold before opening
- upgrades can increase hidden-room appearance rate and access reliability

This keeps the main loop automatic while preserving luck, tension, and run texture.

### 5.3 Hidden Room Placement Rules

Placement rules should create "maybe I get in" excitement without forcing manual route selection.

- `branch pocket`: a side branch off the main maze that may or may not be worth detouring into
- `outer extension`: a hidden chamber connected just beyond the normal maze border
- `sealed gate`: visible room that opens only after killing enough enemies
- `late fork`: room placed near the deepest route in the floor
- `collapse timer`: rare room that closes if not reached early enough

Autopathing rules can still stay automatic:

- if a reachable hidden room is detected and its priority exceeds a threshold, the ship diverts automatically
- otherwise it continues the main shortest path
- permanent upgrades can improve hidden-room detection radius or diversion priority

### 5.4 Maze Rules By Floor Type

The maze itself should change by floor role and hidden-room composition, not only by size.

One layer above floor role, the run should also rotate through lightweight biome themes.

- each theme shifts density and room appetite a bit
- the effect should be visible across several floors, not only one room
- themes should add identity without stopping unattended progression
- themes should also bias enemy families and special-room template pools so the run feels like it is passing through a real region
- each 6-floor biome segment should have a final-floor "收束" modifier that lightly sharpens the last floor instead of forcing a manual chapter cutscene

`combat`

- medium maze
- normal enemy density
- a few forks
- 0-1 low-tier hidden rooms

`elite floor`

- slightly larger maze
- more dead ends
- fewer chests
- a hazard modifier
- elite room chance increased

`event floor`

- small maze
- fast clear time
- one guaranteed event room or event chamber

`treasure floor`

- compact maze
- low threat
- multiple chest clusters
- better chance for treasure room spawn

`rest floor`

- tiny maze or no maze
- pure pacing break

`merchant floor`

- tiny safe layout
- no combat except optional challenge altar

`boss floor`

- not a standard maze
- use an arena-like layout with 2-3 lanes or hazard pockets

### 5.5 Chapter Identity

Every act should have a gameplay identity, not just a palette swap.

Example early themes:

- Act 1: Outer Ruins
  - lower threat
  - more treasure and tutorial events
- Act 2: Rot Caverns
  - healing pressure
  - more swarm enemies
- Act 3: Black Relay
  - higher elite rate
  - more mechanical hazards

## 6. Content Systems To Support Variety

### 6.1 Relics Or Modules

Runs need build-shaping items.

Recommended rule:

- permanent progression unlocks relic pools
- each run only receives a subset
- relics should change priorities, not only stats

Examples:

- `Salvage Thrusters`: chest pickup grants temporary move speed
- `Blood Compass`: more monsters spawn, but reward multiplier rises
- `Reflex Shield`: first hit each floor is reduced
- `Echo Engine`: clearing event rooms grants combat power next floor

### 6.2 Event System

Events are the easiest way to stop monotony without massive art cost.

Recommended early event groups:

- shrine: sacrifice HP for immediate power
- scout beacon: improve hidden-room detection on the next floors
- black market: trade score for rare module
- unstable gate: open a side chamber with higher danger and higher reward
- repair dock: heal or cleanse a penalty

### 6.3 Floor Modifiers

Borrow the spirit of roguelite mutators.

Recommended modifier categories:

- enemy modifier
- economy modifier
- maze topology modifier
- environmental hazard modifier

Examples:

- `Starved Vaults`: fewer chests, stronger enemies, better payouts
- `Short Circuit`: faster movement, lower max HP
- `Fogged Grid`: lower hidden-room detection, higher event reward
- `Raid Signal`: more elite rooms this act

### 6.4 Offline Vs Online Differentiation

Idle games get stale when offline and online are identical.

Recommended split:

- offline: stable score, crafting materials, baseline chapter progress
- online: relics, events, elite rewards, bosses, rare currencies

This gives players a reason to return actively without making offline useless.

## 7. Progression Architecture

### 7.1 In-Run Resources

Use short-lived currencies inside a run:

- score
- scrap
- temporary repairs
- event tokens

### 7.2 Persistent Resources

Use long-term resources outside a run:

- core shards
- blueprints
- relic unlock currency
- chapter keys

### 7.3 Prestige Layer

Recommended name candidates:

- Core Reboot
- Expedition Recall
- Path Reset

Prestige should grant:

- permanent system unlocks
- stronger run starts
- more route control
- more event certainty

Prestige should not:

- fully erase all agency
- only add a flat multiplier

## 8. Pacing Targets

Use these targets to keep the game from becoming boring.

- first upgrade purchase: within 2 floors
- average normal floor: 35-60 seconds
- elite floor: 60-90 seconds
- event floor: 20-40 seconds
- first act boss: within 12-18 minutes
- one meaningful build pivot: every 4-6 floors
- one visible unlock: every 10-20 minutes in early game

## 9. Concrete Milestone Plan

### Milestone 1: Run Structure

Add:

- floor archetypes
- hidden room generator
- event room prototype
- elite room prototype

Do not add prestige yet.

Success signal:

- the player can describe one run as "I found a greedy hidden chamber" or "this floor spawned a room I could not quite reach"

### Milestone 2: Build Variety

Add:

- relic/module system
- 12-20 run modifiers
- 6-10 event definitions

Success signal:

- two consecutive runs encourage different upgrade priorities

### Milestone 3: Chapter Identity

Add:

- 3 act themes
- act-specific enemies
- act-specific hidden room pools
- act bosses

Success signal:

- players can tell which act they are in from behavior, not only visuals

### Milestone 4: Meta And Prestige

Add:

- prestige resource
- persistent unlock tree
- chapter unlock flow
- offline expedition

Success signal:

- a reset feels like opening a new phase, not just restarting

### Milestone 5: Retention Layer

Add:

- rotating mutators
- challenge runs
- codex goals
- long-term collections

Success signal:

- players always have at least one short goal and one long goal

## 10. Suggested Data Tables

The project will get much easier to extend if new systems are data-driven.

Recommended tables:

- `NODE_TYPES`
- `ACT_DEFS`
- `EVENT_DEFS`
- `RELIC_DEFS`
- `FLOOR_MODIFIERS`
- `ENEMY_ARCHETYPES`
- `BOSS_ARCHETYPES`
- `META_UPGRADES`
- `PRESTIGE_REWARDS`

## 11. Implementation Notes For The Current Codebase

The current codebase is still a single-page game with centralized state. The safest next step is to add these systems without rewriting everything at once.

Suggested order inside the existing architecture:

1. Add floor archetype state to `GameState`
2. Let `GameController.startLevel()` read a floor descriptor instead of generating every floor the same way
3. Add hidden room generation and accessibility rules during `finishGeneration()`
4. Add an event resolution layer for event rooms
5. Add data-driven floor modifiers and hidden-room spawn rules
6. Add persistent unlock data only after the automatic floor flow feels good

## 12. Immediate Next Build Recommendation

If only one feature set should be built next, make it this:

- floor archetypes with 3 room types: `combat`, `event`, `treasure`
- one elite hidden room variant
- one simple relic reward after elite room or boss floor
- one upgrade that increases hidden-room appearance rate

That is the smallest step that meaningfully moves the game toward a true idle roguelite structure without breaking unattended progression.

## 13. Detailed Follow-Up

For the detailed hidden-room rules, formulas, room categories, and implementation hooks, see:

- `docs/hidden-room-system.md`
- `docs/hidden-room-data-tables.md`
