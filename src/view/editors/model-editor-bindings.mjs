import { bindModelEditorHeaderButton } from '../header-actions.mjs';

export const MODEL_EDITOR_MIXED_VALUE = '__mixed';

function requireHandler(name, handler) {
    if (typeof handler !== 'function') {
        throw new TypeError(`bindModelEditorControls requires ${name}`);
    }
}

function addBinding(bindings, element, eventName, handler, options) {
    element?.addEventListener?.(eventName, handler, options);
    bindings.push({ element, eventName, options });
}

export function isModelEditorBackdropClick(event, modal) {
    return event?.target === modal || !!event?.target?.classList?.contains?.('bg-black/55');
}

export function configureModelEditorEyeDropperButton(button, { eyeDropper } = {}) {
    const available = !!eyeDropper;
    if (!available && button) {
        button.disabled = true;
        button.classList?.add?.('opacity-50', 'cursor-not-allowed');
    }
    return available;
}

export function bindModelEditorPreviewControls({
    canvas,
    windowRef = globalThis.window,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onWheel,
    onResize
} = {}) {
    const handlers = {
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
        onWheel,
        onResize
    };
    for (const [name, handler] of Object.entries(handlers)) {
        requireHandler(name, handler);
    }

    const bindings = [];
    addBinding(bindings, canvas, 'contextmenu', (event) => event.preventDefault());
    addBinding(bindings, canvas, 'pointerdown', onPointerDown);
    addBinding(bindings, canvas, 'pointermove', onPointerMove);
    addBinding(bindings, canvas, 'pointerup', onPointerUp);
    addBinding(bindings, canvas, 'pointerleave', onPointerCancel);
    addBinding(bindings, canvas, 'pointercancel', onPointerCancel);
    addBinding(bindings, canvas, 'wheel', onWheel, { passive: false });
    addBinding(bindings, windowRef, 'resize', onResize);
    return bindings;
}

export function bindModelEditorControls({
    documentRef = globalThis.document,
    refs = {},
    eyeDropper = globalThis.EyeDropper,
    onOpen,
    onUndo,
    onClose,
    onReadSavedConfig,
    onResetToBackup,
    onSaveToRuntime,
    onLoadAsset,
    onApplyColor,
    onApplyPatternColor,
    onApplyPattern,
    onApplyPatternScale,
    onApplyLineStyle,
    onApplyLineWidth,
    onPickScreenColor,
    bindHeaderButton = bindModelEditorHeaderButton
} = {}) {
    const handlers = {
        onOpen,
        onUndo,
        onClose,
        onReadSavedConfig,
        onResetToBackup,
        onSaveToRuntime,
        onLoadAsset,
        onApplyColor,
        onApplyPatternColor,
        onApplyPattern,
        onApplyPatternScale,
        onApplyLineStyle,
        onApplyLineWidth,
        onPickScreenColor
    };
    for (const [name, handler] of Object.entries(handlers)) {
        requireHandler(name, handler);
    }

    bindHeaderButton({ documentRef, onOpen });

    const bindings = [];
    addBinding(bindings, refs.undoButton, 'click', onUndo);
    addBinding(bindings, refs.closeButton, 'click', onClose);
    addBinding(bindings, refs.readButton, 'click', onReadSavedConfig);
    addBinding(bindings, refs.resetButton, 'click', onResetToBackup);
    addBinding(bindings, refs.saveButton, 'click', onSaveToRuntime);
    addBinding(bindings, refs.assetSelect, 'change', () => onLoadAsset(refs.assetSelect.value));
    addBinding(bindings, refs.colorPicker, 'input', () => onApplyColor(refs.colorPicker.value));
    addBinding(bindings, refs.patternColorPicker, 'input', () => onApplyPatternColor(refs.patternColorPicker.value));
    addBinding(bindings, refs.patternSelect, 'change', () => {
        if (refs.patternSelect.value !== MODEL_EDITOR_MIXED_VALUE) onApplyPattern(refs.patternSelect.value);
    });
    addBinding(bindings, refs.patternScale, 'input', () => onApplyPatternScale(Number(refs.patternScale.value)));
    addBinding(bindings, refs.lineStyleSelect, 'change', () => {
        if (refs.lineStyleSelect.value !== MODEL_EDITOR_MIXED_VALUE) onApplyLineStyle(refs.lineStyleSelect.value);
    });
    addBinding(bindings, refs.lineWidth, 'input', () => onApplyLineWidth(Number(refs.lineWidth.value)));
    addBinding(bindings, refs.eyeDropperButton, 'click', onPickScreenColor);
    addBinding(bindings, refs.modal, 'click', (event) => {
        if (isModelEditorBackdropClick(event, refs.modal)) onClose();
    });

    configureModelEditorEyeDropperButton(refs.eyeDropperButton, { eyeDropper });
    return bindings;
}
