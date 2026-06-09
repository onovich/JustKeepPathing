import assert from 'node:assert/strict';
import {
    getHiddenRoomInteractionAccent,
    getPendingHiddenRoomEntities,
    markHiddenRoomClearedState,
    removeHiddenRoomEntityReference,
    removePendingHiddenRoomEntity,
    shouldClearHiddenRoomAfterInteraction
} from '../src/logic/hidden-room-resolution.mjs';

assert.deepEqual(
    getHiddenRoomInteractionAccent('event'),
    { color: 0xc084fc, textColor: '#c084fc' },
    'event accent should stay purple'
);
assert.deepEqual(
    getHiddenRoomInteractionAccent('trial'),
    { color: 0xfb7185, textColor: '#fb7185' },
    'trial accent should stay rose'
);
assert.deepEqual(
    getHiddenRoomInteractionAccent('unknown'),
    { color: 0xfacc15, textColor: '#facc15' },
    'unknown room accent should fall back to treasure'
);

assert.equal(
    shouldClearHiddenRoomAfterInteraction({ typeKey: 'treasure', pendingCacheIds: ['cache-1'] }),
    false,
    'treasure rooms with pending caches should stay active'
);
assert.equal(
    shouldClearHiddenRoomAfterInteraction({ typeKey: 'treasure', pendingCacheIds: [] }),
    true,
    'treasure rooms without pending caches should clear'
);
assert.equal(
    shouldClearHiddenRoomAfterInteraction({ typeKey: 'event', pendingEventNodeIds: ['node-1'] }),
    false,
    'event rooms with pending nodes should stay active'
);
assert.equal(
    shouldClearHiddenRoomAfterInteraction({ typeKey: 'trial', pendingTrialNodeIds: [] }),
    true,
    'trial rooms without pending nodes should clear'
);
assert.equal(
    shouldClearHiddenRoomAfterInteraction({ typeKey: 'rest' }),
    true,
    'rest rooms should clear after interaction'
);
assert.equal(
    shouldClearHiddenRoomAfterInteraction({ typeKey: 'merchant' }),
    true,
    'merchant rooms should clear after interaction'
);
assert.equal(
    shouldClearHiddenRoomAfterInteraction({ typeKey: 'elite' }),
    false,
    'elite rooms should wait for combat clear'
);

{
    const picked = { id: 'node-2' };
    const kept = { id: 'node-1' };
    const result = removePendingHiddenRoomEntity({
        pendingIds: ['node-1', 'node-2', 'node-3'],
        entities: [kept, picked],
        entity: picked
    });

    assert.deepEqual(result.pendingIds, ['node-1', 'node-3'], 'picked hidden-room entity id should be removed');
    assert.deepEqual(result.entities, [kept], 'picked hidden-room entity object should be removed by reference');
}

{
    const result = removePendingHiddenRoomEntity({
        pendingIds: ['node-1'],
        entities: [{ id: 'node-1' }],
        entity: null
    });

    assert.deepEqual(result.pendingIds, ['node-1'], 'missing entity should leave pending ids unchanged');
    assert.equal(result.entities.length, 1, 'missing entity should leave entity list unchanged');
}

{
    const first = { id: 'node-1' };
    const second = { id: 'node-2' };
    const result = getPendingHiddenRoomEntities({
        pendingIds: ['node-2', 'missing-node', 'node-1'],
        entities: [first, second]
    });

    assert.deepEqual(result, [second, first], 'pending hidden-room entities should follow pending id order and skip missing ids');
}

assert.deepEqual(
    getPendingHiddenRoomEntities({ pendingIds: [], entities: [{ id: 'node-1' }] }),
    [],
    'empty pending id lists should return no pending hidden-room entities'
);

{
    const target = { id: 'marker' };
    const sameId = { id: 'marker' };
    const entities = [sameId, target];

    assert.equal(removeHiddenRoomEntityReference(entities, target), true, 'hidden room entity reference should be removed');
    assert.deepEqual(entities, [sameId], 'hidden room entity removal should use object reference, not id');
}

{
    const entities = [{ id: 'marker' }];

    assert.equal(removeHiddenRoomEntityReference(entities, { id: 'marker' }), false, 'missing reference should not be removed');
    assert.equal(entities.length, 1, 'missing reference should leave entity array unchanged');
}

{
    const room = {
        anchor: { c: 1, r: 1 },
        chamberCells: [
            { c: 1, r: 1 },
            { c: 2, r: 1 },
            { c: 9, r: 9 }
        ]
    };
    const grid = [
        [],
        [
            null,
            { hiddenRoomId: 'room-1' },
            { hiddenRoomId: 'room-1' }
        ]
    ];
    const floorStats = { hiddenRoomsCleared: 2 };

    assert.equal(
        markHiddenRoomClearedState({ room, grid, floorStats }),
        true,
        'uncleared hidden rooms should be marked cleared'
    );
    assert.equal(room.cleared, true, 'hidden room should be marked cleared');
    assert.equal(room.entered, true, 'hidden room should be marked entered');
    assert.equal(floorStats.hiddenRoomsCleared, 3, 'hidden room clear count should increment once');
    assert.equal(grid[1][1].hiddenRoomId, null, 'first chamber cell should clear hiddenRoomId');
    assert.equal(grid[1][2].hiddenRoomId, null, 'second chamber cell should clear hiddenRoomId');
}

{
    const room = { cleared: true, entered: false, anchor: { c: 0, r: 0 } };
    const grid = [[{ hiddenRoomId: 'room-1' }]];
    const floorStats = { hiddenRoomsCleared: 4 };

    assert.equal(
        markHiddenRoomClearedState({ room, grid, floorStats }),
        false,
        'already-cleared rooms should not be marked again'
    );
    assert.equal(room.entered, false, 'already-cleared rooms should not be mutated again');
    assert.equal(floorStats.hiddenRoomsCleared, 4, 'already-cleared rooms should not increment clear count');
    assert.equal(grid[0][0].hiddenRoomId, 'room-1', 'already-cleared rooms should not touch grid cells');
}

{
    assert.equal(
        markHiddenRoomClearedState({ room: null, grid: [], floorStats: { hiddenRoomsCleared: 0 } }),
        false,
        'missing rooms should not clear'
    );
}

console.log('hidden-room-resolution checks passed');
