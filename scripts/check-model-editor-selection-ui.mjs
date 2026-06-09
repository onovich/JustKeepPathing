import assert from 'node:assert/strict';
import {
    applyModelEditorSelectionUiState,
    buildModelEditorSelectionControlState,
    buildModelEditorSelectionDisplayState,
    buildModelEditorSelectionUiState,
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
        active: false,
        kind: null,
        selectionStatusText: 'Nothing selected yet',
        selectedTargetText: 'No selection',
        selectionKindText: '\u7b49\u5f85\u9009\u62e9',
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
        active: true,
        kind: 'mesh',
        selectionStatusText: 'Selected 2 faces',
        selectedTargetText: 'Player / 2 targets',
        selectionKindText: '\u5f53\u524d\u9009\u62e9\u7c7b\u578b\uff1a\u9762',
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
        active: true,
        kind: 'line',
        selectionStatusText: 'Selected 1 line',
        selectedTargetText: 'Exit / outline',
        selectionKindText: '\u5f53\u524d\u9009\u62e9\u7c7b\u578b\uff1a\u8fb9',
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

let idleEntryReads = 0;
assert.deepEqual(
    buildModelEditorSelectionUiState({
        selection: [],
        canUndo: false,
        getEntry: () => {
            idleEntryReads += 1;
            return null;
        },
        defaultFacePattern: { pattern: 'none', patternColor: '#0f172a', patternScale: 8 },
        defaultLineStyle: { style: 'solid', width: 2 }
    }),
    {
        controlState: {
            colorDisabled: true,
            patternDisabled: true,
            lineDisabled: true,
            faceControlsInactive: true,
            lineControlsInactive: true,
            undoDisabled: true
        },
        displayState: {
            active: false,
            kind: null,
            selectionStatusText: 'Nothing selected yet',
            selectedTargetText: 'No selection',
            selectionKindText: '\u7b49\u5f85\u9009\u62e9',
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
        }
    },
    'combined selection UI state should build idle control and display state'
);
assert.equal(idleEntryReads, 0, 'idle combined state should not read selection entries');

assert.deepEqual(
    buildModelEditorSelectionUiState({
        selection: [
            { key: 'face-a', kind: 'mesh', assetKey: 'player', partKey: 'wing' },
            { key: 'face-b', kind: 'mesh', assetKey: 'player', partKey: 'nose' }
        ],
        canUndo: true,
        getEntry: (item) => entries.get(item.key),
        getAssetLabel: (assetKey) => ({ player: 'Player' })[assetKey] || assetKey,
        defaultFacePattern: { pattern: 'none', patternColor: '#0f172a', patternScale: 8 },
        defaultLineStyle: { style: 'solid', width: 2 }
    }),
    {
        controlState: {
            colorDisabled: false,
            patternDisabled: false,
            lineDisabled: true,
            faceControlsInactive: false,
            lineControlsInactive: true,
            undoDisabled: false
        },
        displayState: {
            active: true,
            kind: 'mesh',
            selectionStatusText: 'Selected 2 faces',
            selectedTargetText: 'Player / 2 targets',
            selectionKindText: '\u5f53\u524d\u9009\u62e9\u7c7b\u578b\uff1a\u9762',
            selectedTypeText: 'Face x2',
            colorPickerValue: '#ff0000',
            colorValueText: '...',
            patternSelectValue: '__mixed',
            patternColorPickerValue: '#00ff00',
            patternScaleValue: '8',
            patternScaleText: '8.0x',
            lineStyleSelectValue: 'solid',
            lineWidthValue: '2',
            lineWidthText: '2.0'
        }
    },
    'combined selection UI state should derive mesh mixed display values'
);

assert.deepEqual(
    buildModelEditorSelectionUiState({
        selection: [{ key: 'edge-a', kind: 'line', assetKey: 'exit', partKey: 'outline' }],
        canUndo: false,
        getEntry: (item) => entries.get(item.key),
        getAssetLabel: (assetKey) => ({ exit: 'Exit' })[assetKey] || assetKey,
        defaultFacePattern: { pattern: 'none', patternColor: '#0f172a', patternScale: 8 },
        defaultLineStyle: { style: 'solid', width: 2 }
    }),
    {
        controlState: {
            colorDisabled: false,
            patternDisabled: true,
            lineDisabled: false,
            faceControlsInactive: true,
            lineControlsInactive: false,
            undoDisabled: true
        },
        displayState: {
            active: true,
            kind: 'line',
            selectionStatusText: 'Selected 1 line',
            selectedTargetText: 'Exit / outline',
            selectionKindText: '\u5f53\u524d\u9009\u62e9\u7c7b\u578b\uff1a\u8fb9',
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
        }
    },
    'combined selection UI state should infer line kind from the selected item'
);

function createFakeElement(value = '') {
    const classNames = new Set();
    return {
        disabled: false,
        innerText: '',
        value,
        classList: {
            toggle(className, force) {
                if (force) classNames.add(className);
                else classNames.delete(className);
            },
            contains(className) {
                return classNames.has(className);
            }
        }
    };
}

function createFakeSelectionRefs() {
    return {
        colorPicker: createFakeElement('#000000'),
        patternColorPicker: createFakeElement('#000000'),
        patternSelect: createFakeElement('hatch'),
        patternScale: createFakeElement('14'),
        patternScaleValue: createFakeElement(),
        lineStyleSelect: createFakeElement('dashed'),
        lineWidth: createFakeElement('5'),
        lineWidthValue: createFakeElement(),
        faceControls: createFakeElement(),
        lineControls: createFakeElement(),
        undoButton: createFakeElement(),
        selectionStatus: createFakeElement(),
        selectedTarget: createFakeElement(),
        selectionKind: createFakeElement(),
        selectedType: createFakeElement(),
        colorValue: createFakeElement()
    };
}

const idleRefs = createFakeSelectionRefs();
applyModelEditorSelectionUiState(idleRefs, {
    controlState: buildModelEditorSelectionControlState({ active: false, kind: null, canUndo: false }),
    displayState: buildModelEditorSelectionDisplayState({
        active: false,
        selection: [],
        defaultFacePattern: { pattern: 'none', patternColor: '#0f172a', patternScale: 8 },
        defaultLineStyle: { style: 'solid', width: 2 }
    })
});

assert.equal(idleRefs.colorPicker.disabled, true, 'idle color picker should be disabled');
assert.equal(idleRefs.patternSelect.disabled, true, 'idle pattern select should be disabled');
assert.equal(idleRefs.lineWidth.disabled, true, 'idle line width should be disabled');
assert.equal(idleRefs.undoButton.disabled, true, 'idle undo should be disabled');
assert.equal(idleRefs.colorPicker.classList.contains('opacity-60'), true, 'idle color picker should be dimmed');
assert.equal(idleRefs.faceControls.classList.contains('opacity-50'), true, 'idle face controls should be dimmed');
assert.equal(idleRefs.lineControls.classList.contains('opacity-50'), true, 'idle line controls should be dimmed');
assert.equal(idleRefs.undoButton.classList.contains('cursor-not-allowed'), true, 'idle undo should look disabled');
assert.equal(idleRefs.selectionStatus.innerText, 'Nothing selected yet', 'idle status text should be applied');
assert.equal(idleRefs.selectionKind.innerText, '\u7b49\u5f85\u9009\u62e9', 'idle selection kind text should be applied');
assert.equal(idleRefs.patternSelect.value, 'none', 'idle pattern select should reset');
assert.equal(idleRefs.lineWidth.value, '2', 'idle line width should reset');

const meshRefs = createFakeSelectionRefs();
meshRefs.lineStyleSelect.value = 'keep-style';
meshRefs.lineWidth.value = '5';
applyModelEditorSelectionUiState(meshRefs, {
    controlState: buildModelEditorSelectionControlState({ active: true, kind: 'mesh', canUndo: true }),
    displayState: buildModelEditorSelectionDisplayState({
        active: true,
        kind: 'mesh',
        selection: [{ assetKey: 'player', partKey: 'wing' }],
        assetLabel: 'Player',
        sharedColor: { mixed: false, value: '#ff0000' },
        sharedPattern: { mixed: false, value: 'hatch' },
        sharedPatternColor: { mixed: false, value: '#00ff00' },
        sharedScale: { mixed: false, value: '10' },
        defaultFacePattern: { pattern: 'none', patternColor: '#0f172a', patternScale: 8 },
        defaultLineStyle: { style: 'solid', width: 2 }
    })
});

assert.equal(meshRefs.colorPicker.disabled, false, 'mesh color picker should be enabled');
assert.equal(meshRefs.patternSelect.disabled, false, 'mesh pattern select should be enabled');
assert.equal(meshRefs.lineWidth.disabled, true, 'mesh line width should be disabled');
assert.equal(meshRefs.undoButton.disabled, false, 'mesh undo should be enabled when undo exists');
assert.equal(meshRefs.selectionKind.innerText, '\u5f53\u524d\u9009\u62e9\u7c7b\u578b\uff1a\u9762', 'mesh kind text should be applied');
assert.equal(meshRefs.patternSelect.value, 'hatch', 'mesh pattern select should update');
assert.equal(meshRefs.patternScaleValue.innerText, '10.0x', 'mesh pattern scale text should update');
assert.equal(meshRefs.lineStyleSelect.value, 'keep-style', 'mesh apply should not overwrite line-only controls');
assert.equal(meshRefs.lineWidth.value, '5', 'mesh apply should not overwrite line width');

const lineRefs = createFakeSelectionRefs();
lineRefs.patternSelect.value = 'keep-pattern';
lineRefs.patternScale.value = '11';
applyModelEditorSelectionUiState(lineRefs, {
    controlState: buildModelEditorSelectionControlState({ active: true, kind: 'line', canUndo: false }),
    displayState: buildModelEditorSelectionDisplayState({
        active: true,
        kind: 'line',
        selection: [{ assetKey: 'exit', partKey: 'outline' }],
        assetLabel: 'Exit',
        sharedColor: { mixed: false, value: '#f8fafc' },
        sharedStyle: { mixed: false, value: 'dashed' },
        sharedWidth: { mixed: false, value: '3.5' },
        defaultFacePattern: { pattern: 'none', patternColor: '#0f172a', patternScale: 8 },
        defaultLineStyle: { style: 'solid', width: 2 }
    })
});

assert.equal(lineRefs.patternSelect.value, 'keep-pattern', 'line apply should not overwrite face-only controls');
assert.equal(lineRefs.patternScale.value, '11', 'line apply should not overwrite pattern scale');
assert.equal(lineRefs.lineStyleSelect.value, 'dashed', 'line style should update');
assert.equal(lineRefs.lineWidth.value, '3.5', 'line width should update');
assert.equal(lineRefs.lineWidthValue.innerText, '3.5', 'line width text should update');

console.log('model-editor-selection-ui checks passed');
