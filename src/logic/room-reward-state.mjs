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

export function applyRoomRewardActions({
    gameState,
    actions = [],
    addScore = (amount) => {
        gameState.score += amount;
    },
    grantFloorSupply = (type, amount = 1) => {
        gameState.items.supplies[type] = Math.max(0, (gameState.items.supplies[type] || 0) + amount);
    }
} = {}) {
    if (!gameState) return gameState;

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
        }
    }

    return gameState;
}
