import assert from 'node:assert/strict';
import {
    buildModelEditorSelectionControlState,
    buildModelEditorSelectionDisplayState,
    getSharedModelEditorSelectionValue
} from '../src/view/editors/model-editor-selection-ui.mjs';

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

const entries = new Map([
    ['face-a', { color: '#ff0000', pattern: 'none', patternColor: '#00ff00', patternScale: 8 }],
    ['face-b', { color: '#00ffff', pattern: 'hatch', patternColor: '#00ff00', patternScale: 8 }],
    ['edge-a', { color: '#f8fafc', style: 'dashed', width: 3.5 }]
]);

assert.deepEqual(
    getSharedModelEditorSelectionValue(
        [{ key: 'face-a' }, { key: 'face-b' }],
        (item) => entries.get(item.key),
        (entry) => entry.patternColor
    ),
    { mixed: false, value: '#00ff00' },
    'shared selection values should report a common value'
);

assert.deepEqual(
    getSharedModelEditorSelectionValue(
        [{ key: 'face-a' }, { key: 'face-b' }],
        (item) => entries.get(item.key),
        (entry) => entry.color
    ),
    { mixed: true, value: '#ff0000' },
    'shared selection values should report mixed values while keeping the first value'
);

assert.deepEqual(
    buildModelEditorSelectionDisplayState({
        active: false,
        selection: [],
        defaultFacePattern: { pattern: 'none', patternColor: '#0f172a', patternScale: 8 },
        defaultLineStyle: { style: 'solid', width: 2 }
    }),
    {
        selectionStatusText: 'Nothing selected yet',
        selectedTargetText: 'No selection',
        selectedTypeText: 'Waiting',
        colorPickerValue: '#22d3ee',
        colorValueText: '#22d3ee',
        patternSelectValue: 'none',
        patternColorPickerValue: '#0f172a',
        patternScaleValue: '8',
        patternScaleText: '8.0x',
        lineStyleSelectValue: 'solid',
        lineWidthValue: '2',
        lineWidthText: '2.0'
    },
    'idle display state should reset selection controls to defaults'
);

assert.deepEqual(
    buildModelEditorSelectionDisplayState({
        active: true,
        kind: 'mesh',
        selection: [
            { assetKey: 'player', partKey: 'wing' },
            { assetKey: 'player', partKey: 'nose' }
        ],
        assetLabel: 'Player',
        sharedColor: { mixed: true, value: '#ff0000' },
        sharedPattern: { mixed: true, value: 'none' },
        sharedPatternColor: { mixed: false, value: '#00ff00' },
        sharedScale: { mixed: true, value: '8' },
        defaultFacePattern: { pattern: 'none', patternColor: '#0f172a', patternScale: 8 },
        defaultLineStyle: { style: 'solid', width: 2 }
    }),
    {
        selectionStatusText: 'Selected 2 faces',
        selectedTargetText: 'Player / 2 targets',
        selectedTypeText: 'Face x2',
        colorPickerValue: '#ff0000',
        colorValueText: '...',
        patternSelectValue: '__mixed',
        patternColorPickerValue: '#00ff00',
        patternScaleValue: '8',
        patternScaleText: '...',
        lineStyleSelectValue: 'solid',
        lineWidthValue: '2',
        lineWidthText: '2.0'
    },
    'mesh display state should expose mixed face values'
);

assert.deepEqual(
    buildModelEditorSelectionDisplayState({
        active: true,
        kind: 'line',
        selection: [{ assetKey: 'exit', partKey: 'outline' }],
        assetLabel: 'Exit',
        sharedColor: { mixed: false, value: '#f8fafc' },
        sharedStyle: { mixed: false, value: 'dashed' },
        sharedWidth: { mixed: false, value: '3.5' },
        defaultFacePattern: { pattern: 'none', patternColor: '#0f172a', patternScale: 8 },
        defaultLineStyle: { style: 'solid', width: 2 }
    }),
    {
        selectionStatusText: 'Selected 1 line',
        selectedTargetText: 'Exit / outline',
        selectedTypeText: 'Edge x1',
        colorPickerValue: '#f8fafc',
        colorValueText: '#f8fafc',
        patternSelectValue: 'none',
        patternColorPickerValue: '#0f172a',
        patternScaleValue: '8',
        patternScaleText: '8.0x',
        lineStyleSelectValue: 'dashed',
        lineWidthValue: '3.5',
        lineWidthText: '3.5'
    },
    'line display state should expose selected line controls'
);

console.log('model-editor-selection-ui checks passed');
