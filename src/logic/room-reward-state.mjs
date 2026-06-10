import {
    buildEventStockpileSupplyPlan,
    buildTrialSupplyRewardPlan
} from './room-reward-plans.mjs';
import { resolveEchoEngineEventBonus } from './room-reward-resolution.mjs';

export function buildRestRoomRewardDecision({
    hpRatio = 1,
    supplyNeedState = {}
} = {}) {
    const shouldRestockSupply = supplyNeedState.restockUrgency >= 0.44
        || !!supplyNeedState.missingPreferred
        || !!supplyNeedState.preferredMissing
        || !!supplyNeedState.usedSupplyThisFloor
        || !supplyNeedState.supplyActive;
    const shouldFortify = hpRatio < 0.68
        || (supplyNeedState.usedSupplyThisFloor && supplyNeedState.reservePressure >= 0.48)
        || (supplyNeedState.totalSupply <= 1 && supplyNeedState.shortfallSeverity >= 0.54);

    return {
        shouldRestockSupply,
        shouldFortify
    };
}

export function buildRestRoomRewardStatePlan({
    roomName = 'Rest Room',
    hpRatio = 1,
    supplyNeedState = {},
    neededSupply = supplyNeedState.neededType || 'salvage',
    supplyLabel = 'supply',
    restRewards = {},
    decision = buildRestRoomRewardDecision({ hpRatio, supplyNeedState })
} = {}) {
    const actions = [];
    let message = `${roomName} stabilized the run.`;

    if (hpRatio < 0.9 || decision.shouldFortify) {
        const heal = restRewards.heal || 0;
        const scoreReward = restRewards.scoreReward || 0;
        actions.push({ type: 'heal-player', amount: heal });
        actions.push({ type: 'score', amount: scoreReward });
        if (decision.shouldFortify) {
            actions.push({
                type: 'multiply-incoming-damage',
                factor: Math.max(0.56, 1 - (restRewards.guardReduction || 0))
            });
        }
        message = `${roomName} restored ${heal} HP and granted ${scoreReward} score.`;
        if (decision.shouldFortify) {
            message += ' Incoming damage was reduced for the rest of the floor.';
        }
    } else {
        const atkBoost = restRewards.attackBoost || 0;
        const chestBoost = restRewards.chestBoost || 0;
        actions.push({ type: 'increase-player-attack', amount: atkBoost });
        actions.push({ type: 'increase-chest-rate', amount: chestBoost });
        actions.push({ type: 'score', amount: restRewards.fallbackScoreReward || 0 });
        message = `${roomName} improved attack by ${atkBoost} and slightly raised chest density.`;
    }

    if (decision.shouldRestockSupply) {
        actions.push({
            type: 'grant-floor-supply',
            supplyType: neededSupply,
            amount: 1
        });
        message += ` Added 1 ${supplyLabel}.`;
    }

    return {
        ...decision,
        actions,
        message
    };
}

export function buildMerchantRoomRewardStatePlan({
    roomName = 'Merchant Room',
    merchantPlan = {},
    merchantRewards = {},
    neededSupply = 'salvage',
    neededSupplyLabel = 'supply',
    supplyPrice = 0,
    supplyNeedState = {}
} = {}) {
    if (merchantPlan.shouldBuySupply) {
        return {
            outcome: 'supply',
            actions: [
                { type: 'spend-score', amount: supplyPrice },
                { type: 'grant-floor-supply', supplyType: neededSupply, amount: 1 }
            ],
            message: `${roomName} bought 1 ${neededSupplyLabel} for ${supplyPrice} score.`
        };
    }

    const purchase = merchantPlan.purchase;
    if (!purchase) {
        return {
            outcome: 'intel',
            actions: [
                { type: 'score', amount: merchantRewards.consolation || 0 },
                {
                    type: 'increase-next-hidden-room-bonus',
                    amount: (merchantRewards.intelHiddenRoomBonus || 0) + (supplyNeedState.shortfallSeverity || 0) * 0.02,
                    cap: 0.24
                }
            ],
            message: `${roomName} found no good deal, took intel instead, and improved next-floor hidden room odds.`
        };
    }

    const baseCost = purchase.baseCost || 0;
    const discountedCost = purchase.discountedCost || baseCost;
    const rebate = Math.max(0, baseCost - discountedCost);
    const typeLabels = {
        atk: 'attack upgrade',
        hp: 'armor upgrade',
        chest: 'treasure module',
        size: 'maze expansion'
    };

    return {
        outcome: 'upgrade',
        actions: [
            {
                type: 'buy-upgrade',
                upgradeType: purchase.type,
                rebate,
                failedScore: merchantRewards.failedDealFallback || 0
            }
        ],
        message: `${roomName} auto-purchased ${typeLabels[purchase.type] || 'supplies'} for ${discountedCost} score.`,
        failureMessage: `${roomName} converted the failed deal into ${merchantRewards.failedDealFallback || 0} score.`
    };
}

