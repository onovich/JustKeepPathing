import assert from 'node:assert/strict';
import {
    SOUND_EDITOR_MAX_TRACKS,
    createDefaultSoundConfig
} from '../src/data/game-config.mjs';
import {
    clampSoundValue,
    cloneSoundConfig,
    sanitizeFootstepTrack,
    sanitizeOneShotSound,
    sanitizeSoundConfig,
    sanitizeWaveform
} from '../src/logic/sound-config.mjs';

const defaults = createDefaultSoundConfig();

assert.equal(clampSoundValue('bad', 0, 1, 0.5), 0.5, 'invalid numeric values should fall back');
assert.equal(clampSoundValue(-2, 0, 1, 0.5), 0, 'values below the minimum should clamp');
assert.equal(clampSoundValue(2, 0, 1, 0.5), 1, 'values above the maximum should clamp');
assert.equal(sanitizeWaveform('square', 'triangle'), 'square', 'valid waveforms should be preserved');
assert.equal(sanitizeWaveform('noise', 'triangle'), 'triangle', 'invalid waveforms should fall back');

{
    const sound = sanitizeOneShotSound({
        waveform: 'bad',
        volume: 2,
        startFreq: 12,
        endFreq: 9000,
        duration: 'nope',
        pan: -3
    }, defaults.sounds.upgrade);

    assert.equal(sound.waveform, defaults.sounds.upgrade.waveform, 'invalid one-shot waveform should fall back');
    assert.equal(sound.volume, 0.4, 'one-shot volume should clamp to its maximum');
    assert.equal(sound.startFreq, 40, 'one-shot start frequency should clamp to its minimum');
    assert.equal(sound.endFreq, 4000, 'one-shot end frequency should clamp to its maximum');
    assert.equal(sound.duration, defaults.sounds.upgrade.duration, 'invalid duration should fall back');
    assert.equal(sound.pan, -1, 'one-shot pan should clamp to its minimum');
}

{
    const fallback = defaults.sounds.footsteps.tracks[0];
    const track = sanitizeFootstepTrack({
        enabled: 0,
        stepDiv: 7.6,
        offset: 99,
        waveform: 'sawtooth'
    }, fallback);

    assert.equal(track.enabled, false, 'track enabled should coerce to boolean');
    assert.equal(track.stepDiv, 8, 'track step division should round after clamping');
    assert.equal(track.offset, 7, 'track offset should clamp to maximum');
    assert.equal(track.waveform, 'sawtooth', 'valid track waveform should be preserved');
}

{
    const rawTracks = Array.from({ length: SOUND_EDITOR_MAX_TRACKS + 2 }, (_, index) => ({
        enabled: index % 2 === 0,
        volume: 0.02 * (index + 1),
        stepDiv: index + 1,
        offset: index
    }));
    const config = sanitizeSoundConfig({
        sounds: {
            upgrade: { volume: -1, waveform: 'triangle' },
            footsteps: {
                volume: 9,
                tempo: 999,
                stride: 0,
                tracks: rawTracks
            },
            bgm: {
                enabled: 0,
                volume: 9,
                tempo: 10,
                root: 41.7,
                kernel: 'missing-kernel',
                detune: 99
            }
        }
    });

    assert.equal(config.version, 1, 'sanitized sound config should keep version 1');
    assert.equal(config.sounds.upgrade.volume, 0, 'one-shot config should sanitize through nested sounds');
    assert.equal(config.sounds.footsteps.volume, 0.65, 'footstep volume should clamp');
    assert.equal(config.sounds.footsteps.tempo, 220, 'footstep tempo should clamp');
    assert.equal(config.sounds.footsteps.stride, 0.4, 'footstep stride should clamp');
    assert.equal(config.sounds.footsteps.tracks.length, SOUND_EDITOR_MAX_TRACKS, 'tracks should be capped to the editor max');
    assert.equal(config.sounds.bgm.enabled, false, 'BGM enabled should coerce to boolean');
    assert.equal(config.sounds.bgm.volume, 0.5, 'BGM volume should clamp');
    assert.equal(config.sounds.bgm.tempo, 50, 'BGM tempo should clamp');
    assert.equal(config.sounds.bgm.root, 42, 'BGM root should round after clamping');
    assert.equal(config.sounds.bgm.kernel, defaults.sounds.bgm.kernel, 'invalid BGM kernel should fall back');
    assert.equal(config.sounds.bgm.detune, 36, 'BGM detune should clamp');
}

{
    const original = createDefaultSoundConfig();
    const cloned = cloneSoundConfig(original);
    cloned.sounds.upgrade.volume = 0.01;
    assert.notEqual(original.sounds.upgrade.volume, cloned.sounds.upgrade.volume, 'cloneSoundConfig should deep clone config data');
}

assert.deepEqual(
    sanitizeSoundConfig(null),
    defaults,
    'invalid sound config roots should sanitize to defaults'
);

console.log('sound-config checks passed');
