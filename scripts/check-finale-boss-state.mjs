import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
    buildBossMechanicState,
    buildFinaleBossArchetype,
    getFinaleBossClearBonus,
    resolveBossMechanicEnemyAttackPrep,
    resolveBossMechanicPlayerDamage
} from '../src/logic/finale-boss-state.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

const baseBoss = {
    id: 'boss',
    name: 'Base Boss',
    intro: 'Base intro',
    attackVerb: 'hits',
    color: 0xff0000,
    accent: 0x00ffff,
    baseHp: 100,
    baseAtk: 20,
    reward: 300,
    scale: 1.2
};

{
    const boss = buildFinaleBossArchetype({
        baseBoss,
        bossMod: {
            name: 'Ember Boss',
            hpMult: 1.5,
            atkMult: 1.25,
            rewardMult: 1.75,
            clearBonusMult: 0.5,
            bossMechanic: { key: 'heat_ramp', maxStacks: 4 }
        },
        themeKey: 'ember_forge',
        finaleLabel: 'Ember Finale'
    });

    assert.equal(boss.id, 'boss-ember_forge');
    assert.equal(boss.name, 'Ember Boss');
    assert.equal(boss.intro, 'Base intro');
    assert.equal(boss.baseHp, 150);
    assert.equal(boss.baseAtk, 25);
    assert.equal(boss.reward, 525);
    assert.equal(boss.scale, 1.248);
    assert.equal(boss.finaleBoss, true);
    assert.equal(boss.finaleBossLabel, 'Ember Finale');
    assert.equal(boss.finaleBossClearBonusMult, 0.5);
    assert.deepEqual(boss.bossMechanic, { key: 'heat_ramp', maxStacks: 4 });
}

assert.equal(
    buildFinaleBossArchetype({ baseBoss, bossMod: null }),
    baseBoss,
    'missing boss modifier should preserve the base boss archetype'
);

assert.equal(
    getFinaleBossClearBonus({
        enemyData: { finaleBossClearBonusMult: 0.5 },
        profileReward: 300
    }),
    150
);

assert.equal(
    getFinaleBossClearBonus({
        enemyData: { finaleBossClearBonusMult: 0.02 },
        profileReward: 300
    }),
    40,
    'finale clear bonus should keep the minimum payout'
);

assert.equal(getFinaleBossClearBonus({ enemyData: {}, profileReward: 300 }), 0);

assert.deepEqual(
    buildBossMechanicState({
        finaleBoss: true,
        bossMechanic: { key: 'heat_ramp', maxStacks: 4, atkGainPerStack: 0.2 }
    }),
    { key: 'heat_ramp', stacks: 0, maxStacks: 4, atkGainPerStack: 0.2 }
);

assert.deepEqual(
    buildBossMechanicState({
        finaleBoss: true,
        bossMechanic: { key: 'salvage_repair', healRatio: 0.12, maxTriggers: 2 }
    }),
    { key: 'salvage_repair', healRatio: 0.12, remainingTriggers: 2 }
);

assert.deepEqual(
    buildBossMechanicState({
        finaleBoss: true,
        bossMechanic: { key: 'signal_jam', playerDamageMult: 0.5 }
    }),
    { key: 'signal_jam', playerDamageMult: 0.5, pendingJam: false }
);

assert.deepEqual(
    buildBossMechanicState({
        finaleBoss: true,
        bossMechanic: { key: 'seal_layers', layers: 3, damageMult: 0.4 }
    }),
    { key: 'seal_layers', layers: 3, damageMult: 0.4 }
);

assert.equal(
    buildBossMechanicState({
        finaleBoss: false,
        bossMechanic: { key: 'heat_ramp' }
    }),
    null
);

{
    const mechanicState = { key: 'signal_jam', playerDamageMult: 0.5, pendingJam: true };
    const resolution = resolveBossMechanicPlayerDamage(mechanicState, 31);

    assert.equal(resolution.damage, 15);
    assert.equal(resolution.floatingText, '干扰');
    assert.equal(resolution.textColor, '#67e8f9');
    assert.equal(resolution.strong, true);
    assert.match(resolution.message, /15/);
    assert.equal(mechanicState.pendingJam, false, 'signal jam should be consumed after reducing player damage');
}

