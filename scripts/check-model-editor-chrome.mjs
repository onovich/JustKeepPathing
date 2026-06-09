import assert from 'node:assert/strict';
import {
    configureModelEditorHeaderButtons
} from '../src/view/editors/model-editor-chrome.mjs';
import {
    EDITOR_CLOSE_ICON_SVG,
    EDITOR_SECONDARY_ICON_BUTTON_CLASS
} from '../src/view/editors/editor-chrome.mjs';

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

{
    const buttons = {
        undoButton: createButton(),
        readButton: createButton(),
        resetButton: createButton(),
        saveButton: createButton(),
        closeButton: createButton()
    };

    configureModelEditorHeaderButtons(buttons);

    assert.equal(buttons.undoButton.textContent, 'Undo');
    assert.equal(buttons.readButton.textContent, 'Load');
    assert.equal(buttons.resetButton.textContent, 'Reset');
    assert.equal(buttons.saveButton.textContent, 'Save');
    assert.equal(buttons.closeButton.className, EDITOR_SECONDARY_ICON_BUTTON_CLASS);
    assert.equal(buttons.closeButton.title, 'Close');
    assert.equal(buttons.closeButton.attributes['aria-label'], 'Close');
    assert.equal(buttons.closeButton.innerHTML, EDITOR_CLOSE_ICON_SVG);
}

console.log('model-editor-chrome checks passed');
