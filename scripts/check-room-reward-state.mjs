import assert from 'node:assert/strict';
import {
    applyRoomRewardActions,
    buildMerchantRoomRewardStatePlan,
    buildRestRoomRewardDecision,
    buildRestRoomRewardStatePlan
} from '../src/logic/room-reward-state.mjs';

assert.deepEqual(
    buildRestRoomRewardDecision({
        hpRatio: 0.67,
        supplyNeedState: {
            restockUrgency: 0.1,
            missingPreferred: false,
            preferredMissing: false,
            usedSupplyThisFloor: false,
            supplyActive: true,
            reservePressure: 0,
            totalSupply: 4,
            shortfallSeverity: 0
        }
    }),
    {
        shouldRestockSupply: false,
        shouldFortify: true
    },
    'low HP should trigger rest-room fortify without forcing restock'
);

assert.deepEqual(
    buildRestRoomRewardDecision({
        hpRatio: 0.95,
        supplyNeedState: {
            restockUrgency: 0.44,
            missingPreferred: false,
            preferredMissing: false,
            usedSupplyThisFloor: false,
            supplyActive: true,
            reservePressure: 0,
            totalSupply: 3,
            shortfallSeverity: 0.1
        }
    }),
    {
        shouldRestockSupply: true,
        shouldFortify: false
    },
    'restock urgency threshold should preserve current rest-room supply behavior'
);

{
    const plan = buildRestRoomRewardStatePlan({
        roomName: 'Smoke Rest Room',
        hpRatio: 0.62,
        supplyNeedState: {
            neededType: 'scout',
            restockUrgency: 0.9,
            missingPreferred: false,
            preferredMissing: true,
            usedSupplyThisFloor: true,
            supplyActive: true,
            reservePressure: 0.6,
            totalSupply: 0,
            shortfallSeverity: 0.8
        },
        neededSupply: 'scout',
        supplyLabel: 'Scout Supply',
        restRewards: {
            heal: 34,
            scoreReward: 270,
            guardReduction: 0.14
        }
    });

    assert.equal(plan.shouldFortify, true);
    assert.equal(plan.shouldRestockSupply, true);
    assert.equal(
        plan.message,
        'Smoke Rest Room restored 34 HP and granted 270 score. Incoming damage was reduced for the rest of the floor. Added 1 Scout Supply.'
    );
    assert.deepEqual(plan.actions, [
        { type: 'heal-player', amount: 34 },
        { type: 'score', amount: 270 },
        { type: 'multiply-incoming-damage', factor: 0.86 },
        { type: 'grant-floor-supply', supplyType: 'scout', amount: 1 }
    ]);

    const state = {
        score: 10,
        player: { baseHp: 100, currentHp: 80, baseAtk: 12 },
        maze: { baseChestRate: 0.05 },
        floorBuff: { incomingDamageMult: 0.9 },
        items: { supplies: { scout: 1 } }
    };
    applyRoomRewardActions({
        gameState: state,
        actions: plan.actions,
        addScore: (amount) => {
            state.score += amount;
        },
        grantFloorSupply: (type, amount) => {
            state.items.supplies[type] = (state.items.supplies[type] || 0) + amount;
        }
    });

    assert.equal(state.score, 280);
    assert.equal(state.player.currentHp, 100, 'healing should cap at base HP');
    assert.equal(Number(state.floorBuff.incomingDamageMult.toFixed(3)), 0.774);
    assert.equal(state.items.supplies.scout, 2);
}

{
    const plan = buildRestRoomRewardStatePlan({
        roomName: 'Quiet Rest Room',
        hpRatio: 0.96,
        supplyNeedState: {
            neededType: 'salvage',
            restockUrgency: 0.1,
            missingPreferred: false,
            preferredMissing: false,
            usedSupplyThisFloor: false,
            supplyActive: true,
            reservePressure: 0.1,
            totalSupply: 5,
            shortfallSeverity: 0.1
        },
        neededSupply: 'salvage',
        supplyLabel: 'Salvage Supply',
        restRewards: {
            attackBoost: 3,
            chestBoost: 0.012,
            fallbackScoreReward: 190
        }
    });

    assert.equal(plan.shouldFortify, false);
    assert.equal(plan.shouldRestockSupply, false);
    assert.equal(
        plan.message,
        'Quiet Rest Room improved attack by 3 and slightly raised chest density.'
    );
    assert.deepEqual(plan.actions, [
        { type: 'increase-player-attack', amount: 3 },
        { type: 'increase-chest-rate', amount: 0.012 },
        { type: 'score', amount: 190 }
    ]);

    const state = {
        score: 5,
        player: { baseHp: 100, currentHp: 96, baseAtk: 20 },
        maze: { baseChestRate: 0.05 },
        floorBuff: { incomingDamageMult: 1 },
        items: { supplies: { salvage: 0 } }
    };
    applyRoomRewardActions({
        gameState: state,
        actions: plan.actions,
        addScore: (amount) => {
            state.score += amount;
        }
    });

    assert.equal(state.player.baseAtk, 23);
    assert.equal(Number(state.maze.baseChestRate.toFixed(3)), 0.062);
    assert.equal(state.score, 195);
    assert.equal(state.items.supplies.salvage, 0);
}