function getSupplyLabel(supplyLabels = {}, type, fallback = 'supply') {
    return supplyLabels?.[type] || fallback;
}

export function buildEventRoomRewardStatePlan({
    roomName = 'Event Room',
    eventSeed = {},
    eventRewards = {},
    playerCurrentHp = 0,
    playerBaseHp = 1,
    supplyNeedState = {},
    supplyPriority = [],
    supplyLabels = {},
    hasEchoEngine = false,
    currentNextFloorAttackBonus = 0
} = {}) {
    const effect = eventSeed.effect;
    const label = eventSeed.label || roomName;
    const chargeCount = eventRewards.chargeCount || 1;
    const actions = [];
    let message = `${label} stabilized the anomaly.`;

    if (effect === 'heal_or_shield') {
        const heal = eventRewards.healOrShieldHeal || 0;
        const scoreReward = eventRewards.healOrShieldScore || 0;
        const nextHp = Math.min(playerBaseHp, playerCurrentHp + heal);
        actions.push({ type: 'heal-player', amount: heal });
        actions.push({ type: 'score', amount: scoreReward });
        if (nextHp >= playerBaseHp * 0.92) {
            actions.push({ type: 'grant-floor-supply', supplyType: 'salvage', amount: 1 });
            message = `${label} restored ${heal} HP and added 1 ${getSupplyLabel(supplyLabels, 'salvage')}.`;
        } else {
            message = `${label} restored ${heal} HP and granted ${scoreReward} score.`;
        }
    } else if (effect === 'next_floor_hidden_room_bonus') {
        const bonus = eventRewards.nextHiddenRoomBonus || 0;
        const scoreReward = eventRewards.nextHiddenRoomScore || 0;
        actions.push({ type: 'increase-next-hidden-room-bonus', amount: bonus, cap: 0.3 });
        actions.push({ type: 'score', amount: scoreReward });
        message = `${label} boosted next-floor hidden room odds and granted ${scoreReward} score.`;
    } else if (effect === 'repair_and_guard') {
        const heal = eventRewards.repairAndGuardHeal || 0;
        const reduction = eventRewards.repairAndGuardReduction || 0;
        actions.push({ type: 'heal-player', amount: heal });
        actions.push({
            type: 'multiply-incoming-damage',
            factor: Math.max(0.56, 1 - reduction)
        });
        actions.push({ type: 'score', amount: eventRewards.repairAndGuardScore || 0 });
        if (chargeCount >= 2) {
            const supplyType = supplyNeedState.neededType || 'salvage';
            actions.push({ type: 'grant-floor-supply', supplyType, amount: 1 });
            message = `${label} repaired for ${heal} HP, reduced incoming damage, and added 1 ${getSupplyLabel(supplyLabels, supplyType)}.`;
        } else {
            message = `${label} repaired for ${heal} HP and reduced incoming damage.`;
        }
    } else if (effect === 'power_up_with_penalty') {
        const atkBoost = eventRewards.powerAtkBoost || 0;
        const hpLoss = eventRewards.powerHpLoss || 0;
        actions.push({ type: 'increase-player-attack', amount: atkBoost });
        actions.push({ type: 'damage-player', amount: hpLoss });
        actions.push({ type: 'score', amount: eventRewards.powerScore || 0 });
        message = `${label} overclocked attack by +${atkBoost} and lost ${hpLoss} HP.`;
    } else if (effect === 'chest_density_boost') {
        const chestBoost = eventRewards.chestBoost || 0;
        const scoreReward = eventRewards.chestScore || 0;
        actions.push({ type: 'increase-chest-rate', amount: chestBoost });
        actions.push({ type: 'score', amount: scoreReward });
        if (chargeCount >= 2) {
            actions.push({ type: 'grant-floor-supply', supplyType: 'salvage', amount: 1 });
            message = `${label} boosted chest density and added 1 ${getSupplyLabel(supplyLabels, 'salvage')}.`;
        } else {
            message = `${label} boosted chest density and granted ${scoreReward} score.`;
        }
    } else if (effect === 'supply_stockpile') {
        const stockpilePlan = buildEventStockpileSupplyPlan({
            firstSupply: supplyNeedState.neededType,
            priority: supplyPriority,
            chargeCount
        });
        for (const supply of stockpilePlan.supplies) {
            actions.push({
                type: 'grant-floor-supply',
                supplyType: supply.type,
                amount: supply.amount
            });
        }
        actions.push({ type: 'score', amount: eventRewards.stockpileScore || 0 });
        const firstSupplyLabel = getSupplyLabel(supplyLabels, stockpilePlan.primary);
        const secondSupplyLabel = getSupplyLabel(supplyLabels, stockpilePlan.secondary);
        message = stockpilePlan.grantsSecondSupply
            ? `${label} granted 1 ${firstSupplyLabel} and 1 ${secondSupplyLabel}.`
            : `${label} granted 1 ${firstSupplyLabel} and some score.`;
    } else if (effect === 'monster_density_boost') {
        const monsterBoost = eventRewards.monsterBoost || 0;
        const atkBoost = eventRewards.monsterAtkBoost || 0;
        actions.push({ type: 'increase-monster-rate', amount: monsterBoost });
        actions.push({ type: 'increase-player-attack', amount: atkBoost });
        actions.push({ type: 'score', amount: eventRewards.monsterScore || 0 });
        message = `${label} increased enemy density and attack by ${atkBoost}.`;
    } else {
        const unstableReward = eventRewards.unstableReward || 0;
        const monsterBoost = eventRewards.unstableMonsterBoost || 0;
        actions.push({ type: 'increase-monster-rate', amount: monsterBoost });
        actions.push({ type: 'score', amount: unstableReward });
        message = `${label} granted ${unstableReward} score and increased enemy density.`;
    }

    const echoBonus = resolveEchoEngineEventBonus({
        hasEchoEngine,
        currentNextFloorAttackBonus,
        attackBonus: eventRewards.echoEngineAttackBonus
    });
    if (echoBonus.applied) {
        actions.push({
            type: 'set-next-floor-attack-bonus',
            value: echoBonus.nextFloorAttackBonus
        });
    }
    if (echoBonus.message) message += ` ${echoBonus.message}`;

    return {
        outcome: effect || 'unstable',
        actions,
        message,
        echoBonus
    };
}

