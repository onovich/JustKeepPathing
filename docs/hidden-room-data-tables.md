# JustKeepPathing Hidden Room Data Tables Draft

This document converts the hidden room design into implementation-friendly data tables.

The goal is not to freeze balance forever. The goal is to create a stable first pass that can be translated into code with minimal interpretation.

## 1. Floor Archetype Definitions

Suggested shape:

```js
const FLOOR_ARCHETYPE_DEFS = {
  combat: {},
  treasure: {},
  event: {},
  elite: {},
  rest: {},
  merchant: {},
  boss: {}
};
```

First-pass values:

```js
const FLOOR_ARCHETYPE_DEFS = {
  combat: {
    label: 'Combat Floor',
    mazeSizeBias: 0,
    monsterRateMult: 1,
    chestRateMult: 1,
    hiddenRoomBonus: 0,
    guaranteedRoomType: null,
    eliteChanceBonus: 0
  },
  treasure: {
    label: 'Treasure Floor',
    mazeSizeBias: -0.06,
    monsterRateMult: 0.75,
    chestRateMult: 1.6,
    hiddenRoomBonus: 0.08,
    guaranteedRoomType: 'treasure',
    eliteChanceBonus: -0.04
  },
  event: {
    label: 'Event Floor',
    mazeSizeBias: -0.12,
    monsterRateMult: 0.6,
    chestRateMult: 0.8,
    hiddenRoomBonus: 0.12,
    guaranteedRoomType: 'event',
    eliteChanceBonus: -0.08
  },
  elite: {
    label: 'Elite Floor',
    mazeSizeBias: 0.08,
    monsterRateMult: 1.18,
    chestRateMult: 0.8,
    hiddenRoomBonus: 0.04,
    guaranteedRoomType: null,
    eliteChanceBonus: 0.18
  },
  rest: {
    label: 'Rest Floor',
    mazeSizeBias: -0.2,
    monsterRateMult: 0.2,
    chestRateMult: 0.35,
    hiddenRoomBonus: 0.06,
    guaranteedRoomType: 'rest',
    eliteChanceBonus: -0.2
  },
  merchant: {
    label: 'Merchant Floor',
    mazeSizeBias: -0.18,
    monsterRateMult: 0.15,
    chestRateMult: 0.4,
    hiddenRoomBonus: 0.1,
    guaranteedRoomType: 'merchant',
    eliteChanceBonus: -0.2
  },
  boss: {
    label: 'Boss Floor',
    mazeSizeBias: 0,
    monsterRateMult: 0,
    chestRateMult: 0,
    hiddenRoomBonus: -0.25,
    guaranteedRoomType: null,
    eliteChanceBonus: 0
  }
};
```

## 2. Hidden Room Type Definitions

Suggested shape:

```js
const HIDDEN_ROOM_TYPES = {
  treasure: {},
  event: {},
  elite: {},
  merchant: {},
  rest: {},
  trial: {}
};
```

First-pass values:

```js
const HIDDEN_ROOM_TYPES = {
  treasure: {
    label: 'Treasure Room',
    rewardTierMin: 1,
    rewardTierMax: 2,
    baseWeight: 40,
    gatePool: ['none', 'kill_small'],
    placementPool: ['branch_pocket', 'deep_route_reward'],
    autoDiversionBias: 0.12,
    minFloorLevel: 1
  },
  event: {
    label: 'Event Room',
    rewardTierMin: 1,
    rewardTierMax: 3,
    baseWeight: 28,
    gatePool: ['none', 'kill_small'],
    placementPool: ['branch_pocket', 'sealed_chamber'],
    autoDiversionBias: 0.08,
    minFloorLevel: 1
  },
  elite: {
    label: 'Elite Room',
    rewardTierMin: 2,
    rewardTierMax: 4,
    baseWeight: 14,
    gatePool: ['kill_medium', 'kill_large'],
    placementPool: ['outer_extension', 'sealed_chamber', 'deep_route_reward'],
    autoDiversionBias: 0.18,
    minFloorLevel: 2
  },
  merchant: {
    label: 'Merchant Room',
    rewardTierMin: 2,
    rewardTierMax: 3,
    baseWeight: 6,
    gatePool: ['none'],
    placementPool: ['outer_extension', 'branch_pocket'],
    autoDiversionBias: 0.1,
    minFloorLevel: 3
  },
  rest: {
    label: 'Rest Room',
    rewardTierMin: 1,
    rewardTierMax: 2,
    baseWeight: 10,
    gatePool: ['none'],
    placementPool: ['branch_pocket'],
    autoDiversionBias: 0.22,
    minFloorLevel: 2
  },
  trial: {
    label: 'Trial Room',
    rewardTierMin: 3,
    rewardTierMax: 4,
    baseWeight: 2,
    gatePool: ['kill_large'],
    placementPool: ['volatile_opening', 'sealed_chamber', 'deep_route_reward'],
    autoDiversionBias: -0.04,
    minFloorLevel: 4
  }
};
```

