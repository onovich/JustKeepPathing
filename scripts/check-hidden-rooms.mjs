import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
    buildEliteEnemyArchetype,
    buildHiddenRoomPlan,
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

console.log('hidden-rooms checks passed');