function buildTrialSupplyPlan({
    effect,
    rewardTier,
    trialRewards,
    neededType,
    mostNeededType
}) {
    return buildTrialSupplyRewardPlan({
        effect,
        rewardTier,
        chargeCount: trialRewards.chargeCount,
        supplyThreshold: trialRewards.supplyThreshold,
        neededType,
        mostNeededType
    });
}

export function buildTrialRoomRewardStatePlan({
    roomName = 'Trial Room',
    trialSeed = {},
    trialRewards = {},
    rewardTier = 1,
    neededType = 'salvage',
    mostNeededType = 'salvage',
    supplyLabels = {}
} = {}) {
    const effect = trialSeed.effect;
    const chargeCount = trialRewards.chargeCount || 1;
    const supplyThreshold = trialRewards.supplyThreshold ?? 2;
    const bonusReward = trialRewards.bonusReward || 0;
    const actions = [
        { type: 'score', amount: bonusReward }
    ];
    let bonusText = '';
    let trialBonusSupply = null;

    const setTrialBonusSupply = (supplyType) => {
        trialBonusSupply = supplyType || null;
        actions.push({
            type: 'set-room-field',
            field: 'trialBonusSupply',
            value: trialBonusSupply
        });
    };
    const addSupplyReward = (supplyPlan, fallbackLabel = 'supply') => {
        if (!supplyPlan) return null;
        actions.push({
            type: 'grant-floor-supply',
            supplyType: supplyPlan.type,
            amount: supplyPlan.amount
        });
        setTrialBonusSupply(supplyPlan.type);
        return getSupplyLabel(supplyLabels, supplyPlan.type, fallbackLabel);
    };

    if (effect === 'repair_loop') {
        const heal = trialRewards.repairLoopHeal || 0;
        actions.push({ type: 'heal-player', amount: heal });
        setTrialBonusSupply(null);
        bonusText = ` Restored ${heal} HP.`;
    } else if (effect === 'guard_cache') {
        const heal = trialRewards.guardCacheHeal || 0;
        const reduction = trialRewards.guardCacheReduction || 0;
        actions.push({ type: 'heal-player', amount: heal });
        actions.push({
            type: 'multiply-incoming-damage',
            factor: Math.max(0.56, 1 - reduction)
        });
        const supplyPlan = buildTrialSupplyPlan({
            effect,
            rewardTier,
            trialRewards,
            neededType,
            mostNeededType
        });
        const supplyLabel = addSupplyReward(supplyPlan);
        if (supplyLabel) {
            bonusText = ` Restored ${heal} HP, reduced incoming damage, and added 1 ${supplyLabel}.`;
        } else {
            setTrialBonusSupply(null);
            bonusText = ` Restored ${heal} HP and reduced incoming damage.`;
        }
    } else if (effect === 'survey') {
        actions.push({
            type: 'increase-next-hidden-room-bonus',
            amount: trialRewards.surveyScoutBonus || 0,
            cap: 0.28
        });
        setTrialBonusSupply(null);
        bonusText = ' Boosted next-floor hidden room scouting.';
    } else if (effect === 'attack_overdrive') {
        const atkBoost = trialRewards.attackBoost || 0;
        const attackBonus = trialRewards.attackBonus || 0;
        actions.push({ type: 'increase-player-attack', amount: atkBoost });
        actions.push({
            type: 'increase-next-floor-attack-bonus',
            amount: attackBonus,
            cap: 0.4
        });
        const supplyPlan = buildTrialSupplyPlan({
            effect,
            rewardTier,
            trialRewards,
            neededType,
            mostNeededType
        });
        const supplyLabel = addSupplyReward(supplyPlan, 'assault supply');
        if (supplyLabel) {
            bonusText = ` Attack +${atkBoost}, next-floor attack +${Math.round(attackBonus * 100)}%, and added 1 ${supplyLabel}.`;
        } else {
            setTrialBonusSupply(null);
            bonusText = ` Attack +${atkBoost} and next-floor attack +${Math.round(attackBonus * 100)}%.`;
        }
    } else if (chargeCount >= supplyThreshold) {
        const supplyPlan = buildTrialSupplyPlan({
            effect,
            rewardTier,
            trialRewards,
            neededType,
            mostNeededType
        });
        const supplyLabel = addSupplyReward(supplyPlan);
        bonusText = supplyLabel ? ` Added 1 ${supplyLabel}.` : '';
    } else {
        actions.push({
            type: 'increase-next-hidden-room-bonus',
            amount: trialRewards.fallbackScoutBonus || 0,
            cap: 0.24
        });
        setTrialBonusSupply(null);
        bonusText = ' Added a small next-floor scouting bonus.';
    }

    return {
        outcome: effect || 'fallback',
        trialBonusSupply,
        actions,
        message: `${trialSeed.label || roomName} completed the trial and granted ${bonusReward} score.${bonusText}`
    };
}

