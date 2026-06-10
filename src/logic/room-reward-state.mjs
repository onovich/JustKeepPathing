import { buildTrialSupplyRewardPlan } from './room-reward-plans.mjs';

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
        } else if (action.type === 'increase-chest-rate') {
            gameState.maze.baseChestRate += action.amount || 0;
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
        }
    }

    return { gameState, results };
}
