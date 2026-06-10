import assert from 'node:assert/strict';
import {
    attachRunRelicRollChance,
    buildEmptyRunRelicPoolResult,
    buildRunRelicClaimResult,
    buildRunRelicMissResult,
    getRunRelicOverflowScore,
    getRunRelicRollChance,
    shouldRollRunRelicReward
} from '../src/logic/run-relic-state.mjs';

const relic = {
    id: 'echo_engine',
    label: 'Echo Engine'
};

assert.equal(getRunRelicOverflowScore({ level: 6, source: 'elite' }), 234);
assert.equal(getRunRelicOverflowScore({ level: 6, source: 'boss' }), 339);

assert.equal(getRunRelicRollChance({ source: 'elite', rewardTier: 1 }), 0.16);
assert.equal(getRunRelicRollChance({ source: 'elite', rewardTier: 99 }), 0.72);
assert.equal(getRunRelicRollChance({ source: 'boss', rewardTier: 1 }), 0.72);
assert.equal(getRunRelicRollChance({ source: 'elite', rewardTier: 1, guaranteed: true }), 1);
assert.equal(shouldRollRunRelicReward({ chance: 0.4, randomValue: 0.4 }), true);
assert.equal(shouldRollRunRelicReward({ chance: 0.4, randomValue: 0.401 }), false);

assert.deepEqual(buildRunRelicMissResult(0.32), {
    status: 'miss',
    relic: null,
    bonusScore: 0,
    chance: 0.32
});

assert.deepEqual(buildEmptyRunRelicPoolResult({
    level: 6,
    source: 'elite',
    chance: 0.72
}), {
    status: 'empty-pool',
    relic: null,
    bonusScore: 234,
    chance: 0.72
});

{
    const ownedIds = [];
    const result = buildRunRelicClaimResult({
        relic,
        ownedIds,
        slotCount: 2,
        level: 6
    });
    assert.deepEqual(result, {
        status: 'added',
        relic,
        bonusScore: 0,
        runRelics: ['echo_engine'],
        shouldDiscover: true
    });
    assert.deepEqual(ownedIds, [], 'claim should not mutate input owned IDs');
}

assert.deepEqual(buildRunRelicClaimResult({
    relic,
    ownedIds: ['echo_engine'],
    slotCount: 3,
    level: 6,
    source: 'elite'
}), {
    status: 'duplicate',
    relic,
    bonusScore: 234,
    runRelics: ['echo_engine'],
    shouldDiscover: false
});

assert.deepEqual(buildRunRelicClaimResult({
    relic,
    ownedIds: ['pathfinder_lens'],
    slotCount: 1,
    level: 6,
    source: 'boss'
}), {
    status: 'overflow',
    relic,
    bonusScore: 339,
    runRelics: ['pathfinder_lens'],
    shouldDiscover: false
});

assert.deepEqual(buildRunRelicClaimResult({
    relic: null,
    ownedIds: ['pathfinder_lens'],
    slotCount: 2,
    level: 6
}), {
    status: 'none',
    relic: null,
    bonusScore: 0,
    runRelics: ['pathfinder_lens'],
    shouldDiscover: false
});

assert.deepEqual(attachRunRelicRollChance({
    status: 'added',
    relic,
    bonusScore: 0
}, 0.5), {
    status: 'added',
    relic,
    bonusScore: 0,
    chance: 0.5
});

console.log('run-relic-state checks passed');
