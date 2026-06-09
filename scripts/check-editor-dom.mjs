import assert from 'node:assert/strict';
import {
    MODEL_EDITOR_DOM_IDS,
    SOUND_EDITOR_DOM_IDS,
    getEditorDomRefs,
    getModelEditorDomRefs,
    getSoundEditorDomRefs
} from '../src/view/editors/editor-dom.mjs';

function assertNoDuplicateIds(label, idMap) {
    const ids = Object.values(idMap);
    assert.equal(new Set(ids).size, ids.length, `${label} should not contain duplicate DOM ids`);
}

function createDocument() {
    const calls = [];
    return {
        calls,
        getElementById(id) {
            calls.push(id);
            return { id };
        }
    };
}

assertNoDuplicateIds('model editor', MODEL_EDITOR_DOM_IDS);
assertNoDuplicateIds('sound editor', SOUND_EDITOR_DOM_IDS);

{
    const documentRef = createDocument();
    const refs = getEditorDomRefs(documentRef, { one: 'alpha', two: 'beta' });
    assert.deepEqual(Object.keys(refs), ['one', 'two']);
    assert.equal(refs.one.id, 'alpha');
    assert.equal(refs.two.id, 'beta');
    assert.deepEqual(documentRef.calls, ['alpha', 'beta']);
}

{
    const documentRef = createDocument();
    const refs = getModelEditorDomRefs(documentRef);
    assert.deepEqual(Object.keys(refs), Object.keys(MODEL_EDITOR_DOM_IDS));
    assert.deepEqual(documentRef.calls, Object.values(MODEL_EDITOR_DOM_IDS));
    assert.equal(refs.modal.id, 'editor-modal');
    assert.equal(refs.canvas.id, 'editor-preview-canvas');
    assert.equal(refs.closeButton.id, 'btn-editor-close');
    assert.equal(refs.logEl.id, 'editor-log');
}

{
    const documentRef = createDocument();
    const refs = getSoundEditorDomRefs(documentRef);
    assert.deepEqual(Object.keys(refs), Object.keys(SOUND_EDITOR_DOM_IDS));
    assert.deepEqual(documentRef.calls, Object.values(SOUND_EDITOR_DOM_IDS));
    assert.equal(refs.modal.id, 'sound-editor-modal');
    assert.equal(refs.select.id, 'sound-asset-select');
    assert.equal(refs.previewButton.id, 'btn-sound-preview');
    assert.equal(refs.closeButton.id, 'btn-sound-close');
}

console.log('editor-dom checks passed');
