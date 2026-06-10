import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
    buildCombatBonusScoreStatePlan,
    buildCombatVictoryStatePlan,
    buildEnemyAttackDamageStatePlan
} from '../src/logic/combat-state.mjs';
import { applyRoomRewardActions } from '../src/logic/room-reward-state.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

{
    const plan = buildCombatVictoryStatePlan({
        reward: 125,
        killCount: 1
    });

    assert.deepEqual(plan.actions, [
        { type: 'score', amount: 125 },
        { type: 'increment-floor-stat', field: 'kills', amount: 1 }
    ]);

    const state = {
        score: 5,
        floorStats: { kills: 2 },
        player: { baseHp: 80, currentHp: 80, baseAtk: 20 },
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

    assert.equal(state.score, 130);
    assert.equal(state.floorStats.kills, 3);
}

{
    const plan = buildCombatBonusScoreStatePlan({ bonusScore: 40 });

    assert.deepEqual(plan.actions, [
        { type: 'score', amount: 40 }
    ]);

    const state = {
        score: 10,
        floorStats: { kills: 0 },
        player: { baseHp: 80, currentHp: 80, baseAtk: 20 },
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

    assert.equal(state.score, 50);
}

assert.deepEqual(
    buildCombatBonusScoreStatePlan({ bonusScore: 0 }).actions,
    []
);

{
    const plan = buildEnemyAttackDamageStatePlan({
        profileAtk: 20,
        attackRoll: 1.2,
        incomingDamageMult: 0.5,
        attackMult: 2,
        reflexShieldReady: false
    });

    assert.equal(plan.damageBeforeReflex, 24);
    assert.equal(plan.enemyDamage, 24);
    assert.equal(plan.preventedDamage, 0);
    assert.equal(plan.reflexShieldTriggered, false);
    assert.equal(plan.reflexShieldMessage, '');
    assert.deepEqual(plan.actions, [
        { type: 'damage-player-raw', amount: 24 }
    ]);

    const state = {
        score: 0,
        floorStats: { kills: 0 },
        floorRuntime: { reflexShieldReady: false },
        player: { baseHp: 80, currentHp: 18, baseAtk: 20 },
        maze: { baseChestRate: 0.05, baseMonsterRate: 0.03 },
        meta: { nextHiddenRoomBonus: 0, nextFloorAttackBonus: 0 },
        floorBuff: { incomingDamageMult: 1 },
        items: { supplies: {} }
    };
    applyRoomRewardActions({
        gameState: state,
        actions: plan.actions
    });

    assert.equal(state.player.currentHp, -6, 'combat damage should be able to defeat the player');
}

{
    const plan = buildEnemyAttackDamageStatePlan({
        profileAtk: 50,
        attackRoll: 1,
        incomingDamageMult: 1,
        attackMult: 2,
        reflexShieldReady: true
    });

    assert.equal(plan.damageBeforeReflex, 100);
    assert.equal(plan.enemyDamage, 38);
    assert.equal(plan.preventedDamage, 62);
    assert.equal(plan.reflexShieldTriggered, true);
    assert.match(plan.reflexShieldMessage, /62/);
    assert.match(plan.reflexShieldMessage, /38/);
    assert.deepEqual(plan.actions, [
        { type: 'set-floor-runtime-field', field: 'reflexShieldReady', value: false },
        { type: 'damage-player-raw', amount: 38 }
    ]);

    const state = {
        score: 0,
        floorStats: { kills: 0 },
        floorRuntime: { reflexShieldReady: true },
        player: { baseHp: 80, currentHp: 40, baseAtk: 20 },
        maze: { baseChestRate: 0.05, baseMonsterRate: 0.03 },
        meta: { nextHiddenRoomBonus: 0, nextFloorAttackBonus: 0 },
        floorBuff: { incomingDamageMult: 1 },
        items: { supplies: {} }
    };
    applyRoomRewardActions({
        gameState: state,
        actions: plan.actions
    });

    assert.equal(state.player.currentHp, 2);
    assert.equal(state.floorRuntime.reflexShieldReady, false);
}

assert.match(
    indexHtml,
    /startCombatRPG\(enemyObj, enemyNode\)[\s\S]*?buildCombatVictoryStatePlan\(/,
    'combat victory rewards should route score and kill-count state through the shared plan helper'
);

assert.match(
    indexHtml,
    /if \(finaleBossBonus > 0\) \{[\s\S]*?buildCombatBonusScoreStatePlan\(/,
    'finale boss bonus score should route through the shared plan helper'
);

assert.match(
    indexHtml,
    /startCombatRPG\(enemyObj, enemyNode\)[\s\S]*?buildEnemyAttackDamageStatePlan\([\s\S]*?applyRoomRewardActions\(\{/,
    'enemy attack damage and reflex shield state should route through the combat state helper'
);

console.log('combat-state checks passed');
