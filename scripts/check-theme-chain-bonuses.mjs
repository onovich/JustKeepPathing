import assert from 'node:assert/strict';
import { buildThemeChainBonusPlan } from '../src/logic/theme-chain-bonuses.mjs';

assert.deepEqual(
    buildThemeChainBonusPlan({
        themeKey: 'ember_forge',
        sourceKey: 'elite',
        rewardTier: 3
    }),
    {
        kind: 'ember_forge',
        attackBonus: 0.08499999999999999,
        nextFloorAttackBonusCap: 0.42,
        supplyType: 'assault',
        supplyCount: 1
    },
    'ember forge elite plan should preserve attack preheat and assault supply'
);

assert.deepEqual(
    buildThemeChainBonusPlan({
        themeKey: 'salvage_reaches',
        sourceKey: 'treasure',
        rewardTier: 2,
        level: 4
    }),
    {
        kind: 'salvage_reaches',
        scoreBonus: 86,
        supplyType: 'salvage',
        supplyCount: 1
    },
    'salvage reaches plan should preserve score and supply formula'
);

assert.deepEqual(
    buildThemeChainBonusPlan({
        themeKey: 'signal_warrens',
        sourceKey: 'trial',
        rewardTier: 2
    }),
    {
        kind: 'signal_warrens',
        hiddenRoomBonus: 0.054,
        nextHiddenRoomBonusCap: 0.38,
        supplyType: null,
        supplyCount: 0
    },
    'signal warrens trial tier 2 should not grant scout supply'
);

assert.deepEqual(
    buildThemeChainBonusPlan({
        themeKey: 'quarantine_vault',
        sourceKey: 'elite',
        rewardTier: 4,
        playerBaseHp: 120
    }),
    {
        kind: 'quarantine_vault',
        damageReduction: 0.14,
        incomingDamageFloor: 0.58,
        repair: 10,
        refreshReflexShield: true
    },
    'quarantine vault elite plan should preserve repair and reflex shield refresh'
);

assert.equal(
    buildThemeChainBonusPlan({
        themeKey: 'salvage_reaches',
        sourceKey: 'trial',
        rewardTier: 2,
        level: 4
    }),
    null,
    'unsupported source should not produce a theme-chain plan'
);

console.log('theme-chain-bonuses checks passed');
