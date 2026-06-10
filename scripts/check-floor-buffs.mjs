import assert from 'node:assert/strict';
import {
    applyRunRelicsToFloorStart,
    applyThemeDirectiveToFloorBuff,
    buildFloorSupplyConsumption,
    buildSupplyFloorBuff,
    createBaseFloorBuff,
    pickRandomFloorSupplyType
} from '../src/logic/floor-buffs.mjs';

const near = (actual, expected, message) => {
    assert.equal(Math.abs(actual - expected) < 0.000001, true, message || `${actual} ~= ${expected}`);
};

assert.deepEqual(createBaseFloorBuff({ attackMult: 2, supplyActive: true }), {
    supplyActive: true,
    supplyKey: null,
    supplyLabel: '',
    hiddenRoomBonus: 0,
    chestRewardMult: 1,
    attackMult: 2,
    supplyDropBonus: 0,
    diversionBonus: 0,
    moveSpeedMult: 1,
    monsterSpawnMult: 1,
    monsterRewardMult: 1,
    incomingDamageMult: 1,
    bossRewardMult: 1
});

assert.equal(pickRandomFloorSupplyType('chest', 0.47), 'salvage');
assert.equal(pickRandomFloorSupplyType('chest', 0.49), 'assault');
assert.equal(pickRandomFloorSupplyType('chest', 0.99), 'scout');
assert.equal(pickRandomFloorSupplyType('cache', 0.49), 'salvage');
assert.equal(pickRandomFloorSupplyType('cache', 0.51), 'scout');
assert.equal(pickRandomFloorSupplyType('cache', 0.91), 'assault');

assert.deepEqual(buildSupplyFloorBuff('assault', 'Assault Supply'), {
    ...createBaseFloorBuff(),
    supplyActive: true,
    supplyKey: 'assault',
    supplyLabel: 'Assault Supply',
    attackMult: 1.24,
    bossRewardMult: 1.08
});
assert.deepEqual(buildSupplyFloorBuff('salvage', 'Salvage Supply'), {
    ...createBaseFloorBuff(),
    supplyActive: true,
    supplyKey: 'salvage',
    supplyLabel: 'Salvage Supply',
    chestRewardMult: 1.42,
    supplyDropBonus: 0.14
});
assert.deepEqual(buildSupplyFloorBuff('scout', 'Scout Supply'), {
    ...createBaseFloorBuff(),
    supplyActive: true,
    supplyKey: 'scout',
    supplyLabel: 'Scout Supply',
    hiddenRoomBonus: 0.1,
    supplyDropBonus: 0.04,
    diversionBonus: 0.08
});

assert.deepEqual(
    buildFloorSupplyConsumption({
        priority: ['assault', 'scout', 'salvage'],
        supplies: { assault: 0, scout: 2, salvage: 3 },
        supplyDefs: {
            scout: { label: 'Scout Supply' }
        }
    }),
    {
        consumed: true,
        supplyType: 'scout',
        floorBuff: buildSupplyFloorBuff('scout', 'Scout Supply')
    }
);
assert.deepEqual(
    buildFloorSupplyConsumption({
        priority: ['assault', 'scout', 'salvage'],
        supplies: {}
    }),
    {
        consumed: false,
        supplyType: null,
        floorBuff: createBaseFloorBuff()
    }
);

{
    const meta = { nextHiddenRoomBonus: 0.2, nextFloorAttackBonus: 0.15 };
    const result = applyRunRelicsToFloorStart({
        floorBuff: buildSupplyFloorBuff('salvage', 'Salvage Supply'),
        meta,
        runRelics: [
            'reflex_shield',
            'pathfinder_lens',
            'salvage_thrusters',
            'blood_compass',
            'echo_engine',
            'boss_harvester'
        ],
        archetypeKey: 'treasure'
    });
    assert.equal(result.floorRuntime.reflexShieldReady, true);
    assert.equal(result.meta.nextHiddenRoomBonus, 0.2);
    assert.equal(result.meta.nextFloorAttackBonus, 0);
    assert.equal(meta.nextFloorAttackBonus, 0.15, 'input meta should not be mutated');
    near(result.floorBuff.hiddenRoomBonus, 0.08);
    near(result.floorBuff.diversionBonus, 0.06);
    near(result.floorBuff.chestRewardMult, 1.42 * 1.18);
    near(result.floorBuff.supplyDropBonus, 0.14 + 0.08);
    near(result.floorBuff.moveSpeedMult, 0.9);
    near(result.floorBuff.monsterSpawnMult, 1.18);
    near(result.floorBuff.monsterRewardMult, 1.18);
    near(result.floorBuff.attackMult, 1.15);
    near(result.floorBuff.bossRewardMult, 1.22);
}

{
    const result = applyThemeDirectiveToFloorBuff({
        floorBuff: createBaseFloorBuff({ attackMult: 1.1, incomingDamageMult: 0.9 }),
        floorPlan: {
            isFinaleFloor: true,
            theme: {
                directive: {
                    label: 'Finale Theme',
                    summary: 'Strong ending',
                    attackBonus: 0.1,
                    chestRewardBonus: 0.2,
                    hiddenRoomBonus: 0.03,
                    supplyDropBonus: 0.04,
                    diversionBonus: 0.05,
                    monsterRewardBonus: 0.06,
                    bossRewardBonus: 0.07,
                    incomingDamageReduction: 0.8
                }
            }
        }
    });
    assert.deepEqual(result.floorDirective, {
        label: 'Finale Theme',
        summary: 'Strong ending'
    });
    near(result.floorBuff.attackMult, 1.1 * 1.135);
    near(result.floorBuff.chestRewardMult, 1.27);
    near(result.floorBuff.hiddenRoomBonus, 0.0405);
    near(result.floorBuff.supplyDropBonus, 0.054);
    near(result.floorBuff.diversionBonus, 0.0675);
    near(result.floorBuff.monsterRewardMult, 1.081);
    near(result.floorBuff.bossRewardMult, 1.0945);
    near(result.floorBuff.incomingDamageMult, 0.9 * 0.2);
}

assert.deepEqual(
    applyThemeDirectiveToFloorBuff({
        floorBuff: createBaseFloorBuff({ attackMult: 1.2 }),
        floorPlan: null
    }),
    {
        floorBuff: createBaseFloorBuff({ attackMult: 1.2 }),
        floorDirective: null
    }
);

console.log('floor-buffs checks passed');
