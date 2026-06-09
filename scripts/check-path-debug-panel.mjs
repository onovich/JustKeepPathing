import assert from 'node:assert/strict';
import {
    countBlockedPathDebugRooms,
    countPathDebugRoutingStates,
    countReachablePathDebugRooms,
    getPathDebugRoomFlags
} from '../src/view/panels/path-debug-panel.mjs';

const rooms = [
    { routingDebug: { state: 'selected' } },
    { routingDebug: { state: 'eligible' } },
    { routingDebug: { state: 'below-threshold' } },
    { routingDebug: { state: 'path-missing' } },
    { routingDebug: { state: 'room-unreachable' } },
    { routingDebug: { state: 'exit-unreachable' } },
    {}
];

assert.deepEqual(
    countPathDebugRoutingStates(rooms),
    {
        selected: 1,
        eligible: 1,
        'below-threshold': 1,
        'path-missing': 1,
        'room-unreachable': 1,
        'exit-unreachable': 1,
        pending: 1
    },
    'routing state counts should include known states and default missing debug to pending'
);

assert.equal(
    countReachablePathDebugRooms(rooms),
    2,
    'reachable room count should include eligible and selected rooms'
);

assert.equal(
    countBlockedPathDebugRooms(rooms),
    3,
    'blocked room count should include missing path, room-unreachable, and exit-unreachable states'
);

assert.deepEqual(
    countPathDebugRoutingStates([]),
    {},
    'empty room lists should produce no routing state counts'
);

assert.deepEqual(
    getPathDebugRoomFlags({
        unlocked: true,
        entered: true,
        cleared: false,
        routingDebug: { state: 'selected' }
    }),
    {
        generated: true,
        unlocked: true,
        reachable: true,
        entered: true,
        cleared: false
    },
    'selected generated rooms should expose generated, unlocked, reachable, and entered flags'
);

assert.deepEqual(
    getPathDebugRoomFlags({
        unlocked: false,
        entered: false,
        cleared: true,
        routingDebug: { state: 'cleared' }
    }),
    {
        generated: true,
        unlocked: false,
        reachable: false,
        entered: false,
        cleared: true
    },
    'cleared rooms should not be counted as currently reachable candidates'
);

assert.deepEqual(
    getPathDebugRoomFlags(null),
    {
        generated: false,
        unlocked: false,
        reachable: false,
        entered: false,
        cleared: false
    },
    'missing room data should expose inactive path debug flags'
);

console.log('path-debug-panel checks passed');
