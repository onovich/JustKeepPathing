import assert from 'node:assert/strict';
import {
    bindSoundEditorRenderedControls,
    getSoundEditorControlEventName
} from '../src/view/editors/sound-editor-bindings.mjs';

function createControl({ tagName, type = '' }) {
    return {
        tagName,
        type,
        listeners: {},
        addEventListener(eventName, handler) {
            this.listeners[eventName] = handler;
        }
    };
}

assert.equal(getSoundEditorControlEventName(createControl({ tagName: 'INPUT', type: 'range' })), 'input');
assert.equal(getSoundEditorControlEventName(createControl({ tagName: 'INPUT', type: 'checkbox' })), 'change');
assert.equal(getSoundEditorControlEventName(createControl({ tagName: 'SELECT' })), 'change');
assert.deepEqual(bindSoundEditorRenderedControls({ controlsEl: null, onControlEvent: () => {} }), []);
assert.throws(
    () => bindSoundEditorRenderedControls({ controlsEl: { querySelectorAll: () => [] } }),
    /onControlEvent/
);

{
    const range = createControl({ tagName: 'INPUT', type: 'range' });
    const checkbox = createControl({ tagName: 'INPUT', type: 'checkbox' });
    const select = createControl({ tagName: 'SELECT' });
    const controls = [range, checkbox, select];
    const seen = [];
    const root = {
        querySelectorAll(selector) {
            assert.equal(selector, 'input, select');
            return controls;
        }
    };

    assert.deepEqual(bindSoundEditorRenderedControls({
        controlsEl: root,
        onControlEvent: (control) => seen.push(control)
    }), controls);

    assert.equal(typeof range.listeners.input, 'function');
    assert.equal(typeof checkbox.listeners.change, 'function');
    assert.equal(typeof select.listeners.change, 'function');

    range.listeners.input();
    checkbox.listeners.change();
    select.listeners.change();
    assert.deepEqual(seen, controls);
}

console.log('sound-editor-bindings checks passed');
