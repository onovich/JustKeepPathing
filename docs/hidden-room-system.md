# JustKeepPathing Hidden Room System

This document defines the hidden room system as a non-blocking roguelite layer for an idle-first game.

The main rule is simple:

- core progression must remain fully automatic
- hidden rooms add surprise, value, and run texture
- hidden rooms must never require the player to be present to keep the game moving

Each group of floors can also carry a lightweight biome theme.

- themes should change room appetite, density bias, and flavor
- themes should not interrupt automation or add route prompts
- the player should feel the floor identity through repeated small biases rather than one giant rules popup
- the last floor of a biome cycle can carry a short "收束" modifier that intensifies the floor without breaking idle flow

## 1. Design Goals

The hidden room system should solve four problems at once:

1. break up repetitive floor flow without adding manual route selection
2. create lucky or high-skill-feeling moments inside automatic play
3. add room for build expression through detection and diversion upgrades
4. provide high-value rewards without inflating baseline floor rewards too hard

## 2. High-Level Rules

Each floor may generate hidden content under these hard limits:

- maximum hidden rooms per maze: `2`
- small floors usually generate `0`
- medium floors usually generate `0-1`
- large or special floors may generate `1-2`

A hidden room can be:

- reachable and entered automatically
- generated but not reached in time
- generated but sealed due to unmet conditions
- never rolled at all

That uncertainty is a feature, not a bug.

## 3. Why This Fits An Idle Game

The player should not be asked to stop automatic progression and choose a branch every floor.

Instead, the system creates moments like:

- "I found a rare side chamber"
- "I almost reached that vault"
- "my sensor upgrade finally let me divert into the merchant room"
- "this elite room opened because I killed enough enemies first"

This keeps unattended play intact while still creating run stories.

One useful supporting loop is a floor-consumable supply item:

- it auto-activates when a new floor begins if inventory is available
- it lasts for exactly one floor
- merchant and rest rooms can help refill that inventory
- this makes room diversion decisions feel resource-driven instead of arbitrary

Recommended player-facing automation settings:

- hidden-room diversion style: cautious / balanced / greedy
- rest-room preference: emergency-only / balanced / proactive sustain
- merchant-room policy: power first / supply first / save currency
- floor-supply preference: adaptive / combat bias / loot bias / exploration bias

Recommended early supply set:

- `战备补给`: more damage for the floor, best for combat and boss pressure
- `探宝补给`: better chest value and more supply drops, best for treasure-oriented floors
- `侦测补给`: better hidden-room odds and stronger diversion appetite, best for event or exploration-heavy floors

## 4. Hidden Room Categories

Recommended room categories for early implementation:

### 4.1 Treasure Room

Purpose:

- low-risk reward spike

Typical contents:

- extra chests
- score cache
- scrap cache
- one relic roll at low chance

Recommended usage:

- most common hidden room
- available early

### 4.2 Event Room

Purpose:

- give the run a rule twist

Typical contents:

- shrine tradeoff
- repair choice
- unstable bonus
- cursed reward

Recommended usage:

- moderate rarity
- better once several event definitions exist
- event-room templates should differ not only by reward text, but by node count, payout bias, and how attractive the autopather considers the detour

### 4.3 Elite Room

Purpose:

- higher danger for better rewards

Typical contents:

- one elite enemy deeper inside the chamber
- 1-2 support objectives such as amplifiers, shield cores, or jammers
- automatic sweep priority on support objectives before the elite
- chamber variants such as a bastion room, long corridor, or pincer layout
- guaranteed premium payout
- elevated relic chance

Recommended usage:

- less common
- should feel like a notable find
- can be kill-gated so it opens late in the floor

### 4.4 Merchant Room

Purpose:

- convert current-run resources into targeted value
- do so without pausing the idle loop

Typical contents:

- auto-buy one discounted upgrade using the current run's default policy
- if nothing is worth buying, convert the stop into scouting info or a small fallback payout

Recommended usage:

- low frequency
- more useful after resource systems deepen

### 4.5 Rest Room

Purpose:

- pacing break
- sustain support
- quick automatic recovery without opening a choice dialog

Typical contents:

- if health is low, heal immediately
- if health is already stable, convert the stop into a small stat or loot bonus

Recommended usage:

- uncommon on normal floors
- more frequent near boss-adjacent phases if needed

### 4.6 Trial Room

Purpose:

- opt-in greed room without manual prompting

Typical contents:

