import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
    buildEliteEnemyArchetype,
    buildHiddenCacheEntityState,
    buildHiddenEliteNodeEntityState,
    buildHiddenEventNodeEntityState,
    buildHiddenRoomPlan,
    buildHiddenTrialNodeEntityState,
    getHiddenRoomRewardTier
} from '../src/logic/hidden-rooms.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

const candidates = [
    {
        key: 'branch-a',
        c: 4,
        r: 3,
        difficultyScore: 0.5,
        deadEndScore: 0.8,
        branchDepthNorm: 0.6,
        detourSteps: 2,
        basePathLength: 12
    }
];

const rooms = buildHiddenRoomPlan({
    level: 6,
    maze: { lvSize: 5 },
    floorPlan: {
        archetypeKey: 'combat',
        hiddenRoomCount: 1,
        sizeBand: 'medium',
        themeKey: 'factory'
    },
    candidates,
    random: () => 0.1
});

assert.equal(rooms.length, 1, 'eligible floor should generate one hidden room');
assert.ok(rooms[0].typeKey, 'generated room should include a type key');
assert.ok(rooms[0].placementKey, 'generated room should include a placement key');
assert.equal(rooms[0].candidate.key, candidates[0].key, 'generated room should keep the selected candidate');
assert.equal(typeof rooms[0].accessScore, 'number', 'generated room should include access scoring');

{
    const entity = buildHiddenCacheEntityState({
        room: {
            id: 'treasure-a',
            rewardTier: 2,
            rewardProfile: { chestBonus: 2, scoreMult: 1.3 }
        },
        slot: { c: 7, r: 4 },
        index: 1,
        level: 2,
        hoverOffset: 0.75
    });

    assert.equal(entity.id, 'treasure-a-cache-2');
    assert.equal(entity.type, 'hidden-cache');
    assert.equal(entity.c, 7);
    assert.equal(entity.r, 4);
    assert.equal(entity.hiddenRoomId, 'treasure-a');
    assert.equal(entity.reward, 140);
    assert.equal(entity.baseY, 0.19);
    assert.equal(entity.hoverAmplitude, 0.035);
    assert.equal(entity.hoverSpeed, 2.2);
    assert.equal(entity.hoverOffset, 0.75);
    assert.equal(entity.spinSpeed, 0.92);
    assert.equal(entity.counterSpinSpeed, 0);
}

{
    const entity = buildHiddenEventNodeEntityState({
        room: {
            id: 'event-a',
            rewardTier: 2,
            eventSeed: { rewardMult: 1.25 }
        },
        slot: { c: 3, r: 8 },
        index: 0,
        level: 3,
        hoverOffset: 1.25
    });

    assert.equal(entity.id, 'event-a-event-node-1');
    assert.equal(entity.type, 'hidden-event-node');
    assert.equal(entity.reward, 72);
    assert.equal(entity.baseY, 0.12);
    assert.equal(entity.hoverAmplitude, 0.045);
    assert.equal(entity.hoverSpeed, 2.6);
    assert.equal(entity.hoverOffset, 1.25);
    assert.equal(entity.spinSpeed, 1.35);
    assert.equal(entity.counterSpinSpeed, 0);
}

{
    const supportDef = { id: 'amp_pylon', rewardMult: 1.4, label: 'Amplifier' };
    const entity = buildHiddenEliteNodeEntityState({
        room: {
            id: 'elite-a',
            rewardTier: 3
        },
        slot: { c: 9, r: 5 },
        supportDef,
        index: 1,
        level: 2,
        hoverOffset: 2.5
    });

    assert.equal(entity.id, 'elite-a-elite-node-2');
    assert.equal(entity.type, 'hidden-elite-node');
    assert.equal(entity.reward, 103);
    assert.equal(entity.supportData, supportDef);
    assert.equal(entity.baseY, 0.14);
    assert.equal(entity.hoverAmplitude, 0.05);
    assert.equal(entity.hoverSpeed, 2.3);
    assert.equal(entity.hoverOffset, 2.5);
    assert.equal(entity.spinSpeed, 1.24);
    assert.equal(entity.counterSpinSpeed, 0);
}

