import assert from 'node:assert/strict';
import { buildModelEditorSelectionControlState } from '../src/view/editors/model-editor-selection-ui.mjs';

assert.deepEqual(
    buildModelEditorSelectionControlState({ active: false, kind: null, canUndo: false }),
    {
        colorDisabled: true,
        patternDisabled: true,
        lineDisabled: true,
        faceControlsInactive: true,
        lineControlsInactive: true,
        undoDisabled: true
    },
    'idle controls should be disabled'
);

assert.deepEqual(
    buildModelEditorSelectionControlState({ active: true, kind: 'mesh', canUndo: true }),
    {
        colorDisabled: false,
        patternDisabled: false,
        lineDisabled: true,
        faceControlsInactive: false,
        lineControlsInactive: true,
        undoDisabled: false
    },
    'mesh selection should enable face editing and undo'
);

assert.deepEqual(
    buildModelEditorSelectionControlState({ active: true, kind: 'line', canUndo: false }),
    {
        colorDisabled: false,
        patternDisabled: true,
        lineDisabled: false,
        faceControlsInactive: true,
        lineControlsInactive: false,
        undoDisabled: true
    },
    'line selection should enable line editing only'
);

console.log('model-editor-selection-ui checks passed');