- hazard field
- enemy surge
- countdown gate
- reward multiplier

Recommended usage:

- unlocked later
- entered only if the ship's auto-diversion priority is high enough
- should have multiple templates such as overclock, salvage, survey, or endurance trials so repeated runs do not feel identical

## 5. Placement Archetypes

Hidden rooms should not all appear the same way.

### 5.1 Branch Pocket

A short side path splits from a normal corridor.

Best use:

- treasure
- rest
- low-tier events

### 5.2 Outer Extension

A chamber sits beyond the normal maze footprint and connects through a thin corridor or breach.

Best use:

- merchant
- elite
- rare treasure

### 5.3 Sealed Chamber

The room is visible or implied but initially inaccessible.

Unlock methods:

- kill threshold
- chest threshold
- clear all enemies in a region
- survive until late-floor timer

Best use:

- elite
- treasure vault
- shrine

### 5.4 Deep Route Reward

The room is placed near the floor's least convenient reachable branch.

Best use:

- premium treasure
- event rooms with strong upside

### 5.5 Volatile Opening

A temporary opening appears and may close before the autopather reaches it.

Best use:

- high-tension rooms
- trial rooms
- advanced content only

## 6. Generation Pipeline

Recommended floor generation order:

1. build main maze
2. compute main path from start to exit
3. compute branch structure and cell difficulty scores
4. roll hidden-room count
5. roll room types
6. place room anchors and side connections
7. apply seal conditions if needed
8. mark room metadata for autopather and rewards

This order matters because room placement should respond to actual maze topology.

## 7. Hidden Room Count Formula

The system should bias toward scarcity.

Recommended baseline:

- `roomCap = 2`
- `sizeProgress = normalized maze size from 0 to 1`
- `specialFloorBonus = 0, 0.2, or 0.4`
- `unlockBonus = hidden room upgrade contribution`

Suggested count roll:

```text
baseChanceOne = 0.08 + sizeProgress * 0.26 + unlockBonus + specialFloorBonus
baseChanceTwo = -0.10 + sizeProgress * 0.14 + unlockBonus * 0.35 + specialFloorBonus * 0.5
```

Result rules:

- if roll fails both: `0 rooms`
- if first passes: `1 room`
- if both pass: `2 rooms`
- clamp to `2`

Interpretation:

- tiny early mazes mostly have none
- normal midgame floors occasionally have one
- large or special floors sometimes have two

## 8. Type Weighting Rules

Do not use flat random selection.

Instead, use weighted rolls influenced by floor type.

Recommended normal floor weights:

- treasure: `40`
- event: `28`
- elite: `14`
- rest: `10`
- merchant: `6`
- trial: `2`

Example adjustments:

- treasure floor: `treasure +20`, `elite -4`
- elite floor: `elite +18`, `rest -4`
- event floor: `event +24`
- pre-boss floors: `rest +10`, `merchant +8`, `trial -2`

## 9. Accessibility Model

This system should feel automatic but not brainless.

Each hidden room gets an `accessScore`.

Recommended components:

- path detour cost
- distance from current best path
- door state
- kill threshold state
- floor danger
- room reward tier
- scanner quality from upgrades

Suggested interpretation:

```text
accessScore =
rewardWeight
+ scannerBonus
+ floorArchetypeBias
- detourCost
- dangerPenalty
- sealedPenalty
```

Autopathing rule:

- if `accessScore >= diversionThreshold`, divert automatically
- otherwise continue on main floor completion route

This makes hidden-room upgrades meaningful without requiring player input.

## 10. Kill-Gated Rooms

These are important because they create a feeling of "earn access first".

Recommended gate conditions:

- kill `X` enemies on this floor
- clear all enemies in a marked region
- open `Y` chests first
- defeat one elite before the gate unlocks

Recommended early usage:

- only on high-value rooms
- keep conditions readable and rare at first

Suggested thresholds by floor size:

- small: `3-5 kills`
- medium: `5-8 kills`
- large: `8-12 kills`

Recommended UI behavior:

- show gate icon on the sealed room
- reveal condition in short plain language
- update progress passively

## 11. Topology Scoring

To place rooms "where it is hardest to reach", the generator should score candidate cells.

Useful scoring inputs:

- shortest path distance from start
- distance from exit
- off-main-path depth
- branch length
- dead-end depth
- nearby enemy density

Recommended cell score:

