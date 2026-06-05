export const FLOOR_ARCHETYPE_DEFS = Object.freeze({
    combat: Object.freeze({
        label: 'Combat Floor',
        mazeSizeBias: 0,
        monsterRateMult: 1,
        chestRateMult: 1,
        hiddenRoomBonus: 0,
        guaranteedRoomType: null,
        eliteChanceBonus: 0
    }),
    treasure: Object.freeze({
        label: 'Treasure Floor',
        mazeSizeBias: -0.06,
        monsterRateMult: 0.75,
        chestRateMult: 1.6,
        hiddenRoomBonus: 0.08,
        guaranteedRoomType: 'treasure',
        eliteChanceBonus: -0.04
    }),
    event: Object.freeze({
        label: 'Event Floor',
        mazeSizeBias: -0.12,
        monsterRateMult: 0.6,
        chestRateMult: 0.8,
        hiddenRoomBonus: 0.12,
        guaranteedRoomType: 'event',
        eliteChanceBonus: -0.08
    }),
    elite: Object.freeze({
        label: 'Elite Floor',
        mazeSizeBias: 0.08,
        monsterRateMult: 1.18,
        chestRateMult: 0.8,
        hiddenRoomBonus: 0.04,
        guaranteedRoomType: null,
        eliteChanceBonus: 0.18
    }),
    rest: Object.freeze({
        label: 'Rest Floor',
        mazeSizeBias: -0.2,
        monsterRateMult: 0.2,
        chestRateMult: 0.35,
        hiddenRoomBonus: 0.06,
        guaranteedRoomType: 'rest',
        eliteChanceBonus: -0.2
    }),
    merchant: Object.freeze({
        label: 'Merchant Floor',
        mazeSizeBias: -0.18,
        monsterRateMult: 0.15,
        chestRateMult: 0.4,
        hiddenRoomBonus: 0.1,
        guaranteedRoomType: 'merchant',
        eliteChanceBonus: -0.2
    }),
    boss: Object.freeze({
        label: 'Boss Floor',
        mazeSizeBias: 0,
        monsterRateMult: 0,
        chestRateMult: 0,
        hiddenRoomBonus: -0.25,
        guaranteedRoomType: null,
        eliteChanceBonus: 0
    })
});

export const HIDDEN_ROOM_TYPES = Object.freeze({
    treasure: Object.freeze({
        label: 'Treasure Room',
        rewardTierMin: 1,
        rewardTierMax: 2,
        baseWeight: 40,
        gatePool: Object.freeze(['none', 'kill_small']),
        placementPool: Object.freeze(['branch_pocket', 'deep_route_reward']),
        autoDiversionBias: 0.12,
        minFloorLevel: 1
    }),
    event: Object.freeze({
        label: 'Event Room',
        rewardTierMin: 1,
        rewardTierMax: 3,
        baseWeight: 28,
        gatePool: Object.freeze(['none', 'kill_small']),
        placementPool: Object.freeze(['branch_pocket', 'sealed_chamber']),
        autoDiversionBias: 0.08,
        minFloorLevel: 1
    }),
    elite: Object.freeze({
        label: 'Elite Room',
        rewardTierMin: 2,
        rewardTierMax: 4,
        baseWeight: 14,
        gatePool: Object.freeze(['kill_medium', 'kill_large']),
        placementPool: Object.freeze(['outer_extension', 'sealed_chamber', 'deep_route_reward']),
        autoDiversionBias: 0.18,
        minFloorLevel: 2
    }),
    merchant: Object.freeze({
        label: 'Merchant Room',
        rewardTierMin: 2,
        rewardTierMax: 3,
        baseWeight: 6,
        gatePool: Object.freeze(['none']),
        placementPool: Object.freeze(['outer_extension', 'branch_pocket']),
        autoDiversionBias: 0.1,
        minFloorLevel: 3
    }),
    rest: Object.freeze({
        label: 'Rest Room',
        rewardTierMin: 1,
        rewardTierMax: 2,
        baseWeight: 10,
        gatePool: Object.freeze(['none']),
        placementPool: Object.freeze(['branch_pocket']),
        autoDiversionBias: 0.22,
        minFloorLevel: 2
    }),
    trial: Object.freeze({
        label: 'Trial Room',
        rewardTierMin: 3,
        rewardTierMax: 4,
        baseWeight: 2,
        gatePool: Object.freeze(['kill_large']),
        placementPool: Object.freeze(['volatile_opening', 'sealed_chamber', 'deep_route_reward']),
        autoDiversionBias: -0.04,
        minFloorLevel: 4
    })
});

export const HIDDEN_ROOM_GATES = Object.freeze({
    none: Object.freeze({
        label: 'Open',
        type: 'none',
        thresholdBySize: Object.freeze({ small: 0, medium: 0, large: 0 })
    }),
    kill_small: Object.freeze({
        label: 'Kill Gate I',
        type: 'kills_this_floor',
        thresholdBySize: Object.freeze({ small: 3, medium: 4, large: 5 })
    }),
    kill_medium: Object.freeze({
        label: 'Kill Gate II',
        type: 'kills_this_floor',
        thresholdBySize: Object.freeze({ small: 5, medium: 7, large: 9 })
    }),
    kill_large: Object.freeze({
        label: 'Kill Gate III',
        type: 'kills_this_floor',
        thresholdBySize: Object.freeze({ small: 7, medium: 10, large: 13 })
    })
});

