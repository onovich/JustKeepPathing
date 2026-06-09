import assert from 'node:assert/strict';
import {
    buildEventStockpileSupplyPlan,
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

console.log('room-reward-plans checks passed');