export function buildEliteRoomClearRewardStatePlan({
    roomName = 'Elite Room',
    eliteRewards = {}
} = {}) {
    const bonusReward = eliteRewards.bonusReward || 0;
    const repair = eliteRewards.repair || 0;
    const actions = [
        { type: 'score', amount: bonusReward }
    ];
    let message = `${roomName} cleared and granted ${bonusReward} bonus score.`;

    if (repair > 0) {
        actions.push({ type: 'heal-player', amount: repair });
        message += ` Restored ${repair} HP.`;
    }

    return {
        actions,
        message,
        bonusReward,
        repair
    };
}

export function buildHiddenCachePickupStatePlan({
    level = 1,
    entityReward = null,
    chestRewardMult = 1
} = {}) {
    const baseReward = entityReward || Math.max(10, 16 * level);
    const reward = Math.floor(baseReward * (chestRewardMult || 1));
    return {
        reward,
        actions: [
            { type: 'score', amount: reward },
            { type: 'increment-floor-stat', field: 'chests', amount: 1 }
        ]
    };
}

export function buildHiddenEventNodePickupStatePlan({
    level = 1,
    entityReward = null
} = {}) {
    const reward = entityReward || Math.max(10, 12 * level);
    return {
        reward,
        actions: [
            { type: 'increment-room-field', field: 'eventCharge', amount: 1 },
            { type: 'score', amount: reward }
        ]
    };
}

