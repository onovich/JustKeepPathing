import { SOUND_EDITOR_STORAGE_KEY } from '../data/game-config.mjs';
import {
    cloneSoundConfig,
    clampSoundValue,
    sanitizeSoundConfig
} from './sound-config.mjs';

export const SOUND_MASTER_VOLUME_STORAGE_KEY = 'jkp-master-volume';
export const SOUND_MASTER_VOLUME_FALLBACK = 0.9;

export function normalizeSoundMasterVolume(value, fallback = SOUND_MASTER_VOLUME_FALLBACK) {
    return clampSoundValue(value, 0, 1, fallback);
}

export function readStoredSoundMasterVolume(storage, {
    key = SOUND_MASTER_VOLUME_STORAGE_KEY,
    fallback = SOUND_MASTER_VOLUME_FALLBACK
} = {}) {
    try {
        const raw = storage?.getItem?.(key);
        if (raw === null || raw === undefined) return fallback;
        return normalizeSoundMasterVolume(raw, fallback);
    } catch {
        return fallback;
    }
}

export function writeStoredSoundMasterVolume(storage, value, {
    key = SOUND_MASTER_VOLUME_STORAGE_KEY,
    fallback = SOUND_MASTER_VOLUME_FALLBACK
} = {}) {
    const normalized = normalizeSoundMasterVolume(value, fallback);
    try {
        storage?.setItem?.(key, String(normalized));
    } catch {}
    return normalized;
}

export function readStoredSoundConfig(storage, {
    key = SOUND_EDITOR_STORAGE_KEY
} = {}) {
    try {
        const raw = storage?.getItem?.(key);
        if (!raw) return cloneSoundConfig();
        return sanitizeSoundConfig(JSON.parse(raw));
    } catch {
        return cloneSoundConfig();
    }
}

export function writeStoredSoundConfig(storage, config, {
    key = SOUND_EDITOR_STORAGE_KEY
} = {}) {
    const sanitized = sanitizeSoundConfig(config);
    try {
        storage?.setItem?.(key, JSON.stringify(sanitized));
    } catch {}
    return sanitized;
}