{
    const entity = buildHiddenTrialNodeEntityState({
        room: {
            id: 'trial-a',
            rewardTier: 2,
            rewardProfile: { scoreMult: 1.5 },
            trialSeed: {
                rewardMult: 0.75,
                hazardMult: 2
            }
        },
        slot: { c: 2, r: 6 },
        index: 1,
        level: 2,
        hoverOffset: 3.5
    });

    assert.equal(entity.id, 'trial-a-trial-node-2');
    assert.equal(entity.type, 'hidden-trial-node');
    assert.equal(entity.reward, 70);
    assert.ok(Math.abs(entity.hazardRatio - 0.154) < 1e-12);
    assert.equal(entity.baseY, 0.15);
    assert.equal(entity.hoverAmplitude, 0.05);
    assert.equal(entity.hoverSpeed, 2.55);
    assert.equal(entity.hoverOffset, 3.5);
    assert.equal(entity.spinSpeed, 1.2);
    assert.equal(entity.counterSpinSpeed, 1.55);
}

{
    const elite = buildEliteEnemyArchetype({
        baseEnemy: {
            id: 'scout',
            name: 'Scout',
            baseHp: 100,
            baseAtk: 20,
            reward: 80,
            scale: 1.3,
            hoverAmplitude: 0.5,
            hoverSpeed: 2.2,
            attackVerb: 'slashes',
            color: 0xff0000
        },
        room: {
            id: 'room-a',
            displayName: 'Display Room',
            rewardTier: 3,
            rewardProfile: { scoreMult: 2 },
            eliteVariant: {
                label: 'Variant Room',
                introHint: 'Hold fast.'
            }
        }
    });

    assert.equal(elite.id, 'scout-elite-room-a');
    assert.equal(elite.name, 'Scout精英');
    assert.equal(elite.baseHp, 152);
    assert.equal(elite.baseAtk, 25);
    assert.equal(elite.reward, 180);
    assert.equal(elite.scale, 1.4560000000000002);
    assert.equal(elite.hoverAmplitude, 0.54);
    assert.equal(elite.hoverSpeed, 2.068);
    assert.match(elite.intro, /Variant Room里的 Scout 精英开始反击。Hold fast\./);
    assert.equal(elite.attackVerb, '精英slashes');
    assert.equal(elite.elite, true);
    assert.equal(elite.hiddenRoomId, 'room-a');
    assert.equal(elite.hiddenRoomRewardTier, 3);
}

{
    const rewardProfile = getHiddenRoomRewardTier(99);
    const elite = buildEliteEnemyArchetype({
        baseEnemy: {
            id: 'brute',
            name: 'Brute',
            baseHp: 80,
            baseAtk: 16,
            reward: 100,
            scale: 0,
            hoverAmplitude: 0.25,
            hoverSpeed: 1,
            attackVerb: 'charges'
        },
        room: {
            id: 'fallback',
            displayName: 'Fallback Room',
            rewardTier: 99
        }
    });

    assert.equal(elite.reward, Math.floor(100 * (1.55 + rewardProfile.scoreMult * 0.35)));
    assert.equal(elite.scale, 1.12);
    assert.equal(elite.hoverSpeed, 1.5);
    assert.match(elite.intro, /Fallback Room里的 Brute 精英开始反击。精英正在深处待命。/);
}

assert.match(
    indexHtml,
    /buildEliteArchetype\(room\) \{[\s\S]*?buildEliteEnemyArchetypeState\(\{[\s\S]*?baseEnemy: base,[\s\S]*?room/,
    'elite enemy archetype construction should route through the hidden-room helper'
);

assert.match(
    indexHtml,
    /createHiddenCacheEntity\(room, slot, index\) \{[\s\S]*?buildHiddenCacheEntityState\(/,
    'hidden cache entity reward state should route through the hidden-room helper'
);

assert.match(
    indexHtml,
    /createEventNodeEntity\(room, slot, index\) \{[\s\S]*?buildHiddenEventNodeEntityState\(/,
    'hidden event node reward state should route through the hidden-room helper'
);

assert.match(
    indexHtml,
    /createEliteSupportEntity\(room, slot, supportDef, index\) \{[\s\S]*?buildHiddenEliteNodeEntityState\(/,
    'hidden elite support node reward state should route through the hidden-room helper'
);

assert.match(
    indexHtml,
    /createTrialNodeEntity\(room, slot, index\) \{[\s\S]*?buildHiddenTrialNodeEntityState\(/,
    'hidden trial node reward and hazard state should route through the hidden-room helper'
);

console.log('hidden-rooms checks passed');