```text
cellDifficultyScore =
0.45 * normalizedDistanceFromStart
+ 0.25 * normalizedBranchDepth
+ 0.20 * deadEndDepth
+ 0.10 * nearbyThreat
```

Use this score to:

- place premium rooms deeper
- keep common treasure rooms from always spawning in trivial spots

## 12. Reward Budget Rules

Hidden rooms should feel valuable, but they should not make the base floor meaningless.

Recommended reward share target:

- baseline floor rewards: `75% to 85%`
- hidden room rewards: `15% to 25%`

That means:

- lucky finds feel good
- missing one room is not devastating
- hidden-room upgrades are attractive without becoming mandatory

Recommended reward tiers:

- tier 1: small boost, common treasure room
- tier 2: notable payout, event or merchant upside
- tier 3: high-value elite or sealed chamber
- tier 4: rare premium room, usually gated or volatile

## 13. Upgrade Hooks

These upgrades are a clean way to integrate hidden rooms into the meta.

### 13.1 Appearance Upgrades

- increase room spawn chance
- slightly increase chance for second room

### 13.2 Detection Upgrades

- reveal hidden rooms earlier
- reduce uncertainty in diversion decision

### 13.3 Access Upgrades

- lower diversion threshold
- reduce sealed penalties
- reduce detour fear

### 13.4 Exploitation Upgrades

- increase reward quality from hidden rooms
- improve relic chance from elite rooms
- improve healing or discounts in support rooms

Recommended early upgrade names:

- `Signal Sweep`
- `Side-Path Mapper`
- `Vault Key Protocol`
- `Greed Engine`

## 14. Floor Archetype Integration

Each floor archetype should have its own hidden-room behavior.

### Combat Floor

- 0-1 rooms common
- treasure/event bias

### Treasure Floor

- 1 room common
- treasure/merchant bias

### Event Floor

- 1 guaranteed special chamber
- event/rest bias

### Elite Floor

- 0-1 rooms
- elite/trial bias

### Boss Floor

- normally no hidden rooms during the boss arena
- optional pre-boss support chamber can appear before the arena begins

## 15. Failure Cases To Avoid

Avoid these outcomes:

- hidden rooms appear so often they feel mandatory
- hidden rooms are so rare the system feels fake
- path diversion is so aggressive that exit clear time becomes annoying
- reward variance gets too high between lucky and unlucky runs
- sealed rooms appear but feel unreadable
- room logic creates too many impossible states in tiny mazes

## 16. Metrics To Watch During Testing

Once implemented, track these:

- average hidden rooms generated per floor
- average hidden rooms entered per floor
- percentage of generated rooms never reached
- average detour time added when a room is entered
- reward share coming from hidden rooms
- floor clear time with and without hidden room diversion

Healthy early targets:

- generated rooms per floor: `0.25 - 0.6`
- entered rooms per floor: `0.12 - 0.35`
- unreachable or skipped rooms: `35% - 60%`
- average time added when diverted: `6 - 18 seconds`

## 17. Recommended First Implementation Slice

Build the smallest version that proves the concept:

1. `Treasure Room`
2. `Event Room`
3. `Elite Room`
4. one kill-gated sealed chamber
5. one upgrade that increases hidden-room appearance chance
6. one upgrade that increases diversion willingness

Skip for v1:

- merchant room
- volatile timed openings
- multiple simultaneous gate types
- premium reward reroll systems

## 18. Suggested Data Tables

Recommended definitions:

- `HIDDEN_ROOM_TYPES`
- `HIDDEN_ROOM_REWARD_TIERS`
- `HIDDEN_ROOM_GATES`
- `HIDDEN_ROOM_PLACEMENT_ARCHETYPES`
- `HIDDEN_ROOM_UPGRADES`
- `FLOOR_ARCHETYPE_ROOM_WEIGHTS`

For a first-pass concrete draft of those tables, see:

- `docs/hidden-room-data-tables.md`

## 19. Direct Implementation Mapping

For the current codebase, the most likely integration points are:

- `GameState`: hidden-room upgrade levels, spawn bonuses, detection bonuses
- `GameController.startLevel()`: floor archetype input
- `GameController.finishGeneration()`: room roll, placement, gate setup
- pathfinding layer: diversion threshold and priority resolution
- reward layer: payout injection and relic rolls

## 20. Final Rule Of Thumb

Hidden rooms should create the feeling of:

- "nice, I found something extra"

not:

- "the game is bad unless I manually babysit every floor"