## 3. Hidden Room Reward Tiers

Suggested shape:

```js
const HIDDEN_ROOM_REWARD_TIERS = {
  1: {},
  2: {},
  3: {},
  4: {}
};
```

First-pass values:

```js
const HIDDEN_ROOM_REWARD_TIERS = {
  1: {
    scoreMult: 0.2,
    chestBonus: 1,
    relicChance: 0.02,
    repairValue: 0.12
  },
  2: {
    scoreMult: 0.4,
    chestBonus: 2,
    relicChance: 0.07,
    repairValue: 0.2
  },
  3: {
    scoreMult: 0.7,
    chestBonus: 3,
    relicChance: 0.15,
    repairValue: 0.3
  },
  4: {
    scoreMult: 1.1,
    chestBonus: 4,
    relicChance: 0.28,
    repairValue: 0.42
  }
};
```

Interpretation:

- `scoreMult` is relative to normal floor clear payout
- `chestBonus` means extra guaranteed reward bundles, not necessarily literal chest objects
- `relicChance` should roll only once per room clear

## 4. Gate Definitions

Suggested shape:

```js
const HIDDEN_ROOM_GATES = {
  none: {},
  kill_small: {},
  kill_medium: {},
  kill_large: {}
};
```

First-pass values:

```js
const HIDDEN_ROOM_GATES = {
  none: {
    label: 'Open',
    type: 'none',
    thresholdBySize: { small: 0, medium: 0, large: 0 }
  },
  kill_small: {
    label: 'Kill Gate I',
    type: 'kills_this_floor',
    thresholdBySize: { small: 3, medium: 4, large: 5 }
  },
  kill_medium: {
    label: 'Kill Gate II',
    type: 'kills_this_floor',
    thresholdBySize: { small: 5, medium: 7, large: 9 }
  },
  kill_large: {
    label: 'Kill Gate III',
    type: 'kills_this_floor',
    thresholdBySize: { small: 7, medium: 10, large: 13 }
  }
};
```

## 5. Placement Archetypes

Suggested shape:

```js
const HIDDEN_ROOM_PLACEMENT_ARCHETYPES = {
  branch_pocket: {},
  outer_extension: {},
  sealed_chamber: {},
  deep_route_reward: {},
  volatile_opening: {}
};
```

First-pass values:

```js
const HIDDEN_ROOM_PLACEMENT_ARCHETYPES = {
  branch_pocket: {
    label: 'Branch Pocket',
    detourCostMult: 0.8,
    difficultyTargetMin: 0.2,
    difficultyTargetMax: 0.55
  },
  outer_extension: {
    label: 'Outer Extension',
    detourCostMult: 1.1,
    difficultyTargetMin: 0.45,
    difficultyTargetMax: 0.8
  },
  sealed_chamber: {
    label: 'Sealed Chamber',
    detourCostMult: 1,
    difficultyTargetMin: 0.4,
    difficultyTargetMax: 0.9
  },
  deep_route_reward: {
    label: 'Deep Route Reward',
    detourCostMult: 1.2,
    difficultyTargetMin: 0.65,
    difficultyTargetMax: 1
  },
  volatile_opening: {
    label: 'Volatile Opening',
    detourCostMult: 1.25,
    difficultyTargetMin: 0.55,
    difficultyTargetMax: 1
  }
};
```

## 6. Floor Archetype Room Weights

This is the table most likely to be consulted every floor.

