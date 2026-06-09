import assert from 'node:assert/strict';
import { SOUND_EDITOR_STORAGE_KEY, createDefaultSoundConfig } from '../src/data/game-config.mjs';
import {
    SOUND_MASTER_VOLUME_FALLBACK,
    SOUND_MASTER_VOLUME_STORAGE_KEY,
    normalizeSoundMasterVolume,
    readStoredSoundConfig,
    readStoredSoundMasterVolume,
    writeStoredSoundConfig,
    writeStoredSoundMasterVolume
} from '../src/logic/sound-storage.mjs';

function createStorage(initial = {}) {
    const values = new Map(Object.entries(initial));
    return {
        values,
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            values.set(key, String(value));
        }
    };
}

function createThrowingStorage() {
    return {
        getItem() {
            throw new Error('blocked read');
        },
        setItem() {
            throw new Error('blocked write');
        }
    };
}

assert.equal(SOUND_MASTER_VOLUME_STORAGE_KEY, 'jkp-master-volume');
assert.equal(normalizeSoundMasterVolume(2), 1, 'master volume should clamp high values');
assert.equal(normalizeSoundMasterVolume(-1), 0, 'master volume should clamp low values');
assert.equal(normalizeSoundMasterVolume('bad'), SOUND_MASTER_VOLUME_FALLBACK, 'invalid master volume should fall back');

{
    const storage = createStorage({ [SOUND_MASTER_VOLUME_STORAGE_KEY]: '0.42' });
    assert.equal(readStoredSoundMasterVolume(storage), 0.42, 'stored master volume should parse');
    assert.equal(readStoredSoundMasterVolume(createStorage()), SOUND_MASTER_VOLUME_FALLBACK, 'missing master volume should fall back');
    assert.equal(readStoredSoundMasterVolume(createThrowingStorage()), SOUND_MASTER_VOLUME_FALLBACK, 'blocked master volume read should fall back');

    assert.equal(writeStoredSoundMasterVolume(storage, 4), 1, 'written master volume should normalize return value');
    assert.equal(storage.values.get(SOUND_MASTER_VOLUME_STORAGE_KEY), '1', 'written master volume should persist normalized value');
    assert.equal(writeStoredSoundMasterVolume(createThrowingStorage(), 0.25), 0.25, 'blocked master volume write should still return normalized value');
}

{
    const defaults = createDefaultSoundConfig();
    const storage = createStorage({
        [SOUND_EDITOR_STORAGE_KEY]: JSON.stringify({
            sounds: {
                upgrade: { volume: 4 },
                bgm: { enabled: false }
            }
        })
    });
    const config = readStoredSoundConfig(storage);
    assert.equal(config.sounds.upgrade.volume, 0.4, 'stored sound config should sanitize one-shot values');
    assert.equal(config.sounds.bgm.enabled, false, 'stored sound config should preserve valid boolean-ish values');

    assert.deepEqual(readStoredSoundConfig(createStorage()), defaults, 'missing stored sound config should clone defaults');
    assert.deepEqual(readStoredSoundConfig(createStorage({ [SOUND_EDITOR_STORAGE_KEY]: '{bad-json' })), defaults, 'invalid JSON should clone defaults');
    assert.deepEqual(readStoredSoundConfig(createThrowingStorage()), defaults, 'blocked sound config read should clone defaults');
}

{
    const storage = createStorage();
    const saved = writeStoredSoundConfig(storage, {
        sounds: {
            upgrade: { volume: 9 },
            bgm: { kernel: 'missing-kernel' }
        }
    });
    const raw = JSON.parse(storage.values.get(SOUND_EDITOR_STORAGE_KEY));
    assert.equal(saved.sounds.upgrade.volume, 0.4, 'saved config should return sanitized values');
    assert.equal(raw.sounds.upgrade.volume, 0.4, 'saved config should persist sanitized values');
    assert.equal(writeStoredSoundConfig(createThrowingStorage(), saved).sounds.upgrade.volume, 0.4, 'blocked config write should still return sanitized values');
}

console.log('sound-storage checks passed');
