export function buildModelEditorSelectionControlState({ active = false, kind = null, canUndo = false } = {}) {
    return {
        colorDisabled: !active,
        patternDisabled: !active || kind !== 'mesh',
        lineDisabled: !active || kind !== 'line',
        faceControlsInactive: !active || kind !== 'mesh',
        lineControlsInactive: !active || kind !== 'line',
        undoDisabled: !canUndo
    };
}

export function getSharedModelEditorSelectionValue(selection = [], getEntry = (item) => item, getter = (entry) => entry) {
    if (!selection.length) return { mixed: false, value: null };
    const firstValue = getter(getEntry(selection[0]));
    const mixed = selection.some((item) => getter(getEntry(item)) !== firstValue);
    return { mixed, value: firstValue };
}

export function buildModelEditorSelectionDisplayState({
    active = false,
    kind = null,
    selection = [],
    assetLabel = '',
    sharedColor = { mixed: false, value: '#22d3ee' },
    sharedPattern = { mixed: false, value: 'none' },
    sharedPatternColor = { mixed: false, value: '#0f172a' },
    sharedScale = { mixed: false, value: '8' },
    sharedStyle = { mixed: false, value: 'solid' },
    sharedWidth = { mixed: false, value: '2' },
    defaultFacePattern = { pattern: 'none', patternColor: '#0f172a', patternScale: 8 },
    defaultLineStyle = { style: 'solid', width: 2 }
} = {}) {
    const selectionCount = selection.length;
    const hasSelection = active && selectionCount > 0;
    const firstSelection = selection[0] || {};
    const color = hasSelection ? sharedColor.value : '#22d3ee';
    const idlePatternScale = Number(defaultFacePattern.patternScale);
    const idleLineWidth = Number(defaultLineStyle.width);

    return {
        active: hasSelection,
        kind,
        selectionStatusText: hasSelection
            ? `Selected ${selectionCount} ${kind === 'mesh' ? 'face' : 'line'}${selectionCount > 1 ? 's' : ''}`
            : 'Nothing selected yet',
        selectedTargetText: hasSelection
            ? `${assetLabel || firstSelection.assetKey || 'Unknown'} / ${selectionCount === 1 ? firstSelection.partKey : `${selectionCount} targets`}`
            : 'No selection',
        selectionKindText: hasSelection
            ? (kind === 'mesh' ? '\u5f53\u524d\u9009\u62e9\u7c7b\u578b\uff1a\u9762' : '\u5f53\u524d\u9009\u62e9\u7c7b\u578b\uff1a\u8fb9')
            : '\u7b49\u5f85\u9009\u62e9',
        selectedTypeText: hasSelection
            ? (kind === 'mesh' ? `Face x${selectionCount}` : `Edge x${selectionCount}`)
            : 'Waiting',
        colorPickerValue: color,
        colorValueText: hasSelection && sharedColor.mixed ? '...' : color,
        patternSelectValue: hasSelection && kind === 'mesh'
            ? (sharedPattern.mixed ? '__mixed' : sharedPattern.value)
            : defaultFacePattern.pattern,
        patternColorPickerValue: hasSelection && kind === 'mesh'
            ? sharedPatternColor.value
            : defaultFacePattern.patternColor,
        patternScaleValue: hasSelection && kind === 'mesh'
            ? String(sharedScale.value)
            : String(defaultFacePattern.patternScale),
        patternScaleText: hasSelection && kind === 'mesh'
            ? (sharedScale.mixed ? '...' : `${Number(sharedScale.value).toFixed(1)}x`)
            : `${idlePatternScale.toFixed(1)}x`,
        lineStyleSelectValue: hasSelection && kind === 'line'
            ? (sharedStyle.mixed ? '__mixed' : sharedStyle.value)
            : defaultLineStyle.style,
        lineWidthValue: hasSelection && kind === 'line'
            ? String(sharedWidth.value)
            : String(defaultLineStyle.width),
        lineWidthText: hasSelection && kind === 'line'
            ? (sharedWidth.mixed ? '...' : Number(sharedWidth.value).toFixed(1))
            : idleLineWidth.toFixed(1)
    };
}

function setElementText(element, text) {
    if (element) element.innerText = text;
}

function setElementValue(element, value) {
    if (element) element.value = value;
}

function setElementDisabled(element, disabled) {
    if (element) element.disabled = disabled;
}

function toggleElementClass(element, className, force) {
    element?.classList?.toggle(className, force);
}

export function applyModelEditorSelectionUiState(refs = {}, { controlState = {}, displayState = {} } = {}) {
    setElementDisabled(refs.colorPicker, controlState.colorDisabled);
    setElementDisabled(refs.patternColorPicker, controlState.patternDisabled);
    setElementDisabled(refs.patternSelect, controlState.patternDisabled);
    setElementDisabled(refs.patternScale, controlState.patternDisabled);
    setElementDisabled(refs.lineStyleSelect, controlState.lineDisabled);
    setElementDisabled(refs.lineWidth, controlState.lineDisabled);
    toggleElementClass(refs.colorPicker, 'opacity-60', controlState.colorDisabled);
    toggleElementClass(refs.faceControls, 'opacity-50', controlState.faceControlsInactive);
    toggleElementClass(refs.lineControls, 'opacity-50', controlState.lineControlsInactive);
    setElementDisabled(refs.undoButton, controlState.undoDisabled);
    toggleElementClass(refs.undoButton, 'opacity-50', controlState.undoDisabled);
    toggleElementClass(refs.undoButton, 'cursor-not-allowed', controlState.undoDisabled);

    setElementText(refs.selectionStatus, displayState.selectionStatusText);
    setElementText(refs.selectedTarget, displayState.selectedTargetText);
    setElementText(refs.selectionKind, displayState.selectionKindText);
    setElementText(refs.selectedType, displayState.selectedTypeText);
    setElementValue(refs.colorPicker, displayState.colorPickerValue);
    setElementText(refs.colorValue, displayState.colorValueText);

    if (!displayState.active) {
        setElementValue(refs.patternSelect, displayState.patternSelectValue);
        setElementValue(refs.patternColorPicker, displayState.patternColorPickerValue);
        setElementValue(refs.patternScale, displayState.patternScaleValue);
        setElementText(refs.patternScaleValue, displayState.patternScaleText);
        setElementValue(refs.lineStyleSelect, displayState.lineStyleSelectValue);
        setElementValue(refs.lineWidth, displayState.lineWidthValue);
        setElementText(refs.lineWidthValue, displayState.lineWidthText);
        return;
    }

    if (displayState.kind === 'mesh') {
        setElementValue(refs.patternSelect, displayState.patternSelectValue);
        setElementValue(refs.patternColorPicker, displayState.patternColorPickerValue);
        setElementValue(refs.patternScale, displayState.patternScaleValue);
        setElementText(refs.patternScaleValue, displayState.patternScaleText);
    } else if (displayState.kind === 'line') {
        setElementValue(refs.lineStyleSelect, displayState.lineStyleSelectValue);
        setElementValue(refs.lineWidth, displayState.lineWidthValue);
        setElementText(refs.lineWidthValue, displayState.lineWidthText);
    }
}
