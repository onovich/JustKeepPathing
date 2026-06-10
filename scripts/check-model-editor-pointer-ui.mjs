import assert from 'node:assert/strict';
import {
    MODEL_EDITOR_DRAG_THRESHOLD_SQ,
    MODEL_EDITOR_PICK_BUTTON,
    MODEL_EDITOR_ROTATE_BUTTON,
    applyModelEditorRotationMove,
    buildModelEditorPreviewSize,
    clampNumber,
    createModelEditorLeftPointer,
    createModelEditorPointerPoint,
    getModelEditorPointerNdc,
    getModelEditorRotationMove,
    getModelEditorWheelDistance,
    isModelEditorLeftPointerMatch,
    shouldPickModelEditorPointer,
    updateModelEditorLeftPointerMove
} from '../src/view/editors/model-editor-pointer-ui.mjs';

assert.equal(MODEL_EDITOR_PICK_BUTTON, 0);
assert.equal(MODEL_EDITOR_ROTATE_BUTTON, 2);
assert.equal(MODEL_EDITOR_DRAG_THRESHOLD_SQ, 25);

assert.equal(clampNumber(5, 1, 4), 4);
assert.equal(clampNumber(-2, 1, 4), 1);
assert.equal(clampNumber(3, 1, 4), 3);

assert.deepEqual(
    buildModelEditorPreviewSize({
        rect: { width: 512.9, height: 240 },
        clientWidth: 100,
        clientHeight: 100
    }),
    { width: 512, height: 320 },
    'preview dimensions should floor rect sizes and enforce the minimum'
);

assert.deepEqual(
    buildModelEditorPreviewSize({ rect: {}, clientWidth: 410.8, clientHeight: 360.2 }),
    { width: 410, height: 360 },
    'preview dimensions should fall back to client size'
);

assert.deepEqual(
    createModelEditorPointerPoint({ clientX: 12, clientY: 34 }),
    { x: 12, y: 34 }
);

assert.deepEqual(
    createModelEditorLeftPointer({ pointerId: 7, clientX: 12, clientY: 34 }),
    { id: 7, x: 12, y: 34, moved: false }
);

const leftPointer = createModelEditorLeftPointer({ pointerId: 7, clientX: 10, clientY: 20 });
assert.equal(isModelEditorLeftPointerMatch(leftPointer, { pointerId: 7 }), true);
assert.equal(isModelEditorLeftPointerMatch(leftPointer, { pointerId: 8 }), false);

assert.deepEqual(
    updateModelEditorLeftPointerMove(leftPointer, { pointerId: 8, clientX: 100, clientY: 100 }),
    leftPointer,
    'non-matching pointer moves should be ignored'
);

assert.equal(
    updateModelEditorLeftPointerMove(leftPointer, { pointerId: 7, clientX: 13, clientY: 23 }).moved,
    false,
    'small left-button movement should remain pickable'
);

const movedPointer = updateModelEditorLeftPointerMove(leftPointer, { pointerId: 7, clientX: 20, clientY: 20 });
assert.equal(movedPointer.moved, true, 'large left-button movement should cancel picking');
assert.equal(shouldPickModelEditorPointer(leftPointer, { pointerId: 7 }), true);
assert.equal(shouldPickModelEditorPointer(movedPointer, { pointerId: 7 }), false);
assert.equal(shouldPickModelEditorPointer(leftPointer, { pointerId: 8 }), false);

{
    const move = getModelEditorRotationMove({ x: 5, y: 10 }, { clientX: 15, clientY: -10 });
    assert.equal(move.dx, 10);
    assert.equal(move.dy, -20);
    assert.deepEqual(move.nextPoint, { x: 15, y: -10 });

    assert.deepEqual(
        applyModelEditorRotationMove({ x: 0.5, y: 0.25 }, move),
        { x: 0.26, y: 0.37 },
        'rotation movement should apply the shared sensitivity'
    );
}

assert.deepEqual(
    applyModelEditorRotationMove({ x: 1, y: 0 }, { dx: 0, dy: 100, sensitivity: 0.1, minRotationX: -1.1, maxRotationX: 1.1 }),
    { x: 1.1, y: 0 },
    'rotation x should be clamped'
);

assert.ok(Math.abs(getModelEditorWheelDistance(3.4, 100) - 3.85) < 0.000001);
assert.equal(getModelEditorWheelDistance(1.9, -1000), 1.8);
assert.equal(getModelEditorWheelDistance(8.2, 1000), 8.5);

assert.deepEqual(
    getModelEditorPointerNdc(
        { clientX: 150, clientY: 50 },
        { left: 50, top: 25, width: 200, height: 100 }
    ),
    { x: 0, y: 0.5 },
    'pointer NDC should map canvas coordinates into normalized device coordinates'
);

console.log('model-editor-pointer-ui checks passed');
