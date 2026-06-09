export const COLLECTION_STORAGE_KEY = 'jkp-collection-v1';

function normalizeCollectionIds(values) {
    return [...new Set(
        (Array.isArray(values) ? values : [])
            .filter((value) => typeof value === 'string' && value.trim())
    )];
}

export function sanitizeCollection(rawCollection) {
    const safe = rawCollection && typeof rawCollection === 'object' ? rawCollection : {};

    return {
        eventRoomSeeds: normalizeCollectionIds(safe.eventRoomSeeds),
        trialRoomSeeds: normalizeCollectionIds(safe.trialRoomSeeds),
        relics: normalizeCollectionIds(safe.relics),
        finaleBosses: normalizeCollectionIds(safe.finaleBosses)
    };
}

export function readStoredCollection(storage, key = COLLECTION_STORAGE_KEY) {
    try {
        const raw = storage?.getItem?.(key);
        return sanitizeCollection(raw ? JSON.parse(raw) : null);
    } catch {
        return sanitizeCollection(null);
    }
}

export function writeStoredCollection(storage, collection, key = COLLECTION_STORAGE_KEY) {
    const sanitized = sanitizeCollection(collection);
    try {
        storage?.setItem?.(key, JSON.stringify(sanitized));
    } catch {}
    return sanitized;
}

export function countFinaleBossThemes(floorThemeDefs = {}) {
    return Object.values(floorThemeDefs)
        .filter((theme) => theme?.finale?.bossMod?.name)
        .length;
}

export function buildCollectionProgress({
    collection,
    eventSeedTotal = 0,
    trialSeedTotal = 0,
    relicTotal = 0,
    finaleBossTotal = 0
} = {}) {
    const safe = sanitizeCollection(collection);
    return {
        eventRoomSeeds: {
            found: safe.eventRoomSeeds.length,
            total: eventSeedTotal
        },
        trialRoomSeeds: {
            found: safe.trialRoomSeeds.length,
            total: trialSeedTotal
        },
        relics: {
            found: safe.relics.length,
            total: relicTotal
        },
        finaleBosses: {
            found: safe.finaleBosses.length,
            total: finaleBossTotal
        }
    };
}
