export const MODEL_EDITOR_SELECTION_MISS = 'miss';
export const MODEL_EDITOR_SELECTION_MIXED_BLOCKED = 'mixed-blocked';
export const MODEL_EDITOR_SELECTION_CLEARED = 'cleared';
export const MODEL_EDITOR_SELECTION_SELECTED = 'selected';

export function getModelEditorSelectionKind(selection = []) {
    return selection.length > 0 ? selection[0]?.kind || null : null;
}

export function getModelEditorSelectionKey(item = {}) {
    return `${item.kind}:${item.assetKey}:${item.partKey}:${item.index}`;
}

export function getModelEditorSelectionMessage(selection = []) {
    const kind = getModelEditorSelectionKind(selection);
    return `Selected ${selection.length} ${kind === 'mesh' ? 'face' : 'edge'} target(s).`;
}

export function chooseModelEditorPickedTarget({ lineHit = null, faceHit = null, lineBias = 0.06 } = {}) {
    if (lineHit && (!faceHit || lineHit.distance <= faceHit.distance + lineBias)) return lineHit;
    return faceHit || null;
}

export function buildModelEditorSelectionUpdate({
    selection = [],
    picked = null,
    additive = false,
    getKey = getModelEditorSelectionKey
} = {}) {
    if (!picked) {
        return {
            status: MODEL_EDITOR_SELECTION_MISS,
            selection: [],
            message: 'No editable face or line was hit.'
        };
    }

    const pickedWithKey = {
        ...picked,
        key: picked.key || getKey(picked)
    };
    const currentKind = getModelEditorSelectionKind(selection);

    if (additive && currentKind && currentKind !== pickedWithKey.kind) {
        return {
            status: MODEL_EDITOR_SELECTION_MIXED_BLOCKED,
            selection,
            picked: pickedWithKey,
            message: 'Mixed multi-select is not allowed. Keep face-only or edge-only selections.'
        };
    }

    const nextSelection = additive
        ? toggleModelEditorSelectionItem(selection, pickedWithKey)
        : [pickedWithKey];

    if (nextSelection.length === 0) {
        return {
            status: MODEL_EDITOR_SELECTION_CLEARED,
            selection: nextSelection,
            picked: pickedWithKey,
            message: 'Selection cleared.'
        };
    }

    return {
        status: MODEL_EDITOR_SELECTION_SELECTED,
        selection: nextSelection,
        picked: pickedWithKey,
        message: getModelEditorSelectionMessage(nextSelection)
    };
}

export function toggleModelEditorSelectionItem(selection = [], picked = {}) {
    const existingIndex = selection.findIndex((item) => item.key === picked.key);
    if (existingIndex >= 0) {
        return selection.filter((_, index) => index !== existingIndex);
    }
    return [...selection, picked];
}
