import assert from 'node:assert/strict';
import {
    appendRoomRewardDetails,
    formatRunRelicRewardMessage,
    finalizeRoomRewardMessage,
    resolveEchoEngineEventBonus,
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

assert.deepEqual(
    resolveEchoEngineEventBonus({
        hasEchoEngine: false,
        currentNextFloorAttackBonus: 0.12,
        attackBonus: 0.08
    }),
    {
        applied: false,
        nextFloorAttackBonus: 0.12,
        message: ''
    },
    'Echo Engine event bonus should leave next-floor attack untouched when the relic is missing'
);

assert.deepEqual(
    resolveEchoEngineEventBonus({
        hasEchoEngine: true,
        currentNextFloorAttackBonus: 0.12,
        attackBonus: 0.08
    }),
    {
        applied: true,
        nextFloorAttackBonus: 0.2,
        message: 'Echo Engine preheated next-floor attack by 8%.'
    },
    'Echo Engine event bonus should append visible text and add the calculated attack bonus'
);

assert.deepEqual(
    resolveEchoEngineEventBonus({
        hasEchoEngine: true,
        currentNextFloorAttackBonus: 0.3,
        attackBonus: 0.08,
        cap: 0.32
    }),
    {
        applied: true,
        nextFloorAttackBonus: 0.32,
        message: 'Echo Engine preheated next-floor attack by 8%.'
    },
    'Echo Engine event bonus should preserve the current cap'
);

assert.equal(
    formatRunRelicRewardMessage({
        contextLabel: 'Elite Room',
        result: {
            status: 'added',
            relic: {
                label: 'Echo Engine',
                shortLabel: 'next floor attack rises'
            },
            bonusScore: 0
        }
    }),
    'Elite Room 掉出了核心「Echo Engine」，next floor attack rises',
    'run relic added rewards should include context, relic label, and short label'
);

assert.equal(
    formatRunRelicRewardMessage({
        result: { status: 'duplicate', relic: null, bonusScore: 120 }
    }),
    '这枚核心你已经拿过了，转化成了 120 魂能。',
    'duplicate run relic rewards should convert into visible score text'
);

assert.equal(
    formatRunRelicRewardMessage({
        result: { status: 'empty-pool', relic: null, bonusScore: 90 }
    }),
    '当前核心池没有新的可用核心，额外掉落转化成了 90 魂能。',
    'empty relic pools should explain that no new core is available'
);

assert.equal(
    formatRunRelicRewardMessage({
        result: { status: 'overflow', relic: null, bonusScore: 75 }
    }),
    '核心槽已经装满，额外掉落转化成了 75 魂能。',
    'overflow run relic rewards should explain full slots'
);

assert.equal(
    formatRunRelicRewardMessage({
        result: { status: 'miss', relic: null, bonusScore: 0 }
    }),
    '',
    'missed run relic rolls should stay silent'
);

console.log('room-reward-resolution checks passed');
