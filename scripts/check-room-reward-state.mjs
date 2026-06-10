import assert from 'node:assert/strict';
import {
    applyRoomRewardActions,
    buildEventRoomRewardStatePlan,
    buildMerchantRoomRewardStatePlan,
    buildRestRoomRewardDecision,
    buildRestRoomRewardStatePlan,
    buildTrialRoomRewardStatePlan
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
    const plan = buildEventRoomRewardStatePlan({
        roomName: 'Event Room',
        eventSeed: { effect: 'heal_or_shield', label: 'Heal Seed' },
        eventRewards: {
            chargeCount: 1,
            healOrShieldHeal: 12,
            healOrShieldScore: 90
        },
        playerCurrentHp: 84,
        playerBaseHp: 100,
        supplyLabels: { salvage: 'Salvage Supply' }
    });

    assert.equal(plan.message, 'Heal Seed restored 12 HP and added 1 Salvage Supply.');
    assert.deepEqual(plan.actions, [
        { type: 'heal-player', amount: 12 },
        { type: 'score', amount: 90 },
        { type: 'grant-floor-supply', supplyType: 'salvage', amount: 1 }
    ]);

    const state = {
        score: 0,
        player: { baseHp: 100, currentHp: 84, baseAtk: 20 },
        maze: { baseChestRate: 0.05, baseMonsterRate: 0.03 },
        meta: { nextHiddenRoomBonus: 0, nextFloorAttackBonus: 0 },
        floorBuff: { incomingDamageMult: 1 },
        items: { supplies: { salvage: 0 } }
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

    assert.equal(state.score, 90);
    assert.equal(state.player.currentHp, 96);
    assert.equal(state.items.supplies.salvage, 1);
}

{
    const plan = buildEventRoomRewardStatePlan({
        roomName: 'Guard Event',
        eventSeed: { effect: 'repair_and_guard', label: 'Repair Guard' },
        eventRewards: {
            chargeCount: 2,
            repairAndGuardHeal: 18,
            repairAndGuardReduction: 0.12,
            repairAndGuardScore: 140
        },
        playerCurrentHp: 60,
        playerBaseHp: 100,
        supplyNeedState: { neededType: 'scout' },
        supplyLabels: { scout: 'Scout Supply' }
    });

    assert.equal(
        plan.message,
        'Repair Guard repaired for 18 HP, reduced incoming damage, and added 1 Scout Supply.'
    );
    assert.deepEqual(plan.actions, [
        { type: 'heal-player', amount: 18 },
        { type: 'multiply-incoming-damage', factor: 0.88 },
        { type: 'score', amount: 140 },
        { type: 'grant-floor-supply', supplyType: 'scout', amount: 1 }
    ]);
}

{
    const plan = buildEventRoomRewardStatePlan({
        roomName: 'Power Event',
        eventSeed: { effect: 'power_up_with_penalty', label: 'Power Seed' },
        eventRewards: {
            powerAtkBoost: 5,
            powerHpLoss: 8,
            powerScore: 130
        },
        playerCurrentHp: 4,
        playerBaseHp: 100
    });

    assert.equal(plan.message, 'Power Seed overclocked attack by +5 and lost 8 HP.');
    assert.deepEqual(plan.actions, [
        { type: 'increase-player-attack', amount: 5 },
        { type: 'damage-player', amount: 8 },
        { type: 'score', amount: 130 }
    ]);

    const state = {
        score: 0,
        player: { baseHp: 100, currentHp: 4, baseAtk: 20 },
        maze: { baseChestRate: 0.05, baseMonsterRate: 0.03 },
        meta: { nextHiddenRoomBonus: 0, nextFloorAttackBonus: 0 },
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

    assert.equal(state.player.baseAtk, 25);
    assert.equal(state.player.currentHp, 1, 'event penalty damage should not defeat the player');
    assert.equal(state.score, 130);
}

{
    const plan = buildEventRoomRewardStatePlan({
        roomName: 'Stockpile Event',
        eventSeed: { effect: 'supply_stockpile', label: 'Stockpile Seed' },
        eventRewards: {
            chargeCount: 2,
            stockpileScore: 75
        },
        supplyNeedState: { neededType: 'scout' },
        supplyPriority: ['salvage', 'assault'],
        supplyLabels: {
            scout: 'Scout Supply',
            salvage: 'Salvage Supply'
        }
    });

    assert.equal(plan.message, 'Stockpile Seed granted 1 Scout Supply and 1 Salvage Supply.');
    assert.deepEqual(plan.actions, [
        { type: 'grant-floor-supply', supplyType: 'scout', amount: 1 },
        { type: 'grant-floor-supply', supplyType: 'salvage', amount: 1 },
        { type: 'score', amount: 75 }
    ]);
}

{
    const plan = buildEventRoomRewardStatePlan({
        roomName: 'Unstable Event',
        eventSeed: { effect: 'unknown_effect', label: 'Unstable Seed' },
        eventRewards: {
            unstableReward: 188,
            unstableMonsterBoost: 0.012,
            echoEngineAttackBonus: 0.13
        },
        hasEchoEngine: true,
        currentNextFloorAttackBonus: 0.24
    });

    assert.equal(
        plan.message,
        'Unstable Seed granted 188 score and increased enemy density. Echo Engine preheated next-floor attack by 13%.'
    );
    assert.deepEqual(plan.actions, [
        { type: 'increase-monster-rate', amount: 0.012 },
        { type: 'score', amount: 188 },
        { type: 'set-next-floor-attack-bonus', value: 0.32 }
    ]);

    const state = {
        score: 0,
        player: { baseHp: 100, currentHp: 100, baseAtk: 20 },
        maze: { baseChestRate: 0.05, baseMonsterRate: 0.03 },
        meta: { nextHiddenRoomBonus: 0, nextFloorAttackBonus: 0.24 },
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

    assert.equal(Number(state.maze.baseMonsterRate.toFixed(3)), 0.042);
    assert.equal(state.score, 188);
    assert.equal(state.meta.nextFloorAttackBonus, 0.32);
}

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

{
    const plan = buildTrialRoomRewardStatePlan({
        roomName: 'Repair Trial',
        trialSeed: { effect: 'repair_loop', label: 'Repair Loop' },
        trialRewards: {
            chargeCount: 1,
            supplyThreshold: 2,
            bonusReward: 300,
            repairLoopHeal: 24
        }
    });

    assert.equal(plan.trialBonusSupply, null);
    assert.equal(plan.message, 'Repair Loop completed the trial and granted 300 score. Restored 24 HP.');
    assert.deepEqual(plan.actions, [
        { type: 'score', amount: 300 },
        { type: 'heal-player', amount: 24 },
        { type: 'set-room-field', field: 'trialBonusSupply', value: null }
    ]);

    const room = { trialBonusSupply: 'assault' };
    const state = {
        score: 0,
        player: { baseHp: 100, currentHp: 90, baseAtk: 20 },
        maze: { baseChestRate: 0.05 },
        meta: { nextHiddenRoomBonus: 0, nextFloorAttackBonus: 0 },
        floorBuff: { incomingDamageMult: 1 },
        items: { supplies: {} }
    };
    applyRoomRewardActions({
        gameState: state,
        room,
        actions: plan.actions,
        addScore: (amount) => {
            state.score += amount;
        }
    });

    assert.equal(state.score, 300);
    assert.equal(state.player.currentHp, 100);
    assert.equal(room.trialBonusSupply, null);
}

{
    const plan = buildTrialRoomRewardStatePlan({
        roomName: 'Guard Trial',
        trialSeed: { effect: 'guard_cache', label: 'Guard Cache' },
        trialRewards: {
            chargeCount: 2,
            supplyThreshold: 2,
            bonusReward: 420,
            guardCacheHeal: 18,
            guardCacheReduction: 0.15
        },
        rewardTier: 2,
        neededType: 'scout',
        mostNeededType: 'salvage',
        supplyLabels: { scout: 'Scout Supply' }
    });

    assert.equal(plan.trialBonusSupply, 'scout');
    assert.equal(
        plan.message,
        'Guard Cache completed the trial and granted 420 score. Restored 18 HP, reduced incoming damage, and added 1 Scout Supply.'
    );
    assert.deepEqual(plan.actions, [
        { type: 'score', amount: 420 },
        { type: 'heal-player', amount: 18 },
        { type: 'multiply-incoming-damage', factor: 0.85 },
        { type: 'grant-floor-supply', supplyType: 'scout', amount: 1 },
        { type: 'set-room-field', field: 'trialBonusSupply', value: 'scout' }
    ]);

    const room = {};
    const state = {
        score: 0,
        player: { baseHp: 100, currentHp: 70, baseAtk: 20 },
        maze: { baseChestRate: 0.05 },
        meta: { nextHiddenRoomBonus: 0, nextFloorAttackBonus: 0 },
        floorBuff: { incomingDamageMult: 0.8 },
        items: { supplies: { scout: 0 } }
    };
    applyRoomRewardActions({
        gameState: state,
        room,
        actions: plan.actions,
        addScore: (amount) => {
            state.score += amount;
        },
        grantFloorSupply: (type, amount) => {
            state.items.supplies[type] = (state.items.supplies[type] || 0) + amount;
        }
    });

    assert.equal(state.score, 420);
    assert.equal(state.player.currentHp, 88);
    assert.equal(Number(state.floorBuff.incomingDamageMult.toFixed(2)), 0.68);
    assert.equal(state.items.supplies.scout, 1);
    assert.equal(room.trialBonusSupply, 'scout');
}

{
    const plan = buildTrialRoomRewardStatePlan({
        roomName: 'Survey Trial',
        trialSeed: { effect: 'survey', label: 'Survey Seed' },
        trialRewards: {
            chargeCount: 1,
            supplyThreshold: 2,
            bonusReward: 210,
            surveyScoutBonus: 0.11
        }
    });

    assert.equal(plan.message, 'Survey Seed completed the trial and granted 210 score. Boosted next-floor hidden room scouting.');
    assert.deepEqual(plan.actions, [
        { type: 'score', amount: 210 },
        { type: 'increase-next-hidden-room-bonus', amount: 0.11, cap: 0.28 },
        { type: 'set-room-field', field: 'trialBonusSupply', value: null }
    ]);

    const state = {
        score: 0,
        player: { baseHp: 100, currentHp: 100, baseAtk: 20 },
        maze: { baseChestRate: 0.05 },
        meta: { nextHiddenRoomBonus: 0.24, nextFloorAttackBonus: 0 },
        floorBuff: { incomingDamageMult: 1 },
        items: { supplies: {} }
    };
    applyRoomRewardActions({
        gameState: state,
        room: {},
        actions: plan.actions,
        addScore: (amount) => {
            state.score += amount;
        }
    });
    assert.equal(state.meta.nextHiddenRoomBonus, 0.28);
}

{
    const plan = buildTrialRoomRewardStatePlan({
        roomName: 'Overdrive Trial',
        trialSeed: { effect: 'attack_overdrive', label: 'Overdrive Seed' },
        trialRewards: {
            chargeCount: 3,
            supplyThreshold: 2,
            bonusReward: 684,
            attackBoost: 7,
            attackBonus: 0.135
        },
        rewardTier: 3,
        neededType: 'scout',
        mostNeededType: 'salvage',
        supplyLabels: { assault: 'Assault Supply' }
    });

    assert.equal(plan.trialBonusSupply, 'assault');
    assert.equal(
        plan.message,
        'Overdrive Seed completed the trial and granted 684 score. Attack +7, next-floor attack +14%, and added 1 Assault Supply.'
    );
    assert.deepEqual(plan.actions, [
        { type: 'score', amount: 684 },
        { type: 'increase-player-attack', amount: 7 },
        { type: 'increase-next-floor-attack-bonus', amount: 0.135, cap: 0.4 },
        { type: 'grant-floor-supply', supplyType: 'assault', amount: 1 },
        { type: 'set-room-field', field: 'trialBonusSupply', value: 'assault' }
    ]);

    const state = {
        score: 0,
        player: { baseHp: 100, currentHp: 100, baseAtk: 20 },
        maze: { baseChestRate: 0.05 },
        meta: { nextHiddenRoomBonus: 0, nextFloorAttackBonus: 0.3 },
        floorBuff: { incomingDamageMult: 1 },
        items: { supplies: { assault: 0 } }
    };
    applyRoomRewardActions({
        gameState: state,
        room: {},
        actions: plan.actions,
        addScore: (amount) => {
            state.score += amount;
        },
        grantFloorSupply: (type, amount) => {
            state.items.supplies[type] = (state.items.supplies[type] || 0) + amount;
        }
    });
    assert.equal(state.player.baseAtk, 27);
    assert.equal(state.meta.nextFloorAttackBonus, 0.4);
    assert.equal(state.items.supplies.assault, 1);
}

{
    const plan = buildTrialRoomRewardStatePlan({
        roomName: 'Cache Trial',
        trialSeed: { effect: 'salvage_cache', label: 'Cache Seed' },
        trialRewards: {
            chargeCount: 2,
            supplyThreshold: 2,
            bonusReward: 260
        },
        rewardTier: 1,
        neededType: 'scout',
        mostNeededType: 'assault',
        supplyLabels: { salvage: 'Salvage Supply' }
    });

    assert.equal(plan.trialBonusSupply, 'salvage');
    assert.equal(plan.message, 'Cache Seed completed the trial and granted 260 score. Added 1 Salvage Supply.');
    assert.deepEqual(plan.actions, [
        { type: 'score', amount: 260 },
        { type: 'grant-floor-supply', supplyType: 'salvage', amount: 1 },
        { type: 'set-room-field', field: 'trialBonusSupply', value: 'salvage' }
    ]);
}

{
    const plan = buildTrialRoomRewardStatePlan({
        roomName: 'Fallback Trial',
        trialSeed: { effect: 'minor', label: 'Fallback Seed' },
        trialRewards: {
            chargeCount: 1,
            supplyThreshold: 2,
            bonusReward: 120,
            fallbackScoutBonus: 0.08
        }
    });

    assert.equal(plan.trialBonusSupply, null);
    assert.equal(plan.message, 'Fallback Seed completed the trial and granted 120 score. Added a small next-floor scouting bonus.');
    assert.deepEqual(plan.actions, [
        { type: 'score', amount: 120 },
        { type: 'increase-next-hidden-room-bonus', amount: 0.08, cap: 0.24 },
        { type: 'set-room-field', field: 'trialBonusSupply', value: null }
    ]);
}

console.log('room-reward-state checks passed');
