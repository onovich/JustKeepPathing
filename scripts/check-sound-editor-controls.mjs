import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    applySoundEditorControls,
    buildBgmKernelOptions,
    buildSoundTrackOptions,
    buildSoundWaveOptions,
    formatSoundControlDisplay,
    formatSoundRangeControlValue,
    getSoundControlId,
    renderSoundBgmControls,
    renderSoundCheckboxControl,
    renderSoundControlsForDefinition,
    renderSoundLoopControls,
    renderSoundOneShotControls,
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

{
    assert.deepEqual(buildSoundWaveOptions(['sine', 'square']), [
        { value: 'sine', label: 'sine' },
        { value: 'square', label: 'square' }
    ]);
    assert.deepEqual(buildSoundTrackOptions([{}, {}]), [
        { value: '0', label: '音轨 1' },
        { value: '1', label: '音轨 2' }
    ]);
    assert.deepEqual(buildBgmKernelOptions({
        warmPop: { label: 'Warm Pop' },
        glass: { label: 'Glass' }
    }), [
        { value: 'warmPop', label: 'Warm Pop' },
        { value: 'glass', label: 'Glass' }
    ]);
}

const oneShotSound = {
    waveform: 'square',
    volume: 0.12,
    startFreq: 420,
    endFreq: 760,
    duration: 0.18,
    filterCutoff: 3200,
    attack: 0.005,
    hold: 0.02,
    release: 0.14,
    resonance: 3,
    vibratoRate: 0,
    vibratoDepth: 0,
    detune: 8,
    subMix: 0.12,
    distortion: 0.02,
    delayMix: 0.12,
    pan: 0
};

{
    const markup = renderSoundOneShotControls({
        sound: oneShotSound,
        waveTypes: ['sine', 'square']
    });

    assert.match(markup, /id="snd-oneshot-waveform"/);
    assert.match(markup, /value="square" selected>square/);
    assert.match(markup, /id="snd-oneshot-startFreq-value">420Hz/);
    assert.match(markup, /data-group="oneshot"/);
}

const loopSound = {
    volume: 0.28,
    tempo: 132,
    stride: 1,
    swing: 0.06,
    stepBeats: 0.5,
    accent: 1.16,
    tracks: [
        {
            enabled: true,
            waveform: 'square',
            volume: 0.12,
            startFreq: 168,
            endFreq: 84,
            duration: 0.07,
            attack: 0.002,
            hold: 0.01,
            release: 0.06,
            filterCutoff: 900,
            resonance: 2.4,
            detune: 0,
            distortion: 0.03,
            pan: -0.14,
            stepDiv: 1,
            offset: 0
        },
        {
            enabled: false,
            waveform: 'triangle',
            volume: 0.09,
            startFreq: 410,
            endFreq: 220,
            duration: 0.05,
            attack: 0.002,
            hold: 0.01,
            release: 0.06,
            filterCutoff: 2100,
            resonance: 2.4,
            detune: 0,
            distortion: 0.03,
            pan: 0.16,
            stepDiv: 2,
            offset: 1
        }
    ]
};

{
    const markup = renderSoundLoopControls({
        sound: loopSound,
        currentTrackIndex: 1,
        waveTypes: ['square', 'triangle']
    });

    assert.match(markup, /最多 5 条/);
    assert.match(markup, /value="1" selected>音轨 2/);
    assert.match(markup, /id="snd-track-enabled"/);
    assert.match(markup, /id="snd-track-volume-value">0\.09/);
}

const bgmSound = {
    enabled: true,
    kernel: 'warmPop',
    volume: 0.15,
    tempo: 92,
    root: 45,
    brightness: 0.58,
    swing: 0.08,
    noteLength: 0.8,
    attack: 0.012,
    release: 0.28,
    stereoSpread: 0.34,
    humanize: 0.02,
    detune: 9
};

{
    const markup = renderSoundBgmControls({
        bgm: bgmSound,
        bgmKernels: {
            warmPop: { label: 'Warm Pop' },
            glass: { label: 'Glass' }
        }
    });

    assert.match(markup, /id="snd-bgm-enabled"/);
    assert.match(markup, /id="snd-bgm-kernel"/);
    assert.match(markup, /value="warmPop" selected>Warm Pop/);
    assert.match(markup, /id="snd-bgm-tempo-value">92 BPM/);
}

{
    assert.match(
        renderSoundControlsForDefinition({
            def: { type: 'oneshot' },
            sound: oneShotSound,
            waveTypes: ['square']
        }),
        /snd-oneshot-waveform/
    );
    assert.match(
        renderSoundControlsForDefinition({
            def: { type: 'loop' },
            sound: loopSound,
            currentTrackIndex: 0,
            waveTypes: ['square']
        }),
        /snd-loop-tempo/
    );
    assert.match(
        renderSoundControlsForDefinition({
            def: { type: 'bgm' },
            sound: bgmSound,
            bgmKernels: { warmPop: { label: 'Warm Pop' } }
        }),
        /snd-bgm-kernel/
    );
}

{
    const controlsEl = { innerHTML: '' };
    const markup = applySoundEditorControls({
        controlsEl,
        def: { type: 'bgm' },
        sound: bgmSound,
        bgmKernels: { warmPop: { label: 'Warm Pop' } }
    });

    assert.equal(controlsEl.innerHTML, markup);
    assert.match(markup, /snd-bgm-kernel/);
    assert.equal(applySoundEditorControls({ controlsEl: null }), '');
}

{
    const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const soundEditorStart = indexHtml.indexOf('class SoundEditor');
    const soundEditorEnd = indexHtml.indexOf('window.onload', soundEditorStart);
    const soundEditorClass = indexHtml.slice(soundEditorStart, soundEditorEnd);

    assert.match(
        soundEditorClass,
        /applySoundEditorControls\(\{[\s\S]*?controlsEl: this\.controlsEl[\s\S]*?sound: this\.getCurrentSoundConfig\(\)[\s\S]*?waveTypes: SOUND_WAVE_TYPES[\s\S]*?bgmKernels: BGM_KERNELS[\s\S]*?\}\);/,
        'SoundEditor.render should route control group markup through sound-editor-controls'
    );
    assert.doesNotMatch(
        soundEditorClass,
        /renderOneShotControls|renderLoopControls|renderBgmControls|sliderMarkup|selectMarkup|checkboxMarkup|controlsEl\.innerHTML = `/,
        'SoundEditor should not own sound control group templates'
    );
}

console.log('sound-editor-controls checks passed');
