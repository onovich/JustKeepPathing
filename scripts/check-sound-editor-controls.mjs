import assert from 'node:assert/strict';
import {
    formatSoundControlDisplay,
    formatSoundRangeControlValue,
    getSoundControlId,
    renderSoundCheckboxControl,
    renderSoundSelectControl,
    renderSoundSliderControl
} from '../src/view/editors/sound-editor-controls.mjs';

assert.equal(getSoundControlId('oneshot', 'volume'), 'snd-oneshot-volume');
assert.equal(formatSoundControlDisplay(0.237, 0.005, ''), '0.24');
assert.equal(formatSoundControlDisplay(88.4, 1, 'Hz'), '88Hz');
assert.equal(formatSoundControlDisplay(1.24, 0.1, 'x'), '1.2x');
assert.equal(formatSoundRangeControlValue({ id: 'snd-bgm-tempo', value: '91.6', step: '1' }), '92 BPM');
assert.equal(formatSoundRangeControlValue({ id: 'snd-track-filterCutoff', value: '1588.4', step: '10' }), '1588Hz');
assert.equal(formatSoundRangeControlValue({ id: 'snd-track-attack', value: '0.0123', step: '0.001' }), '0.012s');
assert.equal(formatSoundRangeControlValue({ id: 'snd-bgm-root', value: '44.6', step: '1' }), '45 MIDI');
assert.equal(formatSoundRangeControlValue({ id: 'snd-loop-stepBeats', value: '0.375', step: '0.125' }), '0.375 \u62cd');
assert.equal(formatSoundRangeControlValue({ id: 'snd-bgm-noteLength', value: '0.875', step: '0.01' }), '0.88x');
assert.equal(formatSoundRangeControlValue({ id: 'snd-bgm-detune', value: '8.6', step: '1' }), '9c');
assert.equal(formatSoundRangeControlValue({ id: 'snd-oneshot-volume', value: '0.314', step: '0.01' }), '0.31');

{
    const markup = renderSoundSliderControl({
        label: 'Volume',
        field: 'volume',
        value: 0.25,
        min: 0,
        max: 0.4,
        step: 0.005,
        unit: '',
        group: 'oneshot'
    });
    assert.match(markup, /for="snd-oneshot-volume"/);
    assert.match(markup, /id="snd-oneshot-volume-value">0\.25</);
    assert.match(markup, /data-group="oneshot"/);
    assert.match(markup, /data-field="volume"/);
    assert.match(markup, /type="range"/);
}

{
    const markup = renderSoundSelectControl({
        label: 'Wave',
        field: 'waveform',
        value: 'square',
        group: 'track',
        options: [
            { value: 'sine', label: 'sine' },
            { value: 'square', label: 'square' }
        ]
    });
    assert.match(markup, /id="snd-track-waveform"/);
    assert.match(markup, /value="square" selected>square/);
}

{
    const markup = renderSoundCheckboxControl({
        label: 'Enabled',
        field: 'enabled',
        checked: true,
        group: 'bgm'
    });
    assert.match(markup, /id="snd-bgm-enabled"/);
    assert.match(markup, /type="checkbox"/);
    assert.match(markup, /checked/);
}

console.log('sound-editor-controls checks passed');
