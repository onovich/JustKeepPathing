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
