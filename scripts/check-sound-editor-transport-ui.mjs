import assert from 'node:assert/strict';
import {
    SOUND_EDITOR_PAUSE_ICON_SVG,
    SOUND_EDITOR_PLAY_ICON_SVG,
    applySoundEditorTransportState,
    buildSoundEditorTransportState,
    getSoundEditorPreviewToggleAction
} from '../src/view/editors/sound-editor-transport-ui.mjs';

function createButton() {
    const classToggles = [];
    return {
        title: '',
        innerHTML: '',
        disabled: false,
        attributes: {},
        classToggles,
        setAttribute(name, value) {
            this.attributes[name] = value;
        },
        classList: {
            toggle(name, value) {
                classToggles.push([name, value]);
            }
        }
    };
}

assert.deepEqual(
    buildSoundEditorTransportState({
        currentSoundKey: 'upgrade',
        def: { type: 'oneshot' },
        currentPreviewKey: null,
        isContinuousPreviewActive: false,
        previewPaused: false
    }),
    {
        isContinuous: false,
        isCurrentActive: false,
        isPaused: false,
        showPause: false,
        previewTitle: 'Play',
        previewAriaLabel: 'Play',
        previewIconSvg: SOUND_EDITOR_PLAY_ICON_SVG,
        stopDisabled: true
    },
    'one-shot idle transport should show play and disable stop'
);

assert.deepEqual(
    buildSoundEditorTransportState({
        currentSoundKey: 'footsteps',
        def: { type: 'loop' },
        currentPreviewKey: 'footsteps',
        isContinuousPreviewActive: true,
        previewPaused: false
    }),
    {
        isContinuous: true,
        isCurrentActive: true,
        isPaused: false,
        showPause: true,
        previewTitle: 'Pause',
        previewAriaLabel: 'Pause',
        previewIconSvg: SOUND_EDITOR_PAUSE_ICON_SVG,
        stopDisabled: false
    },
    'active continuous transport should show pause and enable stop'
);

assert.equal(
    buildSoundEditorTransportState({
        currentSoundKey: 'footsteps',
        def: { type: 'loop' },
        currentPreviewKey: 'footsteps',
        isContinuousPreviewActive: true,
        previewPaused: true
    }).previewTitle,
    'Play',
    'paused continuous transport should show play'
);

assert.equal(
    getSoundEditorPreviewToggleAction({
        currentSoundKey: 'upgrade',
        def: { type: 'oneshot' },
        currentPreviewKey: null,
        isContinuousPreviewActive: false,
        previewPaused: false
    }),
    'preview',
    'one-shot toggle should always start a preview'
);

assert.equal(
    getSoundEditorPreviewToggleAction({
        currentSoundKey: 'footsteps',
        def: { type: 'loop' },
        currentPreviewKey: 'footsteps',
        isContinuousPreviewActive: true,
        previewPaused: false
    }),
    'pause',
    'active continuous toggle should pause'
);

assert.equal(
    getSoundEditorPreviewToggleAction({
        currentSoundKey: 'footsteps',
        def: { type: 'loop' },
        currentPreviewKey: 'footsteps',
        isContinuousPreviewActive: true,
        previewPaused: true
    }),
    'resume',
    'paused continuous toggle should resume'
);

assert.equal(
    getSoundEditorPreviewToggleAction({
        currentSoundKey: 'bgm',
        def: { type: 'bgm' },
        currentPreviewKey: 'footsteps',
        isContinuousPreviewActive: false,
        previewPaused: true
    }),
    'preview',
    'inactive current sound should start a fresh preview'
);

{
    const previewButton = createButton();
    const stopPreviewButton = createButton();
    applySoundEditorTransportState({
        previewButton,
        stopPreviewButton,
        state: buildSoundEditorTransportState({ def: { type: 'oneshot' } })
    });
    assert.equal(previewButton.title, 'Play');
    assert.equal(previewButton.attributes['aria-label'], 'Play');
    assert.equal(previewButton.innerHTML, SOUND_EDITOR_PLAY_ICON_SVG);
    assert.equal(stopPreviewButton.disabled, true);
    assert.deepEqual(stopPreviewButton.classToggles, [
        ['opacity-40', true],
        ['cursor-not-allowed', true]
    ]);
}

console.log('sound-editor-transport-ui checks passed');