```js
const FLOOR_ARCHETYPE_ROOM_WEIGHTS = {
  combat:   { treasure: 40, event: 28, elite: 14, merchant: 6, rest: 10, trial: 2 },
  treasure: { treasure: 62, event: 22, elite: 10, merchant: 10, rest: 12, trial: 1 },
  event:    { treasure: 18, event: 56, elite: 8, merchant: 8, rest: 18, trial: 2 },
  elite:    { treasure: 18, event: 18, elite: 34, merchant: 5, rest: 8, trial: 8 },
  rest:     { treasure: 16, event: 20, elite: 2, merchant: 8, rest: 52, trial: 0 },
  merchant: { treasure: 14, event: 18, elite: 4, merchant: 54, rest: 16, trial: 0 },
  boss:     { treasure: 0,  event: 0,  elite: 0,  merchant: 0, rest: 0,  trial: 0 }
};
```

Notes:

- a floor with a `guaranteedRoomType` should still use this table for its second room
- a `boss` floor should normally not roll hidden rooms at all

## 7. Hidden Room Count Parameters

Suggested shape:

```js
const HIDDEN_ROOM_COUNT_PARAMS = {};
```

First-pass values:

```js
const HIDDEN_ROOM_COUNT_PARAMS = {
  roomCap: 2,
  baseChanceOneMin: 0.08,
  baseChanceOneSizeScale: 0.26,
  baseChanceTwoMin: -0.1,
  baseChanceTwoSizeScale: 0.14,
  unlockBonusSecondScale: 0.35,
  specialFloorBonusSecondScale: 0.5
};
```

Pseudo-formula:

```js
chanceOne = baseChanceOneMin + sizeProgress * baseChanceOneSizeScale + unlockBonus + specialFloorBonus;
chanceTwo = baseChanceTwoMin + sizeProgress * baseChanceTwoSizeScale + unlockBonus * unlockBonusSecondScale + specialFloorBonus * specialFloorBonusSecondScale;
```

## 8. Diversion Evaluation Parameters

Suggested shape:

```js
const HIDDEN_ROOM_ACCESS_PARAMS = {};
```

First-pass values:

```js
const HIDDEN_ROOM_ACCESS_PARAMS = {
  rewardWeightScale: 0.34,
  scannerBonusScale: 0.22,
  floorArchetypeBiasScale: 0.12,
  detourCostScale: 0.28,
  dangerPenaltyScale: 0.16,
  sealedPenaltyScale: 0.18,
  diversionThresholdBase: 0.52
};
```

Suggested pseudo-formula:

```js
accessScore =
  rewardTierNorm * rewardWeightScale +
  scannerNorm * scannerBonusScale +
  floorBias * floorArchetypeBiasScale -
  detourNorm * detourCostScale -
  dangerNorm * dangerPenaltyScale -
  sealedNorm * sealedPenaltyScale;

shouldDivert = accessScore >= diversionThresholdBase - diversionBonus;
```

## 9. Hidden Room Upgrades

Suggested shape:

```js
const HIDDEN_ROOM_UPGRADES = {};
```

First-pass values:

```js
const HIDDEN_ROOM_UPGRADES = {
  signal_sweep: {
    label: 'Signal Sweep',
    maxLevel: 8,
    effectPerLevel: 0.025,
    affects: 'spawnChance'
  },
  side_path_mapper: {
    label: 'Side-Path Mapper',
    maxLevel: 6,
    effectPerLevel: 0.05,
    affects: 'scannerQuality'
  },
  vault_key_protocol: {
    label: 'Vault Key Protocol',
    maxLevel: 6,
    effectPerLevel: 0.04,
    affects: 'sealedPenaltyReduction'
  },
  greed_engine: {
    label: 'Greed Engine',
    maxLevel: 6,
    effectPerLevel: 0.06,
    affects: 'diversionBonus'
  },
  salvage_amplifier: {
    label: 'Salvage Amplifier',
    maxLevel: 8,
    effectPerLevel: 0.05,
    affects: 'hiddenRewardMult'
  }
};
```

## 10. Event Room Content Seeds

These are not full event scripts yet. They are seed entries for a first implementation.

