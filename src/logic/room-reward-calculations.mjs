export function getRoomChargeCount(value) {
    return Math.max(1, value || 0);
}

export function calculateEventRoomRewards({
    level,
    rewardTier,
    rewardProfile,
    eventSeed = {},
    eventCharge = 0,
    playerBaseHp
}) {
    const chargeCount = getRoomChargeCount(eventCharge);
    const chargeBonus = chargeCount * 0.16;
    const seedRewardMult = eventSeed.rewardMult || 1;
    const baseReward = Math.floor((70 + rewardProfile.chestBonus * 18) * level * (rewardProfile.scoreMult + chargeBonus) * seedRewardMult);

    return {
        chargeCount,
        chargeBonus,
        baseReward,
        healOrShieldHeal: Math.max(10, Math.floor(playerBaseHp * (0.14 + rewardProfile.repairValue + chargeBonus * 0.35))),
        healOrShieldScore: Math.floor(baseReward * 0.94),
        nextHiddenRoomBonus: 0.05 + rewardTier * 0.015 + chargeBonus * 0.05,
        nextHiddenRoomScore: Math.floor(baseReward * 0.88),
        repairAndGuardHeal: Math.max(12, Math.floor(playerBaseHp * (0.12 + rewardProfile.repairValue * 0.78 + chargeBonus * 0.22))),
        repairAndGuardReduction: Math.min(0.24, 0.08 + rewardTier * 0.025 + chargeBonus * 0.06),
        repairAndGuardScore: Math.floor(baseReward * 0.9),
        powerAtkBoost: 2 + rewardTier + Math.round(chargeCount * 0.8),
        powerHpLoss: Math.max(1, Math.floor(playerBaseHp * 0.08)),
        powerScore: Math.floor(baseReward * 1.12),
        chestBoost: 0.012 + rewardTier * 0.004 + chargeBonus * 0.01,
        chestScore: Math.floor(baseReward * 0.96),
        stockpileScore: Math.floor(baseReward * (chargeCount >= 2 ? 0.82 : 0.74)),
        monsterBoost: 0.009 + rewardTier * 0.003 + chargeBonus * 0.008,
        monsterAtkBoost: 1 + rewardTier + Math.round(chargeCount * 0.6),
        monsterScore: Math.floor(baseReward * 1.04),
        unstableReward: Math.floor(baseReward * 1.18),
        unstableMonsterBoost: 0.006 + rewardTier * 0.002 + chargeBonus * 0.006,
        echoEngineAttackBonus: Math.min(0.24, 0.08 + rewardTier * 0.02 + chargeBonus * 0.04)
    };
}

export function calculateRestRoomRewards({
    level,
    rewardTier,
    rewardProfile,
    playerBaseHp,
    shouldFortify,
    reservePressure = 0
}) {
    const scoreReward = Math.floor((26 + rewardTier * 12) * level * (0.7 + rewardProfile.scoreMult));
    return {
        scoreReward,
        heal: Math.max(12, Math.floor(playerBaseHp * (0.16 + rewardProfile.repairValue * 0.85 + (shouldFortify ? 0.04 : 0)))),
        guardReduction: 0.08 + rewardTier * 0.015 + reservePressure * 0.08,
        attackBoost: 1 + Math.max(0, rewardTier - 1),
        chestBoost: 0.004 + rewardTier * 0.002,
        fallbackScoreReward: Math.floor(scoreReward * 0.8)
    };
}

export function calculateMerchantRoomRewards({
    level,
    rewardTier,
    rewardProfile
}) {
    return {
        discount: Math.max(0.68, 0.86 - rewardTier * 0.05),
        consolation: Math.floor((22 + rewardProfile.chestBonus * 8) * level * 0.85),
        failedDealFallback: Math.floor((20 + rewardProfile.chestBonus * 7) * level * 0.75),
        intelHiddenRoomBonus: 0.02 + rewardTier * 0.01
    };
}

export function calculateTrialRoomRewards({
    level,
    rewardTier,
    rewardProfile,
    trialSeed = {},
    trialCharge = 0,
    hpRatio,
    playerBaseHp
}) {
    const chargeCount = getRoomChargeCount(trialCharge);
    const seedRewardMult = trialSeed.rewardMult || 1;
    const supplyThreshold = Math.max(2, rewardTier - 1);
    return {
        chargeCount,
        supplyThreshold,
        bonusReward: Math.floor((90 + rewardProfile.chestBonus * 24) * level * (rewardProfile.scoreMult + chargeCount * 0.22 + hpRatio * 0.18) * seedRewardMult),
        repairLoopHeal: Math.max(12, Math.floor(playerBaseHp * (0.12 + rewardProfile.repairValue * 0.5))),
        guardCacheHeal: Math.max(10, Math.floor(playerBaseHp * (0.08 + rewardProfile.repairValue * 0.36))),
        guardCacheReduction: Math.min(0.22, 0.06 + rewardTier * 0.018 + chargeCount * 0.012),
        surveyScoutBonus: 0.05 + rewardTier * 0.012 + chargeCount * 0.01,
        attackBoost: 2 + rewardTier + Math.max(1, Math.round(chargeCount * 0.8)),
        attackBonus: Math.min(0.22, 0.05 + rewardTier * 0.015 + chargeCount * 0.02),
        fallbackScoutBonus: 0.03 + rewardTier * 0.01
    };
}

export function calculateEliteRoomClearRewards({
    level,
    rewardProfile,
    playerBaseHp
}) {
    return {
        bonusReward: Math.floor((120 + rewardProfile.chestBonus * 24) * level * rewardProfile.scoreMult),
        repair: Math.floor(playerBaseHp * rewardProfile.repairValue * 0.45)
    };
}
