import assert from 'node:assert/strict';
import {
    EDITOR_CLOSE_ICON_SVG,
    EDITOR_SECONDARY_ICON_BUTTON_CLASS,
    EDITOR_STOP_ICON_SVG
} from '../src/view/editors/editor-chrome.mjs';
import {
    SOUND_EDITOR_PREVIEW_BUTTON_CLASS,
    configureSoundEditorTransportButtons
} from '../src/view/editors/sound-editor-chrome.mjs';

function createButton() {
    return {
        className: '',
        innerHTML: '',
        textContent: '',
        title: '',
        attributes: {},
        setAttribute(name, value) {
            this.attributes[name] = value;
        }
    };
}

const buttons = {
    previewButton: createButton(),
    stopPreviewButton: createButton(),
    readButton: createButton(),
    resetButton: createButton(),
    saveButton: createButton(),
    closeButton: createButton()
};

configureSoundEditorTransportButtons(buttons);

assert.equal(buttons.previewButton.className, SOUND_EDITOR_PREVIEW_BUTTON_CLASS);
assert.equal(buttons.stopPreviewButton.className, EDITOR_SECONDARY_ICON_BUTTON_CLASS);
assert.equal(buttons.stopPreviewButton.title, 'Stop');
assert.equal(buttons.stopPreviewButton.attributes['aria-label'], 'Stop');
assert.equal(buttons.stopPreviewButton.innerHTML, EDITOR_STOP_ICON_SVG);
assert.equal(buttons.readButton.textContent, 'Load');
assert.equal(buttons.resetButton.textContent, 'Reset');
assert.equal(buttons.saveButton.textContent, 'Save');
assert.equal(buttons.closeButton.className, EDITOR_SECONDARY_ICON_BUTTON_CLASS);
assert.equal(buttons.closeButton.title, 'Close');
assert.equal(buttons.closeButton.attributes['aria-label'], 'Close');
assert.equal(buttons.closeButton.innerHTML, EDITOR_CLOSE_ICON_SVG);

console.log('sound-editor-chrome checks passed');
