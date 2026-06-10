import assert from 'node:assert/strict';
import {
    DEFAULT_AUTO_STRATEGY,
    buildMerchantBudgetState,
    buildSupportRoomNeedState,
    getMostNeededSupplyType,
    getPreferredSupplyType,
    getStrategyDiversionThreshold,
    getSupplyPriority,
    getTotalSupplyCount,
    sanitizeAutoStrategy
} from '../src/logic/auto-strategy.mjs';

assert.deepEqual(sanitizeAutoStrategy(null), DEFAULT_AUTO_STRATEGY);
assert.deepEqual(
    sanitizeAutoStrategy({
        risk: 'greedy',
        rest: 'prefer',
        merchant: 'supplies',
        supply: 'explore'
    }),
    {
        risk: 'greedy',
        rest: 'prefer',
        merchant: 'supplies',
        supply: 'explore'
    }
);
assert.deepEqual(
    sanitizeAutoStrategy({
        risk: 'reckless',
        rest: 'always',
        merchant: 'random',
        supply: 'magic'
    }),
    DEFAULT_AUTO_STRATEGY
);

assert.equal(getStrategyDiversionThreshold({ risk: 'cautious' }, 0.73), 0.78);
assert.equal(getStrategyDiversionThreshold({ risk: 'greedy' }, 0.37), 0.34);
assert.equal(getStrategyDiversionThreshold({ risk: 'balanced' }, 0.52), 0.52);

assert.equal(getPreferredSupplyType({ supply: 'combat' }, 'treasure'), 'assault');
assert.equal(getPreferredSupplyType({ supply: 'loot' }, 'combat'), 'salvage');
assert.equal(getPreferredSupplyType({ supply: 'explore' }, 'merchant'), 'scout');
assert.equal(getPreferredSupplyType({ supply: 'balanced' }, 'event'), 'scout');
assert.equal(getPreferredSupplyType({ supply: 'balanced' }, 'rest'), 'salvage');
assert.deepEqual(getSupplyPriority({ supply: 'combat' }, 'combat'), ['assault', 'scout', 'salvage']);
assert.deepEqual(getSupplyPriority({ supply: 'balanced' }, 'event'), ['scout', 'salvage', 'assault']);

const supplies = { assault: 2, salvage: 0, scout: 0 };
assert.equal(getTotalSupplyCount(supplies), 2);
assert.equal(
    getMostNeededSupplyType({
        strategy: { supply: 'balanced' },
        supplies,
        archetypeKey: 'event'
    }),
    'scout',
    'ties should follow archetype priority'
);

const emptyNeed = buildSupportRoomNeedState({
    strategy: { supply: 'balanced' },
    supplies: {},
    floorBuff: { supplyActive: true },
    archetypeKey: 'merchant'
});
assert.equal(emptyNeed.preferredType, 'salvage');
assert.equal(emptyNeed.neededType, 'salvage');
assert.equal(emptyNeed.totalSupply, 0);
assert.equal(emptyNeed.usedSupplyThisFloor, true);
assert.equal(emptyNeed.shortfallSeverity, 1);
assert.equal(emptyNeed.restockUrgency, 1);
assert.equal(emptyNeed.reservePressure, 1);

const balancedNeed = buildSupportRoomNeedState({
    strategy: { supply: 'balanced' },
    supplies: { assault: 1, salvage: 2, scout: 3 },
    floorBuff: {},
    archetypeKey: 'combat'
});
assert.equal(balancedNeed.preferredType, 'assault');
assert.equal(balancedNeed.neededType, 'assault');
assert.equal(balancedNeed.totalSupply, 6);
assert.equal(balancedNeed.shortfallSeverity < emptyNeed.shortfallSeverity, true);
assert.equal(balancedNeed.restockUrgency < emptyNeed.restockUrgency, true);

const budget = buildMerchantBudgetState({
    score: 70,
    supplyType: 'scout',
    discount: 0.8,
    supplyCost: 90,
    upgradeCosts: {
        atk: 100,
        hp: 60,
        chest: 120,
        size: 40
    },
    isMazeSizeMaxed: true
});
assert.equal(budget.supplyType, 'scout');
assert.equal(budget.discountedSupplyCost, 64);
assert.equal(budget.canAffordSupply, true);
assert.equal(budget.cheapestUpgrade.type, 'hp');
assert.equal(budget.cheapestUpgradeCost, 48);
assert.equal(budget.canAffordUpgrade, true);
assert.deepEqual(budget.upgradeQuotes.map((quote) => quote.type), ['atk', 'hp', 'chest']);

console.log('auto-strategy checks passed');
