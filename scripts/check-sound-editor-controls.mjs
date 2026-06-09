import assert from 'node:assert/strict';
import {
    formatSoundControlDisplay,
    getSoundControlId,
    renderSoundCheckboxControl,
    renderSoundSelectControl,
    renderSoundSliderControl
} from '../src/view/editors/sound-editor-controls.mjs';

assert.equal(getSoundControlId('oneshot', 'volume'), 'snd-oneshot-volume');
assert.equal(formatSoundControlDisplay(0.237, 0.005, ''), '0.24');
assert.equal(formatSoundControlDisplay(88.4, 1, 'Hz'), '88Hz');
assert.equal(formatSoundControlDisplay(1.24, 0.1, 'x'), '1.2x');

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