```js
const EVENT_ROOM_SEEDS = [
  {
    id: 'repair_shrine',
    label: 'Repair Shrine',
    effect: 'heal_or_shield',
    weight: 24,
    minLevel: 1
  },
  {
    id: 'unstable_cache',
    label: 'Unstable Cache',
    effect: 'score_now_risk_next_floor',
    weight: 18,
    minLevel: 1
  },
  {
    id: 'scout_beacon',
    label: 'Scout Beacon',
    effect: 'next_floor_hidden_room_bonus',
    weight: 16,
    minLevel: 2
  },
  {
    id: 'black_market',
    label: 'Black Market',
    effect: 'buy_temp_module',
    weight: 10,
    minLevel: 3
  },
  {
    id: 'cursed_core',
    label: 'Cursed Core',
    effect: 'power_up_with_penalty',
    weight: 12,
    minLevel: 3
  }
];
```

## 11. Elite Room Support Seeds

```js
const ELITE_ROOM_SUPPORT_SEEDS = [
  { id: 'amp_pylon', label: 'Amplifier', atkMult: 0.2, hpMult: 0.05, weight: 24, minLevel: 2 },
  { id: 'shield_core', label: 'Shield Core', atkMult: 0.06, hpMult: 0.24, weight: 22, minLevel: 2 },
  { id: 'jammer', label: 'Jammer', atkMult: 0.14, hpMult: 0.14, weight: 18, minLevel: 3 }
];
```

Suggested use:

- roll `1` support on lower-tier elite rooms
- roll `2` supports on reward tier `3+`
- place the elite deeper in the chamber than the support devices when possible
- let autoplay clear support devices first, then route into the elite

Suggested room variants:

```js
const ELITE_ROOM_VARIANTS = [
  { key: 'bulwark', label: 'Bastion Room', chamberStyle: 'bastion' },
  { key: 'gauntlet', label: 'Corridor Room', chamberStyle: 'corridor' },
  { key: 'pincer', label: 'Pincer Room', chamberStyle: 'fork' }
];
```

## 12. Elite Room Reward Seeds

```js
const ELITE_ROOM_REWARD_SEEDS = [
  { id: 'premium_score', weight: 30, rewardTierBonus: 1 },
  { id: 'relic_roll', weight: 20, rewardTierBonus: 0 },
  { id: 'repair_and_score', weight: 18, rewardTierBonus: 0 },
  { id: 'module_offer', weight: 12, rewardTierBonus: 1 },
  { id: 'future_floor_bonus', weight: 16, rewardTierBonus: 0 }
];
```

## 13. Treasure Room Reward Seeds

```js
const TREASURE_ROOM_REWARD_SEEDS = [
  { id: 'score_cache', weight: 36 },
  { id: 'double_chest_bundle', weight: 28 },
  { id: 'scrap_cache', weight: 18 },
  { id: 'small_repair_pack', weight: 12 },
  { id: 'low_roll_relic', weight: 6 }
];
```

## 14. First Implementation Slice

If we want a manageable first code pass, use only this subset:

```js
const V1_HIDDEN_ROOM_ENABLED_TYPES = ['treasure', 'event', 'elite', 'rest', 'merchant', 'trial'];
const V1_HIDDEN_ROOM_ENABLED_GATES = ['none', 'kill_small', 'kill_medium', 'kill_large'];
const V1_HIDDEN_ROOM_ENABLED_PLACEMENTS = ['branch_pocket', 'sealed_chamber', 'deep_route_reward'];
```

And these rules:

- max 1 hidden room on small floors
- merchant and rest rooms can be enabled because they resolve automatically
- trial room enabled as a late-floor high-risk payout room
- no volatile opening yet
- no second room unless maze size level >= 3

Related item loop:

- one `floor supply` item can be auto-consumed at the start of each floor
- it grants a one-floor buff
- it can drop from maze rewards
- merchant rooms can sell it cheaper than the manual UI button
- rest rooms can sometimes refill it as part of recovery

Suggested early supply types:

```js
const FLOOR_SUPPLY_TYPES = {
  assault: { label: 'Battle Supply', attackMult: 1.24 },
  salvage: { label: 'Salvage Supply', chestRewardMult: 1.42, supplyDropBonus: 0.14 },
  scout: { label: 'Scout Supply', hiddenRoomBonus: 0.10, diversionBonus: 0.08 }
};
```

Suggested auto-use rule:

- `combat`, `elite`, `boss` floors prefer `assault`
- `treasure`, `rest`, `merchant` floors prefer `salvage`
- `event` floors prefer `scout`

Suggested trial variants:

