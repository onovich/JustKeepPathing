import assert from 'node:assert/strict';
import {
    buildHiddenRoomRoutingDebug,
    calculateHiddenRoomDiversionScore
} from '../src/logic/hidden-room-routing.mjs';

function makeGameState({
    hp = 100,
    baseHp = 100,
    risk = 'balanced',
    rest = 'balanced',
    merchant = 'power',
    supplyKey = null,
    diversionBonus = 0,
    eventNeedState = { shortfallSeverity: 0 },
    merchantBudgetState = {
        canAffordUpgrade: false,
        nearAffordUpgrade: false,
        canAffordSupply: false,
        nearAffordSupply: false,
        upgradeBudgetRatio: 0
    }
} = {}) {
    return {
        player: {
            currentHp: hp,
            baseHp
        },
        autoStrategy: {
            risk,
            rest,
            merchant
        },
        floorBuff: {
            supplyKey,
            diversionBonus
        },
        getSupportRoomNeedState(type) {
            return type === 'event' ? eventNeedState : { shortfallSeverity: 0 };
        },
        getMerchantBudgetState() {
            return merchantBudgetState;
        }
    };
}

function expectClose(actual, expected, message) {
    assert.equal(Number(actual.toFixed(6)), Number(expected.toFixed(6)), message);
}

assert.deepEqual(
    buildHiddenRoomRoutingDebug({
        room: { accessScore: 0.42 },
        state: 'locked',
        threshold: 0.66
    }),
    {
        state: 'locked',
        threshold: 0.66,
        baseAccessScore: 0.42
    },
    'routing debug helper should preserve the shared debug fields'
);

assert.deepEqual(
    buildHiddenRoomRoutingDebug({
        room: { accessScore: 0.5 },
        state: 'eligible',
        threshold: 0.6,
        extras: {
            finalScore: 0.72,
            detourExtra: 3,
            targetType: 'event'
        }
    }),
    {
        state: 'eligible',
        threshold: 0.6,
        baseAccessScore: 0.5,
        finalScore: 0.72,
        detourExtra: 3,
        targetType: 'event'
    },
    'routing debug helper should append path scoring details'
);

const trialRoom = {
    typeKey: 'trial',
    accessScore: 0.5,
    rewardTier: 2,
    trialSeed: {
        effect: 'attack_overdrive',
        diversionBias: 0.02
    }
};

const cautiousTrial = calculateHiddenRoomDiversionScore({
    room: trialRoom,
    detourExtra: 2,
    gameState: makeGameState({ risk: 'cautious' })
});
const greedyTrial = calculateHiddenRoomDiversionScore({
    room: trialRoom,
    detourExtra: 2,
    gameState: makeGameState({ risk: 'greedy' })
});
expectClose(cautiousTrial, 0.576, 'cautious trial score should keep the risk penalty');
expectClose(greedyTrial, 0.896, 'greedy trial score should keep the reward-seeking bonus');
assert.ok(greedyTrial > cautiousTrial, 'greedy trial score should exceed cautious trial score');

const enteredTreasure = calculateHiddenRoomDiversionScore({
    room: {
        typeKey: 'treasure',
        accessScore: 0.5,
        rewardTier: 1,
        entered: true,
        pendingCacheIds: ['cache-1']
    },
    gameState: makeGameState()
});
expectClose(enteredTreasure, 0.76, 'entered treasure rooms should favor clearing pending caches');

const urgentRest = calculateHiddenRoomDiversionScore({
    room: {
        typeKey: 'rest',
        accessScore: 0.4,
        rewardTier: 1
    },
    gameState: makeGameState({ hp: 30, rest: 'emergency' }),
    restNeedState: {
        restockUrgency: 0.8,
        usedSupplyThisFloor: true,
        reservePressure: 0.5,
        preferredMissing: true,
        missingPreferred: true,
        totalSupply: 0,
        shortfallSeverity: 0.7
    }
});
const healthyRest = calculateHiddenRoomDiversionScore({
    room: {
        typeKey: 'rest',
        accessScore: 0.4,
        rewardTier: 1
    },
    gameState: makeGameState({ hp: 95, rest: 'emergency' }),
    restNeedState: {
        restockUrgency: 0.1,
        usedSupplyThisFloor: false,
        reservePressure: 0,
        preferredMissing: false,
        missingPreferred: false,
        totalSupply: 3,
        shortfallSeverity: 0.1
    }
});
assert.ok(urgentRest > healthyRest + 0.9, 'urgent rest need should materially outweigh healthy rest avoidance');

const merchantScore = calculateHiddenRoomDiversionScore({
    room: {
        typeKey: 'merchant',
        accessScore: 0.4,
        rewardTier: 2
    },
    gameState: makeGameState({
        merchant: 'power',
        merchantBudgetState: {
            canAffordUpgrade: true,
            nearAffordUpgrade: true,
            canAffordSupply: true,
            nearAffordSupply: true,
            upgradeBudgetRatio: 1
        }
    }),
    merchantNeedState: {
        neededType: 'assault',
        shortfallSeverity: 0.5,
        preferredMissing: false,
        missingPreferred: false,
        usedSupplyThisFloor: false,
        totalSupply: 2,
        reservePressure: 0.2,
        restockUrgency: 0.2
    }
});
expectClose(merchantScore, 0.79, 'merchant power strategy should preserve upgrade and supply budget bonuses');

console.log('hidden-room-routing checks passed');
