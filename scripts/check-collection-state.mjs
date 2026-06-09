import assert from 'node:assert/strict';
import {
    COLLECTION_STORAGE_KEY,
    buildCollectionProgress,
    countFinaleBossThemes,
    readStoredCollection,
    sanitizeCollection,
    writeStoredCollection
} from '../src/logic/collection-state.mjs';

function createStorage(initial = {}) {
    const values = new Map(Object.entries(initial));
    return {
        values,
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            values.set(key, value);
        }
    };
}

assert.equal(COLLECTION_STORAGE_KEY, 'jkp-collection-v1');

assert.deepEqual(
    sanitizeCollection({
        eventRoomSeeds: ['repair_shrine', 'repair_shrine', '', 42, 'scout_beacon'],
        trialRoomSeeds: ['overclock_array', null, 'overclock_array'],
        relics: ['pathfinder_lens', ' '],
        finaleBosses: ['ember_forge', 'salvage_reaches', 'ember_forge']
    }),
    {
        eventRoomSeeds: ['repair_shrine', 'scout_beacon'],
        trialRoomSeeds: ['overclock_array'],
        relics: ['pathfinder_lens'],
        finaleBosses: ['ember_forge', 'salvage_reaches']
    },
    'collection sanitizing should keep unique non-empty ids by bucket'
);

assert.deepEqual(
    readStoredCollection(createStorage({
        [COLLECTION_STORAGE_KEY]: JSON.stringify({
            eventRoomSeeds: ['repair_shrine'],
            trialRoomSeeds: ['overclock_array'],
            relics: ['pathfinder_lens'],
            finaleBosses: ['ember_forge']
        })
    })),
    {
        eventRoomSeeds: ['repair_shrine'],
        trialRoomSeeds: ['overclock_array'],
        relics: ['pathfinder_lens'],
        finaleBosses: ['ember_forge']
    },
    'stored collection should parse from local storage'
);

assert.deepEqual(
    readStoredCollection(createStorage({ [COLLECTION_STORAGE_KEY]: '{bad-json' })),
    sanitizeCollection(null),
    'invalid stored collection JSON should fall back to an empty collection'
);

const blockedStorage = {
    getItem() {
        throw new Error('blocked');
    },
    setItem() {
        throw new Error('blocked');
    }
};
assert.deepEqual(
    readStoredCollection(blockedStorage),
    sanitizeCollection(null),
    'blocked storage reads should fall back to an empty collection'
);
assert.deepEqual(
    writeStoredCollection(blockedStorage, { eventRoomSeeds: ['repair_shrine'] }),
    {
        eventRoomSeeds: ['repair_shrine'],
        trialRoomSeeds: [],
        relics: [],
        finaleBosses: []
    },
    'blocked storage writes should still return the sanitized collection'
);

const storage = createStorage();
const written = writeStoredCollection(storage, {
    eventRoomSeeds: ['repair_shrine', 'repair_shrine'],
    trialRoomSeeds: ['overclock_array'],
    relics: ['pathfinder_lens'],
    finaleBosses: ['ember_forge']
});
assert.deepEqual(
    written,
    {
        eventRoomSeeds: ['repair_shrine'],
        trialRoomSeeds: ['overclock_array'],
        relics: ['pathfinder_lens'],
        finaleBosses: ['ember_forge']
    },
    'written collection should be sanitized before returning'
);
assert.deepEqual(
    JSON.parse(storage.values.get(COLLECTION_STORAGE_KEY)),
    written,
    'written collection should persist sanitized JSON'
);

assert.equal(
    countFinaleBossThemes({
        ember: { finale: { bossMod: { name: 'boss' } } },
        empty: { finale: {} },
        none: {}
    }),
    1,
    'finale boss themes should count only themes with boss names'
);

assert.deepEqual(
    buildCollectionProgress({
        collection: written,
        eventSeedTotal: 8,
        trialSeedTotal: 6,
        relicTotal: 6,
        finaleBossTotal: 4
    }),
    {
        eventRoomSeeds: { found: 1, total: 8 },
        trialRoomSeeds: { found: 1, total: 6 },
        relics: { found: 1, total: 6 },
        finaleBosses: { found: 1, total: 4 }
    },
    'collection progress should report found counts against provided totals'
);

console.log('collection-state checks passed');
