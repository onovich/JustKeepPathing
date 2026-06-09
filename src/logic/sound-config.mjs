import {
    BGM_KERNELS,
    SOUND_EDITOR_DEFAULT_CONFIG,
    SOUND_EDITOR_MAX_TRACKS,
    SOUND_WAVE_TYPES,
    createDefaultSoundConfig,
    createFootstepTrack
} from '../data/game-config.mjs';

export function clampSoundValue(value, min, max, fallback) {
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    return Math.min(max, Math.max(min, num));
}

export function sanitizeWaveform(value, fallback = 'triangle') {
    return SOUND_WAVE_TYPES.includes(value) ? value : fallback;
}

export function sanitizeOneShotSound(rawConfig, fallback) {
    const raw = rawConfig && typeof rawConfig === 'object' ? rawConfig : {};
    return {
        waveform: sanitizeWaveform(raw.waveform, fallback.waveform),
        volume: clampSoundValue(raw.volume, 0, 0.4, fallback.volume),
        startFreq: clampSoundValue(raw.startFreq, 40, 4000, fallback.startFreq),
        endFreq: clampSoundValue(raw.endFreq, 40, 4000, fallback.endFreq),
        duration: clampSoundValue(raw.duration, 0.03, 1.2, fallback.duration),
        attack: clampSoundValue(raw.attack, 0.001, 0.25, fallback.attack),
        hold: clampSoundValue(raw.hold, 0, 0.4, fallback.hold),
        release: clampSoundValue(raw.release, 0.01, 0.9, fallback.release),
        filterCutoff: clampSoundValue(raw.filterCutoff, 120, 12000, fallback.filterCutoff),
        resonance: clampSoundValue(raw.resonance, 0.1, 16, fallback.resonance),
        vibratoRate: clampSoundValue(raw.vibratoRate, 0, 24, fallback.vibratoRate),
        vibratoDepth: clampSoundValue(raw.vibratoDepth, 0, 220, fallback.vibratoDepth),
        detune: clampSoundValue(raw.detune, 0, 48, fallback.detune),
        subMix: clampSoundValue(raw.subMix, 0, 0.75, fallback.subMix),
        distortion: clampSoundValue(raw.distortion, 0, 1, fallback.distortion),
        delayMix: clampSoundValue(raw.delayMix, 0, 0.75, fallback.delayMix),
        pan: clampSoundValue(raw.pan, -1, 1, fallback.pan)
    };
}

export function sanitizeFootstepTrack(rawConfig, fallback) {
    const track = sanitizeOneShotSound(rawConfig, fallback);
    return {
        ...track,
        enabled: rawConfig?.enabled !== undefined ? !!rawConfig.enabled : fallback.enabled,
        stepDiv: Math.round(clampSoundValue(rawConfig?.stepDiv, 1, 8, fallback.stepDiv)),
        offset: Math.round(clampSoundValue(rawConfig?.offset, 0, 7, fallback.offset))
    };
}

export function sanitizeSoundConfig(rawConfig) {
    const defaults = createDefaultSoundConfig();
    const raw = rawConfig && typeof rawConfig === 'object' ? rawConfig : {};
    const rawSounds = raw.sounds && typeof raw.sounds === 'object' ? raw.sounds : {};
    const footstepDefaults = defaults.sounds.footsteps;
    const rawTracks = Array.isArray(rawSounds.footsteps?.tracks)
        ? rawSounds.footsteps.tracks.slice(0, SOUND_EDITOR_MAX_TRACKS)
        : [];

    return {
        version: 1,
        sounds: {
            upgrade: sanitizeOneShotSound(rawSounds.upgrade, defaults.sounds.upgrade),
            chest: sanitizeOneShotSound(rawSounds.chest, defaults.sounds.chest),
            levelClear: sanitizeOneShotSound(rawSounds.levelClear, defaults.sounds.levelClear),
            enemyHit: sanitizeOneShotSound(rawSounds.enemyHit, defaults.sounds.enemyHit),
            playerHit: sanitizeOneShotSound(rawSounds.playerHit, defaults.sounds.playerHit),
            enemyDefeat: sanitizeOneShotSound(rawSounds.enemyDefeat, defaults.sounds.enemyDefeat),
            bossIntro: sanitizeOneShotSound(rawSounds.bossIntro, defaults.sounds.bossIntro),
            defeat: sanitizeOneShotSound(rawSounds.defeat, defaults.sounds.defeat),
            footsteps: {
                volume: clampSoundValue(rawSounds.footsteps?.volume, 0, 0.65, footstepDefaults.volume),
                tempo: clampSoundValue(rawSounds.footsteps?.tempo, 40, 220, footstepDefaults.tempo),
                stride: clampSoundValue(rawSounds.footsteps?.stride, 0.4, 2.5, footstepDefaults.stride),
                swing: clampSoundValue(rawSounds.footsteps?.swing, 0, 0.45, footstepDefaults.swing),
                stepBeats: clampSoundValue(rawSounds.footsteps?.stepBeats, 0.125, 2, footstepDefaults.stepBeats),
                accent: clampSoundValue(rawSounds.footsteps?.accent, 0.5, 2.5, footstepDefaults.accent),
                tracks: Array.from({ length: SOUND_EDITOR_MAX_TRACKS }, (_, index) => sanitizeFootstepTrack(
                    rawTracks[index],
                    footstepDefaults.tracks[index] || createFootstepTrack()
                ))
            },
            bgm: {
                enabled: rawSounds.bgm?.enabled !== undefined ? !!rawSounds.bgm.enabled : defaults.sounds.bgm.enabled,
                volume: clampSoundValue(rawSounds.bgm?.volume, 0, 0.5, defaults.sounds.bgm.volume),
                tempo: clampSoundValue(rawSounds.bgm?.tempo, 50, 180, defaults.sounds.bgm.tempo),
                root: Math.round(clampSoundValue(rawSounds.bgm?.root, 30, 72, defaults.sounds.bgm.root)),
                kernel: Object.prototype.hasOwnProperty.call(BGM_KERNELS, rawSounds.bgm?.kernel)
                    ? rawSounds.bgm.kernel
                    : defaults.sounds.bgm.kernel,
                brightness: clampSoundValue(rawSounds.bgm?.brightness, 0.15, 1, defaults.sounds.bgm.brightness),
                swing: clampSoundValue(rawSounds.bgm?.swing, 0, 0.45, defaults.sounds.bgm.swing),
                noteLength: clampSoundValue(rawSounds.bgm?.noteLength, 0.2, 1.4, defaults.sounds.bgm.noteLength),
                attack: clampSoundValue(rawSounds.bgm?.attack, 0.001, 0.2, defaults.sounds.bgm.attack),
                release: clampSoundValue(rawSounds.bgm?.release, 0.05, 1.2, defaults.sounds.bgm.release),
                stereoSpread: clampSoundValue(rawSounds.bgm?.stereoSpread, 0, 1, defaults.sounds.bgm.stereoSpread),
                humanize: clampSoundValue(rawSounds.bgm?.humanize, 0, 0.12, defaults.sounds.bgm.humanize),
                detune: clampSoundValue(rawSounds.bgm?.detune, 0, 36, defaults.sounds.bgm.detune)
            }
        }
    };
}

export function cloneSoundConfig(config = SOUND_EDITOR_DEFAULT_CONFIG) {
    return sanitizeSoundConfig(JSON.parse(JSON.stringify(config)));
}
