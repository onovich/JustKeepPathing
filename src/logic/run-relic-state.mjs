export function getRunRelicOverflowScore({
    level = 1,
    source = 'elite'
} = {}) {
    return Math.floor((90 + level * 24) * (source === 'boss' ? 1.45 : 1));
}

export function getRunRelicRollChance({
    source = 'elite',
    rewardTier = 1,
    guaranteed = false
} = {}) {
    if (guaranteed) return 1;
    const baseChance = source === 'boss' ? 1 : 0.08 + rewardTier * 0.08;
    return Math.min(0.72, baseChance);
}

export function shouldRollRunRelicReward({
    chance = 0,
    randomValue = Math.random()
} = {}) {
    return randomValue <= chance;
}

export function buildRunRelicMissResult(chance = 0) {
    return {
        status: 'miss',
        relic: null,
        bonusScore: 0,
        chance
    };
}

export function buildEmptyRunRelicPoolResult({
    level = 1,
    source = 'elite',
    chance = 0
} = {}) {
    return {
        status: 'empty-pool',
        relic: null,
        bonusScore: getRunRelicOverflowScore({ level, source }),
        chance
    };
}

export function buildRunRelicClaimResult({
    relic,
    source = 'elite',
    ownedIds = [],
    slotCount = 3,
    level = 1
} = {}) {
    const runRelics = [...ownedIds];
    if (!relic) {
        return {
            status: 'none',
            relic: null,
            bonusScore: 0,
            runRelics,
            shouldDiscover: false
        };
    }

    const duplicate = runRelics.includes(relic.id);
    if (duplicate || runRelics.length >= slotCount) {
        return {
            status: duplicate ? 'duplicate' : 'overflow',
            relic,
            bonusScore: getRunRelicOverflowScore({ level, source }),
            runRelics,
            shouldDiscover: false
        };
    }

    return {
        status: 'added',
        relic,
        bonusScore: 0,
        runRelics: [...runRelics, relic.id],
        shouldDiscover: true
    };
}

export function attachRunRelicRollChance(result, chance = 0) {
    return {
        ...result,
        chance
    };
}
