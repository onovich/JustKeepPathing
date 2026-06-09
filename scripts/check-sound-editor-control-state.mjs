import assert from 'node:assert/strict';
import { createDefaultSoundConfig } from '../src/data/game-config.mjs';
import {
    applySoundEditorControlState,
    applySoundEditorControlValue,
    getSoundEditorControlTarget,
    readSoundEditorControlRawValue
} from '../src/view/editors/sound-editor-control-state.mjs';

function createControl({ group, field, type = 'range', value = '', checked = false }) {
    return {
        dataset: { group, field },
        type,
        value,
        checked
    };
}

assert.deepEqual(getSoundEditorControlTarget(createControl({ group: 'oneshot', field: 'volume' })), {
    group: 'oneshot',
    field: 'volume'
});
assert.deepEqual(getSoundEditorControlTarget(null), { group: '', field: '' });
assert.equal(readSoundEditorControlRawValue(createControl({ group: 'track', field: 'enabled', type: 'checkbox', checked: true })), true);
assert.equal(readSoundEditorControlRawValue(createControl({ group: 'oneshot', field: 'volume', value: '0.31' })), '0.31');

{
    const config = createDefaultSoundConfig();
    const result = applySoundEditorControlState({
        workingConfig: config,
        currentSoundKey: 'upgrade',
        group: '',
        field: '',
        rawValue: '0.2'
    });
    assert.equal(result.hasControlTarget, false);
    assert.equal(result.workingConfig.sounds.upgrade.volume, 0.12);
}

{
    const config = createDefaultSoundConfig();
    const result = applySoundEditorControlValue({
        workingConfig: config,
        currentSoundKey: 'upgrade',
        currentTrackIndex: 0,
        control: createControl({ group: 'oneshot', field: 'volume', value: '0.31' })
    });
    assert.equal(result.hasControlTarget, true);
    assert.equal(result.workingConfig.sounds.upgrade.volume, 0.31);
}

{
    const config = createDefaultSoundConfig();
    applySoundEditorControlState({
        workingConfig: config,
        currentSoundKey: 'upgrade',
        group: 'oneshot',
        field: 'waveform',
        rawValue: 'square'
    });
    assert.equal(config.sounds.upgrade.waveform, 'square');
}

{
    const config = createDefaultSoundConfig();
    applySoundEditorControlState({
        workingConfig: config,
        currentSoundKey: 'footsteps',
        group: 'loop',
        field: 'tempo',
        rawValue: '144'
    });
    assert.equal(config.sounds.footsteps.tempo, 144);
}

{
    const config = createDefaultSoundConfig();
    applySoundEditorControlValue({
        workingConfig: config,
        currentSoundKey: 'footsteps',
        currentTrackIndex: 1,
        control: createControl({ group: 'track', field: 'enabled', type: 'checkbox', checked: false })
    });
    assert.equal(config.sounds.footsteps.tracks[1].enabled, false);

    applySoundEditorControlState({
        workingConfig: config,
        currentSoundKey: 'footsteps',
        currentTrackIndex: 1,
        group: 'track',
        field: 'waveform',
        rawValue: 'sawtooth'
    });
    assert.equal(config.sounds.footsteps.tracks[1].waveform, 'sawtooth');
}

{
    const config = createDefaultSoundConfig();
    applySoundEditorControlValue({
        workingConfig: config,
        currentSoundKey: 'bgm',
        currentTrackIndex: 0,
        control: createControl({ group: 'bgm', field: 'enabled', type: 'checkbox', checked: false })
    });
    assert.equal(config.sounds.bgm.enabled, false);

    applySoundEditorControlState({
        workingConfig: config,
        currentSoundKey: 'bgm',
        group: 'bgm',
        field: 'kernel',
        rawValue: 'nightCruise'
    });
    assert.equal(config.sounds.bgm.kernel, 'nightCruise');
}

{
    const config = createDefaultSoundConfig();
    const result = applySoundEditorControlState({
        workingConfig: config,
        currentSoundKey: 'footsteps',
        currentTrackIndex: 0,
        group: 'meta',
        field: 'trackIndex',
        rawValue: '3'
    });
    assert.equal(result.currentTrackIndex, 3);
    assert.equal(result.workingConfig, config);
}

console.log('sound-editor-control-state checks passed');
