function normalizePriority(priority = [], fallbackType) {
    const unique = [];
    for (const type of [fallbackType, ...priority]) {
        if (type && !unique.includes(type)) unique.push(type);
    }
    return unique.length > 0 ? unique : ['salvage'];
}

export function buildEventStockpileSupplyPlan({
    firstSupply,
    priority = [],
    chargeCount = 1
}) {
    const ordered = normalizePriority(priority, firstSupply);
    const primary = firstSupply || ordered[0];
    const secondary = ordered.find((type) => type !== primary) || primary;
    const supplies = [{ type: primary, amount: 1 }];
    if (chargeCount >= 2) supplies.push({ type: secondary, amount: 1 });
    return {
        supplies,
        primary,
        secondary,
        grantsSecondSupply: chargeCount >= 2
    };
}

export function buildTrialSupplyRewardPlan({
    effect,
    rewardTier = 1,
    chargeCount = 1,
    supplyThreshold = 2,
    neededType = 'salvage',
    mostNeededType = 'salvage'
}) {
    if (chargeCount < supplyThreshold) return null;
    if (effect === 'guard_cache') return { type: neededType, amount: 1 };
    if (effect === 'attack_overdrive') return { type: 'assault', amount: 1 };
    if (effect === 'salvage_cache') return { type: 'salvage', amount: 1 };
    if (effect === 'assault_cache') return { type: 'assault', amount: 1 };
    if (rewardTier >= 4) return { type: 'assault', amount: 1 };
    return { type: mostNeededType, amount: 1 };
}
