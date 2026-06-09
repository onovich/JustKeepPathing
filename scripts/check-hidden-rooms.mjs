import assert from 'node:assert/strict';
import { buildHiddenRoomPlan } from '../src/logic/hidden-rooms.mjs';

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

console.log('hidden-rooms checks passed');
