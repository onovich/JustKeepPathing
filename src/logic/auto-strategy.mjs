export const DEFAULT_AUTO_STRATEGY = Object.freeze({
    risk: 'balanced',
    rest: 'balanced',
    merchant: 'power',
    supply: 'balanced'
});

const SUPPLY_TYPES = Object.freeze(['assault', 'salvage', 'scout']);
const VALID_STRATEGY_VALUES = Object.freeze({
    risk: Object.freeze(['cautious', 'balanced', 'greedy']),
    rest: Object.freeze(['emergency', 'balanced', 'prefer']),
    merchant: Object.freeze(['power', 'supplies', 'save']),
    supply: Object.freeze(['balanced', 'combat', 'loot', 'explore'])
});

export function sanitizeAutoStrategy(raw) {
    const next = raw && typeof raw === 'object' ? raw : {};
    return {
        risk: VALID_STRATEGY_VALUES.risk.includes(next.risk) ? next.risk : DEFAULT_AUTO_STRATEGY.risk,
        rest: VALID_STRATEGY_VALUES.rest.includes(next.rest) ? next.rest : DEFAULT_AUTO_STRATEGY.rest,
        merchant: VALID_STRATEGY_VALUES.merchant.includes(next.merchant) ? next.merchant : DEFAULT_AUTO_STRATEGY.merchant,
        supply: VALID_STRATEGY_VALUES.supply.includes(next.supply) ? next.supply : DEFAULT_AUTO_STRATEGY.supply
    };
}

export function getStrategyDiversionThreshold(strategy, baseThreshold) {
    const clean = sanitizeAutoStrategy(strategy);
    if (clean.risk === 'cautious') return Math.min(0.78, baseThreshold + 0.07);
    if (clean.risk === 'greedy') return Math.max(0.34, baseThreshold - 0.06);
    return baseThreshold;
}

export function getPreferredSupplyType(strategy, archetypeKey = 'combat') {
    const clean = sanitizeAutoStrategy(strategy);
    if (clean.supply === 'combat') return 'assault';
    if (clean.supply === 'loot') return 'salvage';
    if (clean.supply === 'explore') return 'scout';
    if (archetypeKey === 'treasure' || archetypeKey === 'rest' || archetypeKey === 'merchant') return 'salvage';
    if (archetypeKey === 'event') return 'scout';
    return 'assault';
}

export function getSupplyPriority(strategy, archetypeKey = 'combat') {
    const preferred = getPreferredSupplyType(strategy, archetypeKey);
    if (preferred === 'assault') return ['assault', 'scout', 'salvage'];
    if (preferred === 'salvage') return ['salvage', 'scout', 'assault'];
    return ['scout', 'salvage', 'assault'];
}

function getSupplyCount(supplies = {}, type) {
    return Math.max(0, supplies[type] || 0);
}

export function getMostNeededSupplyType({
    strategy,
    supplies = {},
    archetypeKey = 'combat'
} = {}) {
    const priority = getSupplyPriority(strategy, archetypeKey);
    return [...priority].sort((a, b) => {
        const countDiff = getSupplyCount(supplies, a) - getSupplyCount(supplies, b);
        if (countDiff !== 0) return countDiff;
        return priority.indexOf(a) - priority.indexOf(b);
    })[0];
}

export function getTotalSupplyCount(supplies = {}) {
    return SUPPLY_TYPES.reduce((sum, type) => sum + getSupplyCount(supplies, type), 0);
}

export function buildSupportRoomNeedState({
    strategy,
    supplies = {},
    floorBuff = {},
    archetypeKey = 'combat'
} = {}) {
    const preferredType = getPreferredSupplyType(strategy, archetypeKey);
    const preferredCount = getSupplyCount(supplies, preferredType);
    const neededType = getMostNeededSupplyType({ strategy, supplies, archetypeKey });
    const neededCount = getSupplyCount(supplies, neededType);
    const totalSupply = getTotalSupplyCount(supplies);
    const supplyActive = !!floorBuff?.supplyActive;
    const totalScarcity = totalSupply <= 0
        ? 1
        : totalSupply === 1
            ? 0.74
            : totalSupply === 2
                ? 0.42
                : totalSupply === 3
                    ? 0.18
                    : 0;
    const neededScarcity = neededCount <= 0
        ? 1
        : neededCount === 1
            ? 0.55
            : neededCount === 2
                ? 0.22
                : 0;
    const shortfallSeverity = Math.min(1, totalScarcity * 0.62 + neededScarcity * 0.52);
    const restockUrgency = Math.min(
        1,
        shortfallSeverity + (supplyActive ? 0.16 : 0) + (neededCount <= 0 ? 0.12 : 0)
    );
    const reservePressure = Math.min(
        1,
        shortfallSeverity * 0.72
            + (supplyActive ? 0.18 : 0)
            + (preferredCount <= 0 ? 0.14 : 0)
            + (totalSupply <= 1 ? 0.12 : totalSupply === 2 ? 0.05 : 0)
    );
    return {
        archetypeKey,
        preferredType,
        preferredCount,
        neededType,
        neededCount,
        totalSupply,
        supplyActive,
        usedSupplyThisFloor: supplyActive,
        preferredMissing: preferredCount <= 0,
        missingPreferred: neededCount <= 0,
        shortfallSeverity,
        restockUrgency,
        reservePressure
    };
}

export function buildMerchantBudgetState({
    score = 0,
    supplyType = 'salvage',
    discount = 0.8,
    upgradeCosts = {},
    supplyCost = 0,
    isMazeSizeMaxed = false
} = {}) {
    const candidateTypes = ['atk', 'hp', 'chest', 'size'].filter((type) => type !== 'size' || !isMazeSizeMaxed);
    const upgradeQuotes = candidateTypes.map((type) => {
        const baseCost = Math.max(0, Number(upgradeCosts[type]) || 0);
        return {
            type,
            baseCost,
            discountedCost: Math.max(1, Math.floor(baseCost * discount))
        };
    });
    const cheapestUpgrade = upgradeQuotes.reduce((best, quote) => {
        if (!best || quote.discountedCost < best.discountedCost) return quote;
        return best;
    }, null);
    const supplyDiscount = Math.max(0.68, discount - 0.08);
    const discountedSupplyCost = Math.max(18, Math.floor(Math.max(0, Number(supplyCost) || 0) * supplyDiscount));
    const cheapestUpgradeCost = cheapestUpgrade?.discountedCost || Infinity;
    const upgradeBudgetRatio = Number.isFinite(cheapestUpgradeCost)
        ? score / Math.max(1, cheapestUpgradeCost)
        : 0;
    const supplyBudgetRatio = score / Math.max(1, discountedSupplyCost);
    return {
        supplyType,
        discountedSupplyCost,
        supplyBudgetRatio,
        canAffordSupply: score >= discountedSupplyCost,
        nearAffordSupply: score >= discountedSupplyCost * 0.82,
        cheapestUpgrade,
        cheapestUpgradeCost,
        upgradeBudgetRatio,
        canAffordUpgrade: Number.isFinite(cheapestUpgradeCost) ? score >= cheapestUpgradeCost : false,
        nearAffordUpgrade: Number.isFinite(cheapestUpgradeCost) ? score >= cheapestUpgradeCost * 0.84 : false,
        upgradeQuotes
    };
}
