import assert from 'node:assert/strict';
import {
    appendRoomRewardDetails,
    finalizeRoomRewardMessage,
    resolveHiddenRoomRewardMessage
} from '../src/logic/room-reward-resolution.mjs';

assert.equal(
    appendRoomRewardDetails('Room cleared.', ['Theme bonus.']),
    'Room cleared. Theme bonus.',
    'reward details should append with one separating space'
);

assert.equal(
    appendRoomRewardDetails('Room cleared.', ['', null, undefined, 'Extra supply.']),
    'Room cleared. Extra supply.',
    'empty reward details should be skipped'
);

assert.equal(
    appendRoomRewardDetails('Elite cleared.', ['Relic dropped.', 'Theme bonus.']),
    'Elite cleared. Relic dropped. Theme bonus.',
    'reward details should keep their append order'
);

assert.equal(
    appendRoomRewardDetails('', ['Theme bonus.']),
    'Theme bonus.',
    'reward details should work without a base message'
);

{
    let updateCount = 0;
    const message = finalizeRoomRewardMessage({
        message: 'Trial completed.',
        details: ['Added 1 supply.'],
        updateUI: () => {
            updateCount += 1;
        }
    });

    assert.equal(message, 'Trial completed. Added 1 supply.');
    assert.equal(updateCount, 1, 'reward finalization should refresh UI exactly once');
}

{
    let updateCount = 0;
    const message = finalizeRoomRewardMessage({
        message: 'Event completed.',
        updateUI: () => {
            updateCount += 1;
        }
    });

    assert.equal(message, 'Event completed.');
    assert.equal(updateCount, 1, 'reward finalization should refresh UI even without details');
}

{
    let updateCount = 0;
    let themeCall = null;
    const room = { id: 'room-1', rewardTier: 3 };
    const anchorPos = { x: 1, y: 2, z: 3 };
    const message = resolveHiddenRoomRewardMessage({
        sourceKey: 'elite',
        room,
        anchorPos,
        message: 'Elite cleared.',
        details: ['Relic dropped.'],
        applyThemeChainBonus: (sourceKey, receivedRoom, receivedAnchorPos) => {
            themeCall = { sourceKey, receivedRoom, receivedAnchorPos };
            return 'Theme bonus.';
        },
        updateUI: () => {
            updateCount += 1;
        }
    });

    assert.equal(message, 'Elite cleared. Relic dropped. Theme bonus.');
    assert.equal(updateCount, 1, 'hidden room reward finalization should refresh UI exactly once');
    assert.deepEqual(
        themeCall,
        { sourceKey: 'elite', receivedRoom: room, receivedAnchorPos: anchorPos },
        'hidden room reward finalization should route source, room, and anchor to theme-chain bonus'
    );
}

{
    const message = resolveHiddenRoomRewardMessage({
        sourceKey: 'treasure',
        room: { id: 'room-2' },
        message: '',
        applyThemeChainBonus: () => 'Theme-only bonus.'
    });

    assert.equal(
        message,
        'Theme-only bonus.',
        'hidden room reward finalization should surface theme-chain text even without a base message'
    );
}

console.log('room-reward-resolution checks passed');
