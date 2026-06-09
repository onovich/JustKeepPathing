function getHpRatio(gameState) {
    return gameState.player.currentHp / Math.max(1, gameState.player.baseHp);
}

export function calculateHiddenRoomDiversionScore({
    room,
    detourExtra = 0,
    gameState,
    restNeedState = {},
    merchantNeedState = {}
}) {
    if (!room || !gameState) return -Infinity;

    let score = room.accessScore - Math.min(0.34, Math.max(0, detourExtra) * 0.032);
    const hpRatio = getHpRatio(gameState);

    if (room.typeKey === 'treasure') score += 0.04;
    if (room.typeKey === 'elite' && gameState.player.currentHp < gameState.player.baseHp * 0.45) score -= 0.12;

    if (room.typeKey === 'event') {
        const eventSeed = room.eventSeed || {};
        if (eventSeed.effect === 'heal_or_shield' && gameState.player.currentHp < gameState.player.baseHp * 0.7) score += 0.08;
        if (eventSeed.effect === 'repair_and_guard' && gameState.player.currentHp < gameState.player.baseHp * 0.76) score += 0.1;
        if (eventSeed.effect === 'next_floor_hidden_room_bonus') score += 0.05;
        if (eventSeed.effect === 'chest_density_boost') score += 0.04;
        if (eventSeed.effect === 'supply_stockpile' && gameState.getSupportRoomNeedState('event').shortfallSeverity > 0.4) score += 0.09;
        if (eventSeed.effect === 'monster_density_boost' && gameState.floorBuff?.supplyKey === 'assault') score += 0.04;
        if (eventSeed.effect === 'power_up_with_penalty' && gameState.player.currentHp < gameState.player.baseHp * 0.58) score -= 0.08;
        if (eventSeed.effect === 'score_now_risk_next_floor' && gameState.autoStrategy.risk === 'cautious') score -= 0.06;
        score += eventSeed.diversionBias || 0;
    }

    if (gameState.autoStrategy.risk === 'cautious') {
        if (room.typeKey === 'elite') score -= 0.1;
        if (room.typeKey === 'trial') score -= 0.14;
        if (room.typeKey === 'treasure') score -= 0.02;
    } else if (gameState.autoStrategy.risk === 'greedy') {
        if (room.typeKey === 'treasure') score += 0.06;
        if (room.typeKey === 'elite') score += 0.08;
        if (room.typeKey === 'trial') score += 0.1;
    }

    if (room.typeKey === 'rest') {
        if (hpRatio < 0.34) score += 0.38 + restNeedState.restockUrgency * 0.18;
        else if (hpRatio < 0.5) score += 0.26 + restNeedState.restockUrgency * 0.16;
        else if (hpRatio < 0.66) score += 0.16 + restNeedState.restockUrgency * 0.12;
        else if (hpRatio < 0.82) score += 0.05 + restNeedState.restockUrgency * 0.08;
        else score += restNeedState.restockUrgency * 0.05 - 0.08;

        if (restNeedState.usedSupplyThisFloor) score += 0.08 + restNeedState.reservePressure * 0.06;
        if (restNeedState.preferredMissing) score += 0.06;
        if (restNeedState.missingPreferred) score += 0.08;
        if (!restNeedState.usedSupplyThisFloor && restNeedState.totalSupply >= 3 && hpRatio > 0.84) score -= 0.05;
        if (restNeedState.shortfallSeverity < 0.24 && hpRatio > 0.88) score -= 0.04;

        if (gameState.autoStrategy.rest === 'emergency') {
            if (hpRatio > 0.74) score -= 0.22;
            else if (hpRatio > 0.58) score -= 0.1;
            else score += 0.05;
        } else if (gameState.autoStrategy.rest === 'prefer') {
            if (hpRatio > 0.72) score += 0.09;
            else score += 0.06;
        }
    }

    if (room.typeKey === 'merchant') {
        const merchantDiscount = Math.max(0.68, 0.86 - room.rewardTier * 0.05);
        const budgetState = gameState.getMerchantBudgetState(merchantDiscount, merchantNeedState.neededType);
        if (budgetState.canAffordUpgrade) score += 0.14 + Math.min(0.08, budgetState.upgradeBudgetRatio * 0.04);
        else if (budgetState.nearAffordUpgrade) score += 0.07;
        else score -= 0.08;

        if (budgetState.canAffordSupply) score += 0.06 + merchantNeedState.shortfallSeverity * 0.12;
        else if (budgetState.nearAffordSupply) score += merchantNeedState.shortfallSeverity * 0.04;
        else score -= merchantNeedState.shortfallSeverity > 0.62 ? 0.02 : 0.08;

        if (merchantNeedState.preferredMissing) score += 0.06;
        if (merchantNeedState.missingPreferred) score += 0.08;
        if (merchantNeedState.usedSupplyThisFloor && merchantNeedState.totalSupply <= 1) score += 0.08;

        if (gameState.autoStrategy.merchant === 'supplies') {
            score += 0.1 + merchantNeedState.reservePressure * 0.1;
            if (!budgetState.canAffordSupply && merchantNeedState.restockUrgency > 0.68) score -= 0.06;
        }
        if (gameState.autoStrategy.merchant === 'save') {
            if (merchantNeedState.shortfallSeverity < 0.45 && budgetState.upgradeBudgetRatio < 0.95) score -= 0.18;
            else score += 0.03;
        }
        if (gameState.autoStrategy.merchant === 'power') {
            if (budgetState.canAffordUpgrade) score += 0.09;
            else if (budgetState.nearAffordUpgrade) score += 0.04;
        }
    }

    if (room.typeKey === 'trial') {
        const trialSeed = room.trialSeed || {};
        if (hpRatio >= 0.82) score += 0.22 + room.rewardTier * 0.02;
        else if (hpRatio >= 0.66) score += 0.1;
        else if (hpRatio < 0.52) score -= 0.18;
        if (gameState.floorBuff?.supplyKey === 'assault') score += 0.05;
        if (gameState.floorBuff?.supplyKey === 'scout') score += 0.04;
        score += trialSeed.diversionBias || 0;
        if (trialSeed.effect === 'repair_loop' && hpRatio < 0.62) score += 0.06;
        if (trialSeed.effect === 'guard_cache' && hpRatio < 0.72) score += 0.08;
        if (trialSeed.effect === 'assault_cache' && gameState.autoStrategy.risk === 'greedy') score += 0.04;
        if (trialSeed.effect === 'attack_overdrive' && (gameState.autoStrategy.risk === 'greedy' || gameState.floorBuff?.supplyKey === 'assault')) score += 0.08;
    }

    if (room.typeKey === 'treasure' && room.entered && room.pendingCacheIds?.length) score += 0.22;
    if (room.typeKey === 'event' && room.entered && room.pendingEventNodeIds?.length) score += 0.2;
    if (room.typeKey === 'elite' && room.entered && room.pendingEliteNodeIds?.length) score += 0.24;
    if (room.typeKey === 'elite' && room.entered && room.eliteEntity && !(room.pendingEliteNodeIds?.length > 0)) score += 0.14;
    if (room.typeKey === 'trial' && room.entered && room.pendingTrialNodeIds?.length) score += 0.22;
    score += gameState.floorBuff?.diversionBonus || 0;

    return score;
}
