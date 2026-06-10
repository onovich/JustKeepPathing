import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    EDITOR_CLOSE_ICON_SVG,
    EDITOR_SECONDARY_ICON_BUTTON_CLASS,
    EDITOR_STOP_ICON_SVG,
    applyEditorModalOpenState,
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

function createModal() {
    const calls = [];
    return {
        calls,
        classList: {
            add(className) {
                calls.push(['add', className]);
            },
            remove(className) {
                calls.push(['remove', className]);
            }
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

{
    const modal = createModal();

    assert.equal(applyEditorModalOpenState({ modal, isOpen: true }), true);
    assert.equal(applyEditorModalOpenState({ modal, isOpen: false }), false);
    assert.deepEqual(modal.calls, [
        ['remove', 'hidden'],
        ['add', 'hidden']
    ]);
    assert.equal(applyEditorModalOpenState({ modal: null, isOpen: true }), true);
}

{
    const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const modelEditorStart = indexHtml.indexOf('class ModelEditor');
    const soundEditorStart = indexHtml.indexOf('class SoundEditor');
    const modelEditorClass = indexHtml.slice(modelEditorStart, soundEditorStart);
    const soundEditorClass = indexHtml.slice(soundEditorStart, indexHtml.indexOf('window.onload', soundEditorStart));

    assert.match(
        modelEditorClass,
        /this\.isOpen = applyEditorModalOpenState\(\{ modal: this\.modal, isOpen: true \}\);[\s\S]*?this\.isOpen = applyEditorModalOpenState\(\{ modal: this\.modal, isOpen: false \}\);/,
        'ModelEditor open/close should route modal visibility through editor chrome'
    );
    assert.match(
        soundEditorClass,
        /this\.isOpen = applyEditorModalOpenState\(\{ modal: this\.modal, isOpen: true \}\);[\s\S]*?this\.isOpen = applyEditorModalOpenState\(\{ modal: this\.modal, isOpen: false \}\);/,
        'SoundEditor open/close should route modal visibility through editor chrome'
    );
    assert.doesNotMatch(
        `${modelEditorClass}\n${soundEditorClass}`,
        /modal\.classList\.(?:add|remove)\('hidden'\)/,
        'Editor classes should not own modal hidden-class toggles'
    );
}

console.log('editor-chrome checks passed');