export function buildHiddenTrialNodePickupStatePlan({
    level = 1,
    playerBaseHp = 1,
    entityReward = null,
    hazardRatio = 0.06
} = {}) {
    const reward = entityReward || Math.max(16, 18 * level);
    const resolvedHazardRatio = hazardRatio || 0.06;
    const hazardDamage = Math.max(1, Math.floor(playerBaseHp * Math.max(0.04, resolvedHazardRatio)));
    return {
        reward,
        hazardDamage,
        actions: [
            { type: 'increment-room-field', field: 'trialCharge', amount: 1 },
            { type: 'increment-room-field', field: 'trialHazardTaken', amount: hazardDamage },
            { type: 'score', amount: reward },
            { type: 'damage-player', amount: hazardDamage }
        ]
    };
}

export function buildHiddenEliteNodePickupStatePlan({
    level = 1,
    entityReward = null
} = {}) {
    const reward = entityReward || Math.max(12, 16 * level);
    return {
        reward,
        actions: [
            { type: 'score', amount: reward }
        ]
    };
}

export function buildThemeChainBonusStatePlan(plan = null) {
    if (!plan?.kind) return { actions: [] };

    if (plan.kind === 'ember_forge') {
        const actions = [
            {
                type: 'increase-next-floor-attack-bonus',
                amount: plan.attackBonus || 0,
                cap: plan.nextFloorAttackBonusCap
            }
        ];
        if (plan.supplyType && plan.supplyCount > 0) {
            actions.push({ type: 'grant-floor-supply', supplyType: plan.supplyType, amount: plan.supplyCount });
        }
        return { actions };
    }

    if (plan.kind === 'salvage_reaches') {
        const actions = [
            { type: 'score', amount: plan.scoreBonus || 0 }
        ];
        if (plan.supplyType && plan.supplyCount > 0) {
            actions.push({ type: 'grant-floor-supply', supplyType: plan.supplyType, amount: plan.supplyCount });
        }
        return {
            actions
        };
    }

    if (plan.kind === 'signal_warrens') {
        const actions = [
            {
                type: 'increase-next-hidden-room-bonus',
                amount: plan.hiddenRoomBonus || 0,
                cap: plan.nextHiddenRoomBonusCap
            }
        ];
        if (plan.supplyType && plan.supplyCount > 0) {
            actions.push({ type: 'grant-floor-supply', supplyType: plan.supplyType, amount: plan.supplyCount });
        }
        return { actions };
    }

    if (plan.kind === 'quarantine_vault') {
        const actions = [
            {
                type: 'multiply-incoming-damage',
                factor: Math.max(plan.incomingDamageFloor ?? 0, 1 - (plan.damageReduction || 0))
            },
            { type: 'heal-player', amount: plan.repair || 0 }
        ];
        if (plan.refreshReflexShield) {
            actions.push({ type: 'set-floor-runtime-field', field: 'reflexShieldReady', value: true });
        }
        return { actions };
    }

    return { actions: [] };
}

