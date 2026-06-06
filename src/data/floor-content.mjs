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

export const FLOOR_THEME_ROTATION = Object.freeze([
    'ember_forge',
    'salvage_reaches',
    'signal_warrens',
    'quarantine_vault'
]);
export const FLOOR_THEME_DEFS = Object.freeze({
    ember_forge: Object.freeze({
        label: '余烬铸区',
        accentColor: '#fb923c',
        monsterRateMult: 1.08,
        chestRateMult: 0.9,
        hiddenRoomBonus: 0.02,
        hiddenRoomWeightBias: Object.freeze({ event: -2, elite: 6, merchant: -2, rest: -2, trial: 4, treasure: -3 }),
        directive: Object.freeze({
            label: '熔压火线',
            summary: '这一段火力更猛，清怪收益也会更高。',
            attackBonus: 0.06,
            monsterRewardBonus: 0.08
        }),
        finale: Object.freeze({
            label: '熔压收束',
            monsterRateMult: 1.18,
            chestRateMult: 0.82,
            hiddenRoomBonus: 0.05,
            bossChanceBonus: 0.08,
            hiddenRoomWeightBias: Object.freeze({ elite: 8, trial: 8, event: -2, treasure: -4, rest: -2, merchant: -2 }),
            bossMod: Object.freeze({
                name: '熔压主脑',
                intro: '警报：余烬铸区核心开始过热，熔压主脑已接管全层火力。',
                attackVerb: '熔压脉冲倾泻',
                hpMult: 1.18,
                atkMult: 1.14,
                rewardMult: 1.18,
                clearBonusMult: 0.18,
                color: 0xf97316,
                accent: 0xfdba74,
                bossMechanic: Object.freeze({
                    key: 'heat_ramp',
                    atkGainPerStack: 0.16,
                    maxStacks: 3
                })
            })
        })
    }),
    salvage_reaches: Object.freeze({
        label: '回收水道',
        accentColor: '#fbbf24',
        monsterRateMult: 0.94,
        chestRateMult: 1.18,
        hiddenRoomBonus: 0.05,
        hiddenRoomWeightBias: Object.freeze({ event: 2, elite: -3, merchant: 4, rest: 3, trial: -2, treasure: 8 }),
        directive: Object.freeze({
            label: '回收浪潮',
            summary: '这一段更容易滚起资源，宝箱和补给都会更肥。',
            chestRewardBonus: 0.14,
            supplyDropBonus: 0.06
        }),
        finale: Object.freeze({
            label: '清算回收',
            monsterRateMult: 0.95,
            chestRateMult: 1.22,
            hiddenRoomBonus: 0.08,
            bossChanceBonus: 0.02,
            hiddenRoomWeightBias: Object.freeze({ treasure: 10, merchant: 8, event: 2, elite: -2, trial: -2, rest: 2 }),
            bossMod: Object.freeze({
                name: '回收主脑',
                intro: '警报：回收水道完成清算封锁，回收主脑正在抽走整层资源。',
                attackVerb: '回收洪流压榨',
                hpMult: 1.05,
                atkMult: 1.02,
                rewardMult: 1.22,
                clearBonusMult: 0.24,
                color: 0xfbbf24,
                accent: 0xfef08a,
                bossMechanic: Object.freeze({
                    key: 'salvage_repair',
                    healRatio: 0.08,
                    maxTriggers: 3
                })
            })
        })
    }),
    signal_warrens: Object.freeze({
        label: '信号巢道',
        accentColor: '#67e8f9',
        monsterRateMult: 1,
        chestRateMult: 0.96,
        hiddenRoomBonus: 0.07,
        hiddenRoomWeightBias: Object.freeze({ event: 10, elite: -2, merchant: 2, rest: 2, trial: 3, treasure: -2 }),
        directive: Object.freeze({
            label: '讯号导流',
            summary: '这一段更容易刷出密室，也更愿意自动绕进去。',
            hiddenRoomBonus: 0.05,
            diversionBonus: 0.05
        }),
        finale: Object.freeze({
            label: '满频脉冲',
            monsterRateMult: 1.04,
            chestRateMult: 0.98,
            hiddenRoomBonus: 0.1,
            bossChanceBonus: 0.04,
            hiddenRoomWeightBias: Object.freeze({ event: 12, trial: 6, elite: 2, treasure: -2, merchant: 1, rest: 0 }),
            bossMod: Object.freeze({
                name: '脉冲主脑',
                intro: '警报：信号巢道全频段同步，脉冲主脑开始持续锁定飞船。',
                attackVerb: '满频脉冲轰扫',
                hpMult: 1.1,
                atkMult: 1.08,
                rewardMult: 1.16,
                clearBonusMult: 0.2,
                color: 0x22d3ee,
                accent: 0xa5f3fc,
                bossMechanic: Object.freeze({
                    key: 'signal_jam',
                    playerDamageMult: 0.62
                })
            })
        })
    }),
    quarantine_vault: Object.freeze({
        label: '封锁库层',
        accentColor: '#c4b5fd',
        monsterRateMult: 1.14,
        chestRateMult: 0.88,
        hiddenRoomBonus: 0.01,
        hiddenRoomWeightBias: Object.freeze({ event: 2, elite: 8, merchant: -2, rest: 4, trial: 5, treasure: -4 }),
        directive: Object.freeze({
            label: '封锁协议',
            summary: '这一段更抗压，Boss 结算也会再抬高一点。',
            incomingDamageReduction: 0.08,
            bossRewardBonus: 0.08
        }),
        finale: Object.freeze({
            label: '封锁清剿',
            monsterRateMult: 1.2,
            chestRateMult: 0.78,
            hiddenRoomBonus: 0.04,
            bossChanceBonus: 0.1,
            hiddenRoomWeightBias: Object.freeze({ elite: 10, rest: 6, trial: 4, event: 0, merchant: -3, treasure: -5 }),
            bossMod: Object.freeze({
                name: '封锁主脑',
                intro: '警报：封锁库层进入清剿协议，封锁主脑展开最终拦截。',
                attackVerb: '封锁湮灭扫射',
                hpMult: 1.22,
                atkMult: 1.18,
                rewardMult: 1.2,
                clearBonusMult: 0.22,
                color: 0xa78bfa,
                accent: 0xe9d5ff,
                bossMechanic: Object.freeze({
                    key: 'seal_layers',
                    layers: 2,
                    damageMult: 0.48
                })
            })
        })
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
        label: '??????',
        effect: 'heal_or_shield',
        rewardMult: 0.94,
        nodeCountBias: 0,
        diversionBias: 0.08,
        themeBias: Object.freeze({ quarantine_vault: 6, ember_forge: 1 }),
        weight: 24,
        minLevel: 1
    }),
    Object.freeze({
        id: 'unstable_cache',
        label: '??????',
        effect: 'score_now_risk_next_floor',
        rewardMult: 1.16,
        nodeCountBias: -1,
        diversionBias: -0.04,
        themeBias: Object.freeze({ ember_forge: 5, salvage_reaches: -2 }),
        weight: 18,
        minLevel: 1
    }),
    Object.freeze({
        id: 'scout_beacon',
        label: '??????',
        effect: 'next_floor_hidden_room_bonus',
        rewardMult: 0.92,
        nodeCountBias: 0,
        diversionBias: 0.1,
        themeBias: Object.freeze({ signal_warrens: 8, salvage_reaches: 1 }),
        weight: 16,
        minLevel: 2
    }),
    Object.freeze({
        id: 'cursed_core',
        label: '??????',
        effect: 'power_up_with_penalty',
        rewardMult: 1.18,
        nodeCountBias: -1,
        diversionBias: -0.06,
        themeBias: Object.freeze({ quarantine_vault: 6, ember_forge: 2 }),
        weight: 12,
        minLevel: 3
    }),
    Object.freeze({
        id: 'salvage_matrix',
        label: '??????',
        effect: 'chest_density_boost',
        rewardMult: 1.04,
        nodeCountBias: 1,
        diversionBias: 0.05,
        themeBias: Object.freeze({ salvage_reaches: 8, signal_warrens: 1 }),
        weight: 14,
        minLevel: 2
    }),
    Object.freeze({
        id: 'raid_signal',
        label: '??????',
        effect: 'monster_density_boost',
        rewardMult: 1.08,
        nodeCountBias: 1,
        diversionBias: -0.02,
        themeBias: Object.freeze({ ember_forge: 4, signal_warrens: 4, quarantine_vault: 2 }),
        weight: 12,
        minLevel: 2
    }),
    Object.freeze({
        id: 'repair_dock',
        label: '????',
        effect: 'repair_and_guard',
        rewardMult: 0.9,
        nodeCountBias: 0,
        diversionBias: 0.12,
        themeBias: Object.freeze({ quarantine_vault: 8, salvage_reaches: 3 }),
        weight: 16,
        minLevel: 2
    }),
    Object.freeze({
        id: 'supply_depot',
        label: '????',
        effect: 'supply_stockpile',
        rewardMult: 0.98,
        nodeCountBias: 1,
        diversionBias: 0.09,
        themeBias: Object.freeze({ salvage_reaches: 8, signal_warrens: 3 }),
        weight: 15,
        minLevel: 2
    })
]);

