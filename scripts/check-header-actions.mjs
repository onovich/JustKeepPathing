import assert from 'node:assert/strict';
import {
    bindHeaderAction,
    bindModelEditorHeaderButton,
    bindSoundEditorHeaderButton
} from '../src/view/header-actions.mjs';

function createButton() {
    return {
        listener: null,
        addEventListener(type, listener) {
            assert.equal(type, 'click');
            this.listener = listener;
        },
        async click() {
            let stopped = false;
            await this.listener({
                stopPropagation() {
                    stopped = true;
                }
            });
            return { stopped };
        }
    };
}

function createDocument(buttons) {
    return {
        getElementById(id) {
            return buttons[id] || null;
        }
    };
}

{
    const button = createButton();
    let clicked = false;
    const bound = bindHeaderAction({
        documentRef: createDocument({ 'btn-test': button }),
        buttonId: 'btn-test',
        onClick: () => {
            clicked = true;
        }
    });

    assert.equal(bound, button);
    const eventState = await button.click();
    assert.equal(eventState.stopped, true);
    assert.equal(clicked, true);
}

{
    const button = createButton();
    let opened = false;
    bindModelEditorHeaderButton({
        documentRef: createDocument({ 'btn-editor': button }),
        onOpen: () => {
            opened = true;
        }
    });

    await button.click();
    assert.equal(opened, true);
}

{
    const button = createButton();
    const sequence = [];
    bindSoundEditorHeaderButton({
        documentRef: createDocument({ 'btn-sound-editor': button }),
        soundEngine: {
            async unlock() {
                sequence.push('unlock');
            }
        },
        onOpen: () => {
            sequence.push('open');
        }
    });

    await button.click();
    assert.deepEqual(sequence, ['unlock', 'open']);
}

assert.equal(
    bindHeaderAction({
        documentRef: createDocument({}),
        buttonId: 'missing',
        onClick: () => {}
    }),
    null
);

console.log('header-actions checks passed');