export function applyRoomRewardActions({
    gameState,
    room = null,
    actions = [],
    addScore = (amount) => {
        gameState.score += amount;
    },
    grantFloorSupply = (type, amount = 1) => {
        gameState.items.supplies[type] = Math.max(0, (gameState.items.supplies[type] || 0) + amount);
    },
    buyUpgrade = () => false
} = {}) {
    const results = [];
    if (!gameState) return { gameState, results };

    for (const action of actions) {
        if (!action) continue;
        if (action.type === 'heal-player') {
            gameState.player.currentHp = Math.min(
                gameState.player.baseHp,
                gameState.player.currentHp + (action.amount || 0)
            );
        } else if (action.type === 'score') {
            addScore(action.amount || 0);
        } else if (action.type === 'multiply-incoming-damage') {
            gameState.floorBuff.incomingDamageMult *= action.factor ?? 1;
        } else if (action.type === 'increase-player-attack') {
            gameState.player.baseAtk += action.amount || 0;
        } else if (action.type === 'damage-player') {
            gameState.player.currentHp = Math.max(1, gameState.player.currentHp - (action.amount || 0));
        } else if (action.type === 'increase-chest-rate') {
            gameState.maze.baseChestRate += action.amount || 0;
        } else if (action.type === 'increase-monster-rate') {
            gameState.maze.baseMonsterRate += action.amount || 0;
        } else if (action.type === 'grant-floor-supply') {
            grantFloorSupply(action.supplyType, action.amount || 1);
        } else if (action.type === 'spend-score') {
            gameState.score -= action.amount || 0;
        } else if (action.type === 'increase-next-hidden-room-bonus') {
            gameState.meta.nextHiddenRoomBonus = Math.min(
                action.cap ?? Infinity,
                gameState.meta.nextHiddenRoomBonus + (action.amount || 0)
            );
        } else if (action.type === 'increase-next-floor-attack-bonus') {
            gameState.meta.nextFloorAttackBonus = Math.min(
                action.cap ?? Infinity,
                gameState.meta.nextFloorAttackBonus + (action.amount || 0)
            );
        } else if (action.type === 'set-next-floor-attack-bonus') {
            gameState.meta.nextFloorAttackBonus = action.value ?? gameState.meta.nextFloorAttackBonus;
        } else if (action.type === 'buy-upgrade') {
            const bought = !!buyUpgrade(action.upgradeType);
            results.push({
                type: action.type,
                upgradeType: action.upgradeType,
                bought
            });
            if (bought) {
                gameState.score += action.rebate || 0;
            } else {
                addScore(action.failedScore || 0);
            }
        } else if (action.type === 'set-room-field' && room) {
            room[action.field] = action.value ?? null;
        } else if (action.type === 'increment-room-field' && room) {
            room[action.field] = (room[action.field] || 0) + (action.amount || 0);
        } else if (action.type === 'increment-floor-stat') {
            if (!gameState.floorStats) gameState.floorStats = {};
            gameState.floorStats[action.field] = (gameState.floorStats[action.field] || 0) + (action.amount || 0);
        } else if (action.type === 'set-floor-runtime-field') {
            if (!gameState.floorRuntime) gameState.floorRuntime = {};
            gameState.floorRuntime[action.field] = action.value;
        }
    }

    return { gameState, results };
}