export const TRIAL_ROOM_SEEDS = Object.freeze([
    Object.freeze({
        id: 'overclock_array',
        label: '??????',
        effect: 'assault_cache',
        rewardMult: 1.22,
        hazardMult: 1.35,
        nodeCountBias: -1,
        diversionBias: -0.02,
        themeBias: Object.freeze({ ember_forge: 8, quarantine_vault: 3 }),
        weight: 20,
        minLevel: 4
    }),
    Object.freeze({
        id: 'salvage_run',
        label: '??????',
        effect: 'salvage_cache',
        rewardMult: 1.06,
        hazardMult: 0.82,
        nodeCountBias: 1,
        diversionBias: 0.05,
        themeBias: Object.freeze({ salvage_reaches: 9, signal_warrens: 1 }),
        weight: 18,
        minLevel: 4
    }),
    Object.freeze({
        id: 'pulse_survey',
        label: '??????',
        effect: 'survey',
        rewardMult: 0.98,
        hazardMult: 0.9,
        nodeCountBias: 0,
        diversionBias: 0.08,
        themeBias: Object.freeze({ signal_warrens: 9, salvage_reaches: 2 }),
        weight: 18,
        minLevel: 4
    }),
    Object.freeze({
        id: 'endurance_loop',
        label: '??????',
        effect: 'repair_loop',
        rewardMult: 1.08,
        hazardMult: 1.02,
        nodeCountBias: 0,
        diversionBias: 0.03,
        themeBias: Object.freeze({ quarantine_vault: 7, ember_forge: 1 }),
        weight: 14,
        minLevel: 5
    }),
    Object.freeze({
        id: 'breach_charge',
        label: '????',
        effect: 'attack_overdrive',
        rewardMult: 1.16,
        hazardMult: 1.16,
        nodeCountBias: -1,
        diversionBias: -0.04,
        themeBias: Object.freeze({ ember_forge: 8, signal_warrens: 2 }),
        weight: 16,
        minLevel: 5
    }),
    Object.freeze({
        id: 'guard_cache',
        label: '?????',
        effect: 'guard_cache',
        rewardMult: 1.04,
        hazardMult: 0.88,
        nodeCountBias: 0,
        diversionBias: 0.07,
        themeBias: Object.freeze({ quarantine_vault: 8, salvage_reaches: 2 }),
        weight: 15,
        minLevel: 5
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

export const V1_HIDDEN_ROOM_ENABLED_TYPES = Object.freeze(['treasure', 'event', 'elite', 'rest', 'merchant', 'trial']);
export const V1_HIDDEN_ROOM_ENABLED_GATES = Object.freeze(['none', 'kill_small', 'kill_medium', 'kill_large']);
export const V1_HIDDEN_ROOM_ENABLED_PLACEMENTS = Object.freeze(['branch_pocket', 'sealed_chamber', 'deep_route_reward']);