```js
const TRIAL_ROOM_SEEDS = [
  { id: 'overclock_array', label: 'Overclock Trial', effect: 'assault_cache', rewardMult: 1.22, hazardMult: 1.35, nodeCountBias: -1 },
  { id: 'salvage_run', label: 'Salvage Trial', effect: 'salvage_cache', rewardMult: 1.06, hazardMult: 0.82, nodeCountBias: 1 },
  { id: 'pulse_survey', label: 'Pulse Survey', effect: 'survey', rewardMult: 0.98, hazardMult: 0.9, nodeCountBias: 0 },
  { id: 'endurance_loop', label: 'Endurance Loop', effect: 'repair_loop', rewardMult: 1.08, hazardMult: 1.02, nodeCountBias: 0 }
];
```

Each trial variant should change at least one of:

- node count
- per-node hazard
- total payout
- completion bonus type

Suggested event variants:

```js
const EVENT_ROOM_SEEDS = [
  { id: 'repair_shrine', label: 'Repair Anomaly', effect: 'heal_or_shield', rewardMult: 0.94, nodeCountBias: 0, diversionBias: 0.08 },
  { id: 'unstable_cache', label: 'Unstable Cache', effect: 'score_now_risk_next_floor', rewardMult: 1.16, nodeCountBias: -1, diversionBias: -0.04 },
  { id: 'scout_beacon', label: 'Scout Anomaly', effect: 'next_floor_hidden_room_bonus', rewardMult: 0.92, nodeCountBias: 0, diversionBias: 0.10 },
  { id: 'cursed_core', label: 'Cursed Core', effect: 'power_up_with_penalty', rewardMult: 1.18, nodeCountBias: -1, diversionBias: -0.06 },
  { id: 'salvage_matrix', label: 'Salvage Matrix', effect: 'chest_density_boost', rewardMult: 1.04, nodeCountBias: 1, diversionBias: 0.05 },
  { id: 'raid_signal', label: 'Raid Signal', effect: 'monster_density_boost', rewardMult: 1.08, nodeCountBias: 1, diversionBias: -0.02 }
];
```

Each event variant should now influence at least one of:

- node count
- event-room reward multiplier
- auto-diversion appetite
- persistent follow-up bonus

Suggested biome rotation:

```js
const FLOOR_THEME_ROTATION = [
  'ember_forge',
  'salvage_reaches',
  'signal_warrens',
  'quarantine_vault'
];

const FLOOR_THEME_DEFS = {
  ember_forge: { label: 'Ember Forge', monsterRateMult: 1.08, chestRateMult: 0.9, hiddenRoomBonus: 0.02 },
  salvage_reaches: { label: 'Salvage Reaches', monsterRateMult: 0.94, chestRateMult: 1.18, hiddenRoomBonus: 0.05 },
  signal_warrens: { label: 'Signal Warrens', monsterRateMult: 1.0, chestRateMult: 0.96, hiddenRoomBonus: 0.07 },
  quarantine_vault: { label: 'Quarantine Vault', monsterRateMult: 1.14, chestRateMult: 0.88, hiddenRoomBonus: 0.01 }
};
```

Biome themes should be allowed to bias:

- monster density
- chest density
- hidden-room total chance
- hidden-room type weights
- event seed pool
- trial seed pool
- ambient enemy family weights

Each biome can also define a light finale package for floor `6/6`:

- a finale label shown in UI
- extra hidden-room bias
- extra density bias
- optional boss chance bonus

## 15. Direct Mapping To Current Systems

This is how the tables likely map into the existing game:

- `GameState`
  - hidden room upgrade levels
  - floor archetype state
- `GameController.startLevel()`
  - pick floor archetype
  - apply archetype multipliers
- `GameController.finishGeneration()`
  - compute branch scores
  - roll room count
  - place rooms
  - apply gates
- pathfinding and movement
  - evaluate diversion score
  - decide auto-entry
- rewards
  - grant tiered payout
  - trigger event or relic resolution

## 16. Recommended Next Step After This Document

The next practical move is:

1. define `FLOOR_ARCHETYPE_DEFS`
2. define `HIDDEN_ROOM_TYPES`
3. implement one room count roll
4. implement one placement archetype
5. implement one gate type
6. let the autopather divert into a reachable room automatically
