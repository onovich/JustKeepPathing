import assert from 'node:assert/strict';
import {
    EDITOR_CLOSE_ICON_SVG,
    MODEL_EDITOR_CLOSE_BUTTON_CLASS,
    configureEditorCloseButton,
    configureModelEditorHeaderButtons
} from '../src/view/editors/model-editor-chrome.mjs';

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
    const closeButton = createButton();
    assert.equal(configureEditorCloseButton(closeButton), closeButton);
    assert.equal(closeButton.className, MODEL_EDITOR_CLOSE_BUTTON_CLASS);
    assert.equal(closeButton.title, 'Close');
    assert.equal(closeButton.attributes['aria-label'], 'Close');
    assert.equal(closeButton.innerHTML, EDITOR_CLOSE_ICON_SVG);
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
    assert.equal(buttons.closeButton.className, MODEL_EDITOR_CLOSE_BUTTON_CLASS);
    assert.equal(buttons.closeButton.attributes['aria-label'], 'Close');
}

console.log('model-editor-chrome checks passed');
