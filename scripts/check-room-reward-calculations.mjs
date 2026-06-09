import assert from 'node:assert/strict';
import {
    calculateEliteRoomClearRewards,
    calculateEventRoomRewards,
    calculateMerchantRoomRewards,
    calculateRestRoomRewards,
    calculateTrialRoomRewards
} from '../src/logic/room-reward-calculations.mjs';

function expectClose(actual, expected, message) {
    assert.equal(Number(actual.toFixed(6)), Number(expected.toFixed(6)), message);
}

const rewardProfile = {
    chestBonus: 2,
    scoreMult: 1.4,
    repairValue: 0.2
};

const eventRewards = calculateEventRoomRewards({
    level: 3,
    rewardTier: 2,
    rewardProfile,
    eventSeed: { rewardMult: 1.25 },
    eventCharge: 2,
    playerBaseHp: 100
});

assert.equal(eventRewards.chargeCount, 2, 'event charge should be clamped to at least one');
assert.equal(eventRewards.baseReward, 683, 'event base reward should preserve the current formula');
assert.equal(eventRewards.healOrShieldHeal, 45, 'event heal-or-shield heal should preserve the current formula');
assert.equal(eventRewards.repairAndGuardHeal, 34, 'event repair-and-guard heal should preserve the current formula');
expectClose(eventRewards.repairAndGuardReduction, 0.1492, 'event repair-and-guard reduction should preserve the current formula');
assert.equal(eventRewards.powerAtkBoost, 6, 'event power-up attack boost should preserve charge scaling');
assert.equal(eventRewards.powerHpLoss, 8, 'event power-up HP loss should preserve base HP scaling');
assert.equal(eventRewards.stockpileScore, 560, 'event stockpile score should preserve charge-count multiplier');
assert.equal(eventRewards.monsterAtkBoost, 4, 'event monster-density attack boost should preserve charge scaling');
assert.equal(eventRewards.unstableReward, 805, 'event unstable reward should preserve multiplier');
expectClose(eventRewards.echoEngineAttackBonus, 0.1328, 'Echo Engine event bonus should preserve current formula');

const restRewards = calculateRestRoomRewards({
    level: 4,
    rewardTier: 3,
    rewardProfile,
    playerBaseHp: 120,
    shouldFortify: true,
    reservePressure: 0.5
});

assert.equal(restRewards.scoreReward, 520, 'rest room score reward should preserve current formula');
assert.equal(restRewards.heal, 44, 'rest room heal should preserve fortify scaling');
expectClose(restRewards.guardReduction, 0.165, 'rest room guard reduction should preserve reserve pressure scaling');
assert.equal(restRewards.attackBoost, 3, 'rest room fallback attack boost should preserve reward tier scaling');
assert.equal(restRewards.fallbackScoreReward, 416, 'rest room fallback score should preserve multiplier');

assert.deepEqual(
    calculateMerchantRoomRewards({
        level: 5,
        rewardTier: 3,
        rewardProfile
    }),
    {
        discount: 0.71,
        consolation: 161,
        failedDealFallback: 127,
        intelHiddenRoomBonus: 0.05
    },
    'merchant room economy should preserve discount and fallback formulas'
);

const trialRewards = calculateTrialRoomRewards({
    level: 4,
    rewardTier: 3,
    rewardProfile,
    trialSeed: { rewardMult: 1.1 },
    trialCharge: 3,
    hpRatio: 0.75,
    playerBaseHp: 120
});

assert.equal(trialRewards.chargeCount, 3, 'trial charge should be clamped to at least one');
assert.equal(trialRewards.supplyThreshold, 2, 'trial supply threshold should preserve current formula');
assert.equal(trialRewards.bonusReward, 1332, 'trial bonus reward should preserve current formula');
assert.equal(trialRewards.repairLoopHeal, 26, 'trial repair-loop heal should preserve current formula');
assert.equal(trialRewards.guardCacheHeal, 18, 'trial guard-cache heal should preserve current formula');
expectClose(trialRewards.guardCacheReduction, 0.15, 'trial guard-cache reduction should preserve current formula');
expectClose(trialRewards.surveyScoutBonus, 0.116, 'trial survey scout bonus should preserve current formula');
assert.equal(trialRewards.attackBoost, 7, 'trial attack-overdrive attack boost should preserve charge scaling');
expectClose(trialRewards.attackBonus, 0.155, 'trial attack-overdrive next-floor bonus should preserve current formula');
expectClose(trialRewards.fallbackScoutBonus, 0.06, 'trial fallback scout bonus should preserve current formula');

assert.deepEqual(
    calculateEliteRoomClearRewards({
        level: 6,
        rewardProfile,
        playerBaseHp: 120
    }),
    {
        bonusReward: 1411,
        repair: 10
    },
    'elite room clear reward should preserve current formula'
);

console.log('room-reward-calculations checks passed');
