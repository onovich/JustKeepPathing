import assert from 'node:assert/strict';
import {
    getHiddenRoomInteractionAccent,
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

console.log('hidden-room-resolution checks passed');