{
    const plan = buildMerchantRoomRewardStatePlan({
        roomName: 'Smoke Merchant',
        merchantPlan: { shouldBuySupply: true },
        merchantRewards: {},
        neededSupply: 'salvage',
        neededSupplyLabel: 'Salvage Supply',
        supplyPrice: 64
    });

    assert.deepEqual(plan, {
        outcome: 'supply',
        actions: [
            { type: 'spend-score', amount: 64 },
            { type: 'grant-floor-supply', supplyType: 'salvage', amount: 1 }
        ],
        message: 'Smoke Merchant bought 1 Salvage Supply for 64 score.'
    });

    const state = {
        score: 100,
        player: { baseHp: 100, currentHp: 100, baseAtk: 20 },
        maze: { baseChestRate: 0.05 },
        meta: { nextHiddenRoomBonus: 0 },
        floorBuff: { incomingDamageMult: 1 },
        items: { supplies: { salvage: 0 } }
    };
    applyRoomRewardActions({
        gameState: state,
        actions: plan.actions,
        grantFloorSupply: (type, amount) => {
            state.items.supplies[type] = (state.items.supplies[type] || 0) + amount;
        }
    });

    assert.equal(state.score, 36);
    assert.equal(state.items.supplies.salvage, 1);
}

{
    const plan = buildMerchantRoomRewardStatePlan({
        roomName: 'Intel Merchant',
        merchantPlan: { shouldBuySupply: false, purchase: null },
        merchantRewards: {
            consolation: 161,
            intelHiddenRoomBonus: 0.05,
            failedDealFallback: 127
        },
        supplyNeedState: {
            shortfallSeverity: 0.5
        }
    });

    assert.equal(plan.outcome, 'intel');
    assert.deepEqual(plan.actions, [
        { type: 'score', amount: 161 },
        { type: 'increase-next-hidden-room-bonus', amount: 0.060000000000000005, cap: 0.24 }
    ]);
    assert.equal(
        plan.message,
        'Intel Merchant found no good deal, took intel instead, and improved next-floor hidden room odds.'
    );

    const state = {
        score: 10,
        player: { baseHp: 100, currentHp: 100, baseAtk: 20 },
        maze: { baseChestRate: 0.05 },
        meta: { nextHiddenRoomBonus: 0.2 },
        floorBuff: { incomingDamageMult: 1 },
        items: { supplies: {} }
    };
    applyRoomRewardActions({
        gameState: state,
        actions: plan.actions,
        addScore: (amount) => {
            state.score += amount;
        }
    });

    assert.equal(state.score, 171);
    assert.equal(state.meta.nextHiddenRoomBonus, 0.24, 'merchant intel bonus should preserve the existing cap');
}

{
    const plan = buildMerchantRoomRewardStatePlan({
        roomName: 'Upgrade Merchant',
        merchantPlan: {
            shouldBuySupply: false,
            purchase: {
                type: 'atk',
                baseCost: 100,
                discountedCost: 71
            }
        },
        merchantRewards: {
            failedDealFallback: 127
        }
    });

    assert.equal(plan.outcome, 'upgrade');
    assert.deepEqual(plan.actions, [
        { type: 'buy-upgrade', upgradeType: 'atk', rebate: 29, failedScore: 127 }
    ]);
    assert.equal(plan.message, 'Upgrade Merchant auto-purchased attack upgrade for 71 score.');
    assert.equal(plan.failureMessage, 'Upgrade Merchant converted the failed deal into 127 score.');

    const state = {
        score: 120,
        player: { baseHp: 100, currentHp: 100, baseAtk: 20 },
        maze: { baseChestRate: 0.05 },
        meta: { nextHiddenRoomBonus: 0 },
        floorBuff: { incomingDamageMult: 1 },
        items: { supplies: {} }
    };
    const actionResult = applyRoomRewardActions({
        gameState: state,
        actions: plan.actions,
        buyUpgrade: (type) => {
            assert.equal(type, 'atk');
            state.score -= 100;
            state.player.baseAtk += 1;
            return true;
        }
    });

    assert.deepEqual(actionResult.results, [
        { type: 'buy-upgrade', upgradeType: 'atk', bought: true }
    ]);
    assert.equal(state.score, 49, 'rebate should restore the discount after the normal upgrade purchase');
    assert.equal(state.player.baseAtk, 21);
}

{
    const plan = buildMerchantRoomRewardStatePlan({
        roomName: 'Failed Merchant',
        merchantPlan: {
            shouldBuySupply: false,
            purchase: {
                type: 'size',
                baseCost: 120,
                discountedCost: 90
            }
        },
        merchantRewards: {
            failedDealFallback: 88
        }
    });
    const state = {
        score: 20,
        player: { baseHp: 100, currentHp: 100, baseAtk: 20 },
        maze: { baseChestRate: 0.05 },
        meta: { nextHiddenRoomBonus: 0 },
        floorBuff: { incomingDamageMult: 1 },
        items: { supplies: {} }
    };
    const actionResult = applyRoomRewardActions({
        gameState: state,
        actions: plan.actions,
        addScore: (amount) => {
            state.score += amount;
        },
        buyUpgrade: () => false
    });

    assert.deepEqual(actionResult.results, [
        { type: 'buy-upgrade', upgradeType: 'size', bought: false }
    ]);
    assert.equal(state.score, 108);
}

console.log('room-reward-state checks passed');
