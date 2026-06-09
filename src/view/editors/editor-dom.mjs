export const MODEL_EDITOR_DOM_IDS = Object.freeze({
    modal: 'editor-modal',
    canvas: 'editor-preview-canvas',
    assetSelect: 'editor-asset-select',
    undoButton: 'btn-editor-undo',
    readButton: 'btn-editor-read',
    resetButton: 'btn-editor-reset',
    saveButton: 'btn-editor-save',
    closeButton: 'btn-editor-close',
    colorPicker: 'editor-color-picker',
    patternColorPicker: 'editor-pattern-color',
    patternSelect: 'editor-face-pattern',
    patternScale: 'editor-pattern-scale',
    patternScaleValue: 'editor-pattern-scale-value',
    lineStyleSelect: 'editor-line-style',
    lineWidth: 'editor-line-width',
    lineWidthValue: 'editor-line-width-value',
    eyeDropperButton: 'btn-editor-eyedropper',
    selectionStatus: 'editor-selection-status',
    selectedTarget: 'editor-selected-target',
    selectionKind: 'editor-selection-kind',
    selectedType: 'editor-selected-type',
    colorValue: 'editor-color-value',
    faceControls: 'editor-face-controls',
    lineControls: 'editor-line-controls',
    logEl: 'editor-log'
});

export const SOUND_EDITOR_DOM_IDS = Object.freeze({
    modal: 'sound-editor-modal',
    select: 'sound-asset-select',
    typeEl: 'sound-editor-type',
    usageEl: 'sound-editor-usage',
    descriptionEl: 'sound-editor-description',
    statusEl: 'sound-editor-status',
    logEl: 'sound-editor-log',
    controlsEl: 'sound-editor-controls',
    previewButton: 'btn-sound-preview',
    stopPreviewButton: 'btn-sound-stop-preview',
    readButton: 'btn-sound-read',
    resetButton: 'btn-sound-reset',
    saveButton: 'btn-sound-save',
    closeButton: 'btn-sound-close'
});

export function getEditorDomRefs(documentRef, idMap) {
    const refs = {};
    for (const [key, id] of Object.entries(idMap)) {
        refs[key] = documentRef.getElementById(id);
    }
    return refs;
}

export function getModelEditorDomRefs(documentRef = globalThis.document) {
    return getEditorDomRefs(documentRef, MODEL_EDITOR_DOM_IDS);
}

export function getSoundEditorDomRefs(documentRef = globalThis.document) {
    return getEditorDomRefs(documentRef, SOUND_EDITOR_DOM_IDS);
}
