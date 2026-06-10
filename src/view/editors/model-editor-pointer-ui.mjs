export const MODEL_EDITOR_PICK_BUTTON = 0;
export const MODEL_EDITOR_ROTATE_BUTTON = 2;
export const MODEL_EDITOR_DRAG_THRESHOLD_SQ = 25;
export const MODEL_EDITOR_ROTATION_SENSITIVITY = 0.012;
export const MODEL_EDITOR_WHEEL_SENSITIVITY = 0.0045;
export const MODEL_EDITOR_PREVIEW_MIN_SIZE = 320;
export const MODEL_EDITOR_ZOOM_MIN = 1.8;
export const MODEL_EDITOR_ZOOM_MAX = 8.5;

export function clampNumber(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function buildModelEditorPreviewSize({
    rect = {},
    clientWidth = 0,
    clientHeight = 0,
    minSize = MODEL_EDITOR_PREVIEW_MIN_SIZE
} = {}) {
    return {
        width: Math.max(minSize, Math.floor(rect.width || clientWidth || minSize)),
        height: Math.max(minSize, Math.floor(rect.height || clientHeight || minSize))
    };
}

export function createModelEditorPointerPoint(event = {}) {
    return {
        x: Number(event.clientX) || 0,
        y: Number(event.clientY) || 0
    };
}

export function createModelEditorLeftPointer(event = {}) {
    return {
        id: event.pointerId,
        ...createModelEditorPointerPoint(event),
        moved: false
    };
}

export function isModelEditorLeftPointerMatch(leftPointer, event = {}) {
    return !!leftPointer && event.pointerId === leftPointer.id;
}

export function getModelEditorRotationMove(rightDragPoint, event = {}, {
    sensitivity = MODEL_EDITOR_ROTATION_SENSITIVITY,
    minRotationX = -1.1,
    maxRotationX = 1.1
} = {}) {
    const nextPoint = createModelEditorPointerPoint(event);
    const previousPoint = rightDragPoint || nextPoint;
    return {
        dx: nextPoint.x - previousPoint.x,
        dy: nextPoint.y - previousPoint.y,
        nextPoint,
        sensitivity,
        minRotationX,
        maxRotationX
    };
}

export function applyModelEditorRotationMove(rotation = {}, move = {}) {
    return {
        x: clampNumber(
            Number(rotation.x || 0) + Number(move.dy || 0) * Number(move.sensitivity || MODEL_EDITOR_ROTATION_SENSITIVITY),
            Number.isFinite(move.minRotationX) ? move.minRotationX : -1.1,
            Number.isFinite(move.maxRotationX) ? move.maxRotationX : 1.1
        ),
        y: Number(rotation.y || 0) + Number(move.dx || 0) * Number(move.sensitivity || MODEL_EDITOR_ROTATION_SENSITIVITY)
    };
}

export function updateModelEditorLeftPointerMove(leftPointer, event = {}, {
    thresholdSq = MODEL_EDITOR_DRAG_THRESHOLD_SQ
} = {}) {
    if (!isModelEditorLeftPointerMatch(leftPointer, event)) return leftPointer;
    const dx = Number(event.clientX) - leftPointer.x;
    const dy = Number(event.clientY) - leftPointer.y;
    return {
        ...leftPointer,
        moved: leftPointer.moved || dx * dx + dy * dy > thresholdSq
    };
}

export function shouldPickModelEditorPointer(leftPointer, event = {}) {
    return isModelEditorLeftPointerMatch(leftPointer, event) && !leftPointer.moved;
}

export function getModelEditorWheelDistance(currentDistance, deltaY, {
    sensitivity = MODEL_EDITOR_WHEEL_SENSITIVITY,
    min = MODEL_EDITOR_ZOOM_MIN,
    max = MODEL_EDITOR_ZOOM_MAX
} = {}) {
    return clampNumber(Number(currentDistance) + Number(deltaY) * sensitivity, min, max);
}

export function getModelEditorPointerNdc(event = {}, rect = {}) {
    const width = Number(rect.width) || 1;
    const height = Number(rect.height) || 1;
    return {
        x: ((Number(event.clientX) - Number(rect.left || 0)) / width) * 2 - 1,
        y: -((Number(event.clientY) - Number(rect.top || 0)) / height) * 2 + 1
    };
}
