import assert from 'node:assert/strict';
import {
    EDITOR_CLOSE_ICON_SVG,
    EDITOR_SECONDARY_ICON_BUTTON_CLASS,
    EDITOR_STOP_ICON_SVG,
    configureEditorCloseButton,
    configureEditorStopButton,
    configureIconButton,
    setButtonTexts
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
    const button = createButton();
    assert.equal(configureEditorCloseButton(button), button);
    assert.equal(button.className, EDITOR_SECONDARY_ICON_BUTTON_CLASS);
    assert.equal(button.title, 'Close');
    assert.equal(button.attributes['aria-label'], 'Close');
    assert.equal(button.innerHTML, EDITOR_CLOSE_ICON_SVG);
}

{
    const button = createButton();
    configureEditorStopButton(button);
    assert.equal(button.className, EDITOR_SECONDARY_ICON_BUTTON_CLASS);
    assert.equal(button.title, 'Stop');
    assert.equal(button.attributes['aria-label'], 'Stop');
    assert.equal(button.innerHTML, EDITOR_STOP_ICON_SVG);
}

{
    const button = createButton();
    configureIconButton(button, {
        className: 'custom',
        title: 'Preview',
        ariaLabel: 'Preview sound',
        iconSvg: '<svg></svg>'
    });
    assert.equal(button.className, 'custom');
    assert.equal(button.title, 'Preview');
    assert.equal(button.attributes['aria-label'], 'Preview sound');
    assert.equal(button.innerHTML, '<svg></svg>');
}

{
    const firstButton = createButton();
    const secondButton = createButton();
    setButtonTexts([
        [firstButton, 'Load'],
        [secondButton, 'Save']
    ]);
    assert.equal(firstButton.textContent, 'Load');
    assert.equal(secondButton.textContent, 'Save');
}

console.log('editor-chrome checks passed');