{
    const mechanicState = { key: 'seal_layers', layers: 3, damageMult: 0.4 };
    const resolution = resolveBossMechanicPlayerDamage(mechanicState, 30);

    assert.equal(resolution.damage, 12);
    assert.equal(resolution.floatingText, '封锁 2');
    assert.equal(resolution.textColor, '#c4b5fd');
    assert.match(resolution.message, /2/);
    assert.equal(mechanicState.layers, 2);
}

assert.deepEqual(
    resolveBossMechanicPlayerDamage(null, 20),
    { damage: 20, message: '' }
);

{
    const mechanicState = { key: 'heat_ramp', stacks: 2, maxStacks: 3, atkGainPerStack: 0.2 };
    const resolution = resolveBossMechanicEnemyAttackPrep({
        mechanicState,
        enemyHp: 50,
        enemyMaxHp: 100
    });

    assert.equal(mechanicState.stacks, 3);
    assert.equal(resolution.enemyHp, 50);
    assert.equal(resolution.attackMult, 1.6);
    assert.equal(resolution.floatingText, '过热 x3');
    assert.equal(resolution.textColor, '#fb923c');
}

{
    const mechanicState = { key: 'salvage_repair', healRatio: 0.12, remainingTriggers: 2 };
    const resolution = resolveBossMechanicEnemyAttackPrep({
        mechanicState,
        enemyHp: 80,
        enemyMaxHp: 100
    });

    assert.equal(resolution.enemyHp, 92);
    assert.equal(resolution.attackMult, 1);
    assert.equal(resolution.floatingText, '+12');
    assert.equal(resolution.textColor, '#fde68a');
    assert.equal(resolution.updateEnemyHp, true);
    assert.equal(mechanicState.remainingTriggers, 1);
}

{
    const mechanicState = { key: 'salvage_repair', healRatio: 0.12, remainingTriggers: 2 };
    const resolution = resolveBossMechanicEnemyAttackPrep({
        mechanicState,
        enemyHp: 100,
        enemyMaxHp: 100
    });

    assert.deepEqual(resolution, { enemyHp: 100, attackMult: 1, message: '' });
    assert.equal(mechanicState.remainingTriggers, 2);
}

{
    const mechanicState = { key: 'signal_jam', pendingJam: false };
    const resolution = resolveBossMechanicEnemyAttackPrep({
        mechanicState,
        enemyHp: 90,
        enemyMaxHp: 100
    });

    assert.equal(mechanicState.pendingJam, true);
    assert.equal(resolution.enemyHp, 90);
    assert.equal(resolution.attackMult, 1);
    assert.equal(resolution.floatingText, '干扰脉冲');
    assert.equal(resolution.textColor, '#67e8f9');
}

assert.match(
    indexHtml,
    /buildFinaleBossArchetype\(\) \{[\s\S]*?buildFinaleBossArchetypePlan\(/,
    'finale boss archetype construction should delegate to the shared logic helper'
);

assert.match(
    indexHtml,
    /getFinaleBossClearBonus\(enemyObj, profile\) \{[\s\S]*?getFinaleBossClearBonusValue\(/,
    'finale boss clear bonus should delegate to the shared logic helper'
);

assert.match(
    indexHtml,
    /buildBossMechanicState\(enemyObj\) \{[\s\S]*?buildBossMechanicStatePlan\(/,
    'boss mechanic state initialization should delegate to the shared logic helper'
);

assert.match(
    indexHtml,
    /applyBossMechanicToPlayerDamage\(mechanicState, damage, enemyMesh\) \{[\s\S]*?resolveBossMechanicPlayerDamagePlan\(/,
    'boss mechanic player-damage decisions should delegate to the shared logic helper'
);

assert.match(
    indexHtml,
    /applyBossMechanicBeforeEnemyAttack\(mechanicState, enemyHp, profile, enemyMesh\) \{[\s\S]*?resolveBossMechanicEnemyAttackPrepPlan\(/,
    'boss mechanic enemy-attack prep decisions should delegate to the shared logic helper'
);

console.log('finale-boss-state checks passed');
