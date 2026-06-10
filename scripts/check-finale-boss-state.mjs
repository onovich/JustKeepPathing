import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
    buildBossMechanicState,
    buildFinaleBossArchetype,
    getFinaleBossClearBonus
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

console.log('finale-boss-state checks passed');
