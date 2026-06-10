import assert from 'node:assert/strict';
import {
    buildEventStockpileSupplyPlan,
    buildMerchantRoomPurchasePlan,
    buildRunRelicRewardRollPlan,
    buildTrialSupplyRewardPlan
} from '../src/logic/room-reward-plans.mjs';

assert.deepEqual(
    buildEventStockpileSupplyPlan({
        firstSupply: 'scout',
        priority: ['scout', 'salvage', 'assault'],
        chargeCount: 1
    }),
    {
        supplies: [{ type: 'scout', amount: 1 }],
        primary: 'scout',
        secondary: 'salvage',
        grantsSecondSupply: false
    },
    'event stockpile should grant only the primary supply at one charge'
);

assert.deepEqual(
    buildEventStockpileSupplyPlan({
        firstSupply: 'scout',
        priority: ['scout', 'salvage', 'assault'],
        chargeCount: 2
    }),
    {
        supplies: [
            { type: 'scout', amount: 1 },
            { type: 'salvage', amount: 1 }
        ],
        primary: 'scout',
        secondary: 'salvage',
        grantsSecondSupply: true
    },
    'event stockpile should grant the next priority supply at two charges'
);

assert.deepEqual(
    buildTrialSupplyRewardPlan({
        effect: 'guard_cache',
        chargeCount: 2,
        supplyThreshold: 2,
        neededType: 'scout'
    }),
    { type: 'scout', amount: 1 },
    'guard cache should use the current trial need state'
);

assert.deepEqual(
    buildTrialSupplyRewardPlan({
        effect: 'attack_overdrive',
        chargeCount: 3,
        supplyThreshold: 2,
        neededType: 'scout'
    }),
    { type: 'assault', amount: 1 },
    'attack overdrive should grant assault supply'
);

assert.deepEqual(
    buildTrialSupplyRewardPlan({
        effect: 'salvage_cache',
        chargeCount: 2,
        supplyThreshold: 2,
        mostNeededType: 'scout'
    }),
    { type: 'salvage', amount: 1 },
    'salvage cache should force salvage supply'
);

assert.deepEqual(
    buildTrialSupplyRewardPlan({
        effect: 'unknown',
        rewardTier: 4,
        chargeCount: 3,
        supplyThreshold: 2,
        mostNeededType: 'scout'
    }),
    { type: 'assault', amount: 1 },
    'high-tier generic trials should prefer assault supply'
);

assert.equal(
    buildTrialSupplyRewardPlan({
        effect: 'guard_cache',
        chargeCount: 1,
        supplyThreshold: 2,
        neededType: 'scout'
    }),
    null,
    'trial supply plan should be empty below threshold'
);

assert.deepEqual(
    buildRunRelicRewardRollPlan({
        source: 'elite',
        themeKey: 'ember_forge',
        rewardTier: 3
    }),
    {
        shouldRoll: true,
        request: {
            source: 'elite',
            themeKey: 'ember_forge',
            rewardTier: 3,
            guaranteed: false
        },
        fallback: { status: 'miss', relic: null, bonusScore: 0 }
    },
    'elite relic roll plans should preserve source, theme, tier, and non-guaranteed default'
);

assert.deepEqual(
    buildRunRelicRewardRollPlan({
        source: 'boss',
        themeKey: 'quarantine_vault',
        rewardTier: 4,
        guaranteed: true
    }).request,
    {
        source: 'boss',
        themeKey: 'quarantine_vault',
        rewardTier: 4,
        guaranteed: true
    },
    'boss relic roll plans should preserve guaranteed finale-tier requests'
);

assert.deepEqual(
    buildRunRelicRewardRollPlan({
        enabled: false,
        source: 'boss',
        rewardTier: 3,
        guaranteed: true
    }),
    {
        shouldRoll: false,
        request: null,
        fallback: { status: 'miss', relic: null, bonusScore: 0 }
    },
    'disabled relic roll plans should return the shared miss fallback shape'
);

const merchantSupplyPlan = buildMerchantRoomPurchasePlan({
    rewardTier: 2,
    merchantMode: 'supplies',
    hpRatio: 0.9,
    maze: { lvChest: 3, lvSize: 2 },
    upgradeCosts: { atk: 100, hp: 80, chest: 70, size: 60 },
    discount: 0.76,
    budgetState: {
        canAffordSupply: true,
        cheapestUpgrade: { type: 'size' }
    },
    score: 1000,
    supplyNeedState: {
        restockUrgency: 0.4,
        totalSupply: 2,
        usedSupplyThisFloor: false,
        missingPreferred: false,
        preferredMissing: false
    }
});
assert.equal(merchantSupplyPlan.shouldBuySupply, true, 'merchant supplies mode should prioritize affordable supply restock');
assert.equal(merchantSupplyPlan.purchase.type, 'size', 'merchant upgrade plan should preserve cheapest-upgrade weight bias');

const merchantSavePlan = buildMerchantRoomPurchasePlan({
    rewardTier: 1,
    merchantMode: 'save',
    hpRatio: 0.9,
    maze: { lvChest: 1, lvSize: 3 },
    upgradeCosts: { atk: 100, hp: 80, chest: 70, size: 60 },
    discount: 0.8,
    budgetState: {
        canAffordSupply: false,
        cheapestUpgrade: { type: 'chest' }
    },
    score: 70,
    supplyNeedState: {
        restockUrgency: 0.1,
        totalSupply: 4,
        usedSupplyThisFloor: false,
        missingPreferred: false,
        preferredMissing: false
    }
});
assert.equal(merchantSavePlan.shouldBuySupply, false, 'merchant save mode should not buy unaffordable supply');
assert.equal(merchantSavePlan.reserve, 28, 'merchant save mode should preserve the current reserve formula');
assert.equal(merchantSavePlan.purchase.type, 'hp', 'merchant save mode should allow HP upgrade even when reserve blocks other picks');
assert.deepEqual(
    merchantSavePlan.upgradeCandidates.map((candidate) => candidate.type),
    ['atk', 'chest', 'size', 'hp'],
    'merchant upgrade candidates should preserve weight sorting'
);

console.log('room-reward-plans checks passed');