export const HIDDEN_ROOM_PLACEMENT_ARCHETYPES = Object.freeze({
    branch_pocket: Object.freeze({
        label: 'Branch Pocket',
        detourCostMult: 0.8,
        difficultyTargetMin: 0.2,
        difficultyTargetMax: 0.55
    }),
    outer_extension: Object.freeze({
        label: 'Outer Extension',
        detourCostMult: 1.1,
        difficultyTargetMin: 0.45,
        difficultyTargetMax: 0.8
    }),
    sealed_chamber: Object.freeze({
        label: 'Sealed Chamber',
        detourCostMult: 1,
        difficultyTargetMin: 0.4,
        difficultyTargetMax: 0.9
    }),
    deep_route_reward: Object.freeze({
        label: 'Deep Route Reward',
        detourCostMult: 1.2,
        difficultyTargetMin: 0.65,
        difficultyTargetMax: 1
    }),
    volatile_opening: Object.freeze({
        label: 'Volatile Opening',
        detourCostMult: 1.25,
        difficultyTargetMin: 0.55,
        difficultyTargetMax: 1
    })
});

export const FLOOR_ARCHETYPE_ROOM_WEIGHTS = Object.freeze({
    combat: Object.freeze({ treasure: 40, event: 28, elite: 14, merchant: 6, rest: 10, trial: 2 }),
    treasure: Object.freeze({ treasure: 62, event: 22, elite: 10, merchant: 10, rest: 12, trial: 1 }),
    event: Object.freeze({ treasure: 18, event: 56, elite: 8, merchant: 8, rest: 18, trial: 2 }),
    elite: Object.freeze({ treasure: 18, event: 18, elite: 34, merchant: 5, rest: 8, trial: 8 }),
    rest: Object.freeze({ treasure: 16, event: 20, elite: 2, merchant: 8, rest: 52, trial: 0 }),
    merchant: Object.freeze({ treasure: 14, event: 18, elite: 4, merchant: 54, rest: 16, trial: 0 }),
    boss: Object.freeze({ treasure: 0, event: 0, elite: 0, merchant: 0, rest: 0, trial: 0 })
});

export const HIDDEN_ROOM_COUNT_PARAMS = Object.freeze({
    roomCap: 2,
    baseChanceOneMin: 0.08,
    baseChanceOneSizeScale: 0.26,
    baseChanceTwoMin: -0.1,
    baseChanceTwoSizeScale: 0.14,
    unlockBonusSecondScale: 0.35,
    specialFloorBonusSecondScale: 0.5
});

export const HIDDEN_ROOM_REWARD_TIERS = Object.freeze({
    1: Object.freeze({
        scoreMult: 0.2,
        chestBonus: 1,
        relicChance: 0.02,
        repairValue: 0.12
    }),
    2: Object.freeze({
        scoreMult: 0.4,
        chestBonus: 2,
        relicChance: 0.07,
        repairValue: 0.2
    }),
    3: Object.freeze({
        scoreMult: 0.7,
        chestBonus: 3,
        relicChance: 0.15,
        repairValue: 0.3
    }),
    4: Object.freeze({
        scoreMult: 1.1,
        chestBonus: 4,
        relicChance: 0.28,
        repairValue: 0.42
    })
});

export const HIDDEN_ROOM_ACCESS_PARAMS = Object.freeze({
    rewardWeightScale: 0.34,
    scannerBonusScale: 0.22,
    floorArchetypeBiasScale: 0.12,
    detourCostScale: 0.28,
    dangerPenaltyScale: 0.16,
    sealedPenaltyScale: 0.18,
    diversionThresholdBase: 0.52
});

export const EVENT_ROOM_SEEDS = Object.freeze([
    Object.freeze({
        id: 'repair_shrine',
        label: 'Repair Shrine',
        effect: 'heal_or_shield',
        weight: 24,
        minLevel: 1
    }),
    Object.freeze({
        id: 'unstable_cache',
        label: 'Unstable Cache',
        effect: 'score_now_risk_next_floor',
        weight: 18,
        minLevel: 1
    }),
    Object.freeze({
        id: 'scout_beacon',
        label: 'Scout Beacon',
        effect: 'next_floor_hidden_room_bonus',
        weight: 16,
        minLevel: 2
    }),
    Object.freeze({
        id: 'cursed_core',
        label: 'Cursed Core',
        effect: 'power_up_with_penalty',
        weight: 12,
        minLevel: 3
    }),
    Object.freeze({
        id: 'salvage_matrix',
        label: 'Salvage Matrix',
        effect: 'chest_density_boost',
        weight: 14,
        minLevel: 2
    }),
    Object.freeze({
        id: 'raid_signal',
        label: 'Raid Signal',
        effect: 'monster_density_boost',
        weight: 12,
        minLevel: 2
    })
]);

export const ELITE_ROOM_SUPPORT_SEEDS = Object.freeze([
    Object.freeze({
        id: 'amp_pylon',
        label: '增幅装置',
        atkMult: 0.2,
        hpMult: 0.05,
        rewardMult: 0.95,
        weight: 24,
        minLevel: 2
    }),
    Object.freeze({
        id: 'shield_core',
        label: '护盾核心',
        atkMult: 0.06,
        hpMult: 0.24,
        rewardMult: 1,
        weight: 22,
        minLevel: 2
    }),
    Object.freeze({
        id: 'jammer',
        label: '干扰核心',
        atkMult: 0.14,
        hpMult: 0.14,
        rewardMult: 1.06,
        weight: 18,
        minLevel: 3
    })
]);

export const V1_HIDDEN_ROOM_ENABLED_TYPES = Object.freeze(['treasure', 'event', 'elite', 'rest', 'merchant']);
export const V1_HIDDEN_ROOM_ENABLED_GATES = Object.freeze(['none', 'kill_small', 'kill_medium']);
export const V1_HIDDEN_ROOM_ENABLED_PLACEMENTS = Object.freeze(['branch_pocket', 'sealed_chamber', 'deep_route_reward']);
