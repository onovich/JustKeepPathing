import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
    buildCombatProfile,
    buildCombatBonusScoreStatePlan,
    buildCombatVictoryStatePlan,
    buildEnemyAttackDamageStatePlan
} from '../src/logic/combat-state.mjs';
import { applyRoomRewardActions } from '../src/logic/room-reward-state.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

{
    const profile = buildCombatProfile({
        level: 3,
        floorBuff: { monsterRewardMult: 1.25 },
        enemyData: {
            name: 'Scout',
            intro: 'Intro',
            attackVerb: 'slashes',
            reward: 100,
            baseHp: 50,
            baseAtk: 10,
            color: 0xff0000
        }
    });

    assert.equal(profile.name, 'Scout');
    assert.equal(profile.intro, 'Intro');
    assert.equal(profile.reward, 192);
    assert.equal(profile.maxHp, 76);
    assert.equal(profile.atk, 13);
    assert.equal(profile.boss, false);
    assert.equal(profile.finaleBoss, false);
    assert.equal(profile.bossMechanic, null);
}

{
    const profile = buildCombatProfile({
        level: 2,
        floorBuff: {
            monsterRewardMult: 1.1,
            bossRewardMult: 1.2
        },
        enemyData: {
            name: 'Gatekeeper',
            intro: 'Boss',
            attackVerb: 'smashes',
            reward: 200,
            baseHp: 120,
            baseAtk: 20,
            boss: true,
            finaleBoss: true,
            bossMechanic: 'seal',
            color: 0x00ff00
        }
    });

    assert.equal(profile.reward, 359);
    assert.equal(profile.maxHp, 176);
    assert.equal(profile.atk, 26);
    assert.equal(profile.boss, true);
    assert.equal(profile.finaleBoss, true);
    assert.equal(profile.bossMechanic, 'seal');
}

{
    const profile = buildCombatProfile({
        level: 2,
        floorBuff: { monsterRewardMult: 1 },
        enemyData: {
            name: 'Elite',
            intro: 'Elite intro',
            attackVerb: 'fires',
            reward: 80,
            baseHp: 90,
            baseAtk: 12,
            elite: true,
            color: 0x0000ff
        },
        activeEliteSupports: [
            { supportData: { hpMult: 0.25, atkMult: 0.5, label: 'Shield' } },
            { supportData: { hpMult: 0.15, atkMult: 0.25, label: 'Amplifier' } }
        ]
    });

    assert.equal(profile.reward, 108);
    assert.equal(profile.maxHp, 157);
    assert.equal(profile.atk, 24);
    assert.match(profile.intro, /2 个装置/);
    assert.match(profile.intro, /Shield、Amplifier/);
}

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
    /buildCombatProfile\(enemyObj\) \{[\s\S]*?buildCombatProfileState\(\{[\s\S]*?activeEliteSupports/,
    'combat profile scaling and elite support summary should route through the shared helper'
);

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
