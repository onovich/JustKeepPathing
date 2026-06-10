import assert from 'node:assert/strict';
import {
    MODEL_EDITOR_SELECTION_CLEARED,
    MODEL_EDITOR_SELECTION_MISS,
    MODEL_EDITOR_SELECTION_MIXED_BLOCKED,
    MODEL_EDITOR_SELECTION_SELECTED,
    buildModelEditorSelectionUpdate,
    chooseModelEditorPickedTarget,
    getModelEditorSelectionKey,
    getModelEditorSelectionKind,
    getModelEditorSelectionMessage,
    toggleModelEditorSelectionItem
} from '../src/view/editors/model-editor-selection-state.mjs';

const faceA = {
    kind: 'mesh',
    assetKey: 'player',
    partKey: 'wing',
    index: 2,
    distance: 3
};
const faceB = {
    kind: 'mesh',
    assetKey: 'player',
    partKey: 'nose',
    index: 5,
    distance: 2
};
const lineA = {
    kind: 'line',
    assetKey: 'exit',
    partKey: 'outline',
    index: 1,
    distance: 3.04
};

assert.equal(getModelEditorSelectionKind([]), null);
assert.equal(getModelEditorSelectionKind([faceA]), 'mesh');
assert.equal(getModelEditorSelectionKey(faceA), 'mesh:player:wing:2');
assert.equal(getModelEditorSelectionMessage([{ ...faceA, key: 'mesh:player:wing:2' }]), 'Selected 1 face target(s).');
assert.equal(
    getModelEditorSelectionMessage([
        { ...lineA, key: 'line:exit:outline:1' },
        { ...lineA, key: 'line:exit:outline:2', index: 2 }
    ]),
    'Selected 2 edge target(s).'
);

assert.equal(chooseModelEditorPickedTarget({ lineHit: null, faceHit: faceA }), faceA);
assert.equal(chooseModelEditorPickedTarget({ lineHit: lineA, faceHit: null }), lineA);
assert.equal(
    chooseModelEditorPickedTarget({ lineHit: { ...lineA, distance: 3.05 }, faceHit: faceA })?.kind,
    'line',
    'line hit should win when it is within the face-hit bias'
);
assert.equal(
    chooseModelEditorPickedTarget({ lineHit: { ...lineA, distance: 3.2 }, faceHit: faceA })?.kind,
    'mesh',
    'face hit should win when the line hit is too far behind'
);
assert.equal(chooseModelEditorPickedTarget({}), null);

assert.deepEqual(
    buildModelEditorSelectionUpdate({ selection: [], picked: null }),
    {
        status: MODEL_EDITOR_SELECTION_MISS,
        selection: [],
        message: 'No editable face or line was hit.'
    },
    'missing picks should clear selection'
);

{
    const update = buildModelEditorSelectionUpdate({ selection: [], picked: faceA });
    assert.equal(update.status, MODEL_EDITOR_SELECTION_SELECTED);
    assert.equal(update.selection.length, 1);
    assert.equal(update.selection[0].key, 'mesh:player:wing:2');
    assert.equal(update.message, 'Selected 1 face target(s).');
}

{
    const selectedFaceA = { ...faceA, key: getModelEditorSelectionKey(faceA) };
    const update = buildModelEditorSelectionUpdate({
        selection: [selectedFaceA],
        picked: faceB,
        additive: true
    });
    assert.equal(update.status, MODEL_EDITOR_SELECTION_SELECTED);
    assert.deepEqual(update.selection.map((item) => item.key), ['mesh:player:wing:2', 'mesh:player:nose:5']);
    assert.equal(update.message, 'Selected 2 face target(s).');
}

{
    const selectedFaceA = { ...faceA, key: getModelEditorSelectionKey(faceA) };
    const update = buildModelEditorSelectionUpdate({
        selection: [selectedFaceA],
        picked: faceA,
        additive: true
    });
    assert.equal(update.status, MODEL_EDITOR_SELECTION_CLEARED);
    assert.deepEqual(update.selection, []);
    assert.equal(update.message, 'Selection cleared.');
}

{
    const selectedFaceA = { ...faceA, key: getModelEditorSelectionKey(faceA) };
    const update = buildModelEditorSelectionUpdate({
        selection: [selectedFaceA],
        picked: lineA,
        additive: true
    });
    assert.equal(update.status, MODEL_EDITOR_SELECTION_MIXED_BLOCKED);
    assert.deepEqual(update.selection, [selectedFaceA]);
    assert.equal(update.message, 'Mixed multi-select is not allowed. Keep face-only or edge-only selections.');
}

assert.deepEqual(
    toggleModelEditorSelectionItem([{ ...faceA, key: 'mesh:player:wing:2' }], { ...faceA, key: 'mesh:player:wing:2' }),
    [],
    'toggle should remove an already-selected target'
);
assert.deepEqual(
    toggleModelEditorSelectionItem([], { ...faceA, key: 'mesh:player:wing:2' }).map((item) => item.key),
    ['mesh:player:wing:2'],
    'toggle should add a new target'
);

console.log('model-editor-selection-state checks passed');
