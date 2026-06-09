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

function shouldPrioritizeMerchantSupply({
    merchantMode,
    supplyNeedState,
    canAffordSupply
}) {
    const priority = merchantMode === 'supplies'
        ? (supplyNeedState.restockUrgency >= 0.36 || supplyNeedState.totalSupply <= 2 || supplyNeedState.usedSupplyThisFloor)
        : merchantMode === 'save'
            ? ((supplyNeedState.missingPreferred || supplyNeedState.totalSupply <= 1) && canAffordSupply)
            : (supplyNeedState.restockUrgency >= 0.56 || supplyNeedState.missingPreferred || supplyNeedState.preferredMissing);
    return priority && canAffordSupply;
}

function getMerchantUpgradeBaseWeight({
    type,
    hpRatio,
    merchantMode,
    rewardTier,
    maze
}) {
    if (type === 'hp') return hpRatio < 0.55 ? 100 : hpRatio < 0.82 ? 60 : merchantMode === 'power' ? 20 : 18;
    if (type === 'atk') return merchantMode === 'power' ? 94 + rewardTier * 8 : 74 + rewardTier * 6;
    if (type === 'chest') return merchantMode === 'save' ? 42 + maze.lvChest * 2 : 52 + maze.lvChest * 4;
    if (type === 'size') return merchantMode === 'power'
        ? (maze.lvSize < 3 ? 92 : 48)
        : maze.lvSize < 3 ? 78 : 42;
    return 30;
}

export function buildMerchantRoomPurchasePlan({
    rewardTier = 1,
    merchantMode = 'power',
    hpRatio = 1,
    maze = {},
    isMazeSizeMaxed = false,
    upgradeCosts = {},
    discount = 1,
    budgetState = {},
    score = 0,
    supplyNeedState = {}
}) {
    const shouldBuySupply = shouldPrioritizeMerchantSupply({
        merchantMode,
        supplyNeedState,
        canAffordSupply: !!budgetState.canAffordSupply
    });
    const candidateTypes = ['atk', 'hp', 'chest', 'size'].filter((type) => type !== 'size' || !isMazeSizeMaxed);
    const reserve = merchantMode === 'save'
        ? Math.max(0, Math.floor(Math.min(upgradeCosts.atk ?? Infinity, upgradeCosts.hp ?? Infinity) * 0.35))
        : 0;
    const upgradeCandidates = candidateTypes
        .map((type) => {
            const baseCost = upgradeCosts[type];
            const discountedCost = Math.max(1, Math.floor(baseCost * discount));
            return {
                type,
                baseCost,
                discountedCost,
                weight: getMerchantUpgradeBaseWeight({
                    type,
                    hpRatio,
                    merchantMode,
                    rewardTier,
                    maze
                })
                    + (type === budgetState.cheapestUpgrade?.type ? 10 : 0)
                    + (merchantMode === 'supplies' && type === 'chest' ? 4 : 0)
                    + (merchantMode === 'save' && type === 'hp' ? (hpRatio < 0.72 ? 8 : 3) : 0)
            };
        })
        .sort((a, b) => b.weight - a.weight);

    const purchase = upgradeCandidates.find((candidate) => {
        if (score < candidate.discountedCost) return false;
        if (merchantMode === 'save') {
            return (score - candidate.discountedCost) >= reserve || candidate.type === 'hp';
        }
        return true;
    }) || null;

    return {
        shouldBuySupply,
        reserve,
        upgradeCandidates,
        purchase
    };
}
