import assert from 'node:assert/strict';
import {
    appendRoomRewardDetails,
    finalizeRoomRewardMessage
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

console.log('room-reward-resolution checks passed');
