import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    MODEL_EDITOR_MIXED_VALUE,
    bindModelEditorControls,
    bindModelEditorPreviewControls,
    configureModelEditorEyeDropperButton,
    isModelEditorBackdropClick
} from '../src/view/editors/model-editor-bindings.mjs';

function createClassList(initial = []) {
    const values = new Set(initial);
    return {
        values,
        add(...classNames) {
            classNames.forEach((className) => values.add(className));
        },
        contains(className) {
            return values.has(className);
        }
    };
}

function createElement({ value = '', classNames = [] } = {}) {
    return {
        value,
        disabled: false,
        classList: createClassList(classNames),
        listeners: {},
        listenerOptions: {},
        addEventListener(eventName, handler, options) {
            this.listeners[eventName] = handler;
            this.listenerOptions[eventName] = options;
        }
    };
}

function createRefs() {
    return {
        modal: createElement(),
        undoButton: createElement(),
        closeButton: createElement(),
        readButton: createElement(),
        resetButton: createElement(),
        saveButton: createElement(),
        assetSelect: createElement({ value: 'boss' }),
        colorPicker: createElement({ value: '#123456' }),
        patternColorPicker: createElement({ value: '#abcdef' }),
        patternSelect: createElement({ value: 'hatch' }),
        patternScale: createElement({ value: '12.5' }),
        lineStyleSelect: createElement({ value: 'dashed' }),
        lineWidth: createElement({ value: '4.5' }),
        eyeDropperButton: createElement()
    };
}

assert.equal(MODEL_EDITOR_MIXED_VALUE, '__mixed');
assert.equal(isModelEditorBackdropClick({ target: 'modal' }, 'modal'), true);
assert.equal(isModelEditorBackdropClick({ target: createElement({ classNames: ['bg-black/55'] }) }, 'modal'), true);
assert.equal(isModelEditorBackdropClick({ target: createElement() }, 'modal'), false);

{
    const button = createElement();
    assert.equal(configureModelEditorEyeDropperButton(button, { eyeDropper: null }), false);
    assert.equal(button.disabled, true);
    assert.equal(button.classList.contains('opacity-50'), true);
    assert.equal(button.classList.contains('cursor-not-allowed'), true);
}

{
    const button = createElement();
    assert.equal(configureModelEditorEyeDropperButton(button, { eyeDropper: function EyeDropper() {} }), true);
    assert.equal(button.disabled, false);
}

assert.throws(
    () => bindModelEditorControls({ refs: createRefs(), onOpen: () => {} }),
    /onUndo/,
    'all callbacks should be explicit so missing bindings fail fast'
);
assert.throws(
    () => bindModelEditorPreviewControls({ canvas: createElement(), onPointerDown: () => {} }),
    /onPointerMove/,
    'preview control callbacks should be explicit so missing bindings fail fast'
);

{
    const canvas = createElement();
    const windowRef = createElement();
    const calls = [];
    const bindings = bindModelEditorPreviewControls({
        canvas,
        windowRef,
        onPointerDown: (event) => calls.push(['down', event.id]),
        onPointerMove: (event) => calls.push(['move', event.id]),
        onPointerUp: (event) => calls.push(['up', event.id]),
        onPointerCancel: () => calls.push(['cancel']),
        onWheel: (event) => calls.push(['wheel', event.id]),
        onResize: () => calls.push(['resize'])
    });

    assert.equal(bindings.length, 8);
    assert.equal(typeof canvas.listeners.contextmenu, 'function');
    assert.equal(typeof canvas.listeners.pointerdown, 'function');
    assert.equal(typeof canvas.listeners.pointermove, 'function');
    assert.equal(typeof canvas.listeners.pointerup, 'function');
    assert.equal(typeof canvas.listeners.pointerleave, 'function');
    assert.equal(typeof canvas.listeners.pointercancel, 'function');
    assert.equal(typeof canvas.listeners.wheel, 'function');
    assert.equal(typeof windowRef.listeners.resize, 'function');
    assert.deepEqual(canvas.listenerOptions.wheel, { passive: false });

    let prevented = false;
    canvas.listeners.contextmenu({ preventDefault: () => { prevented = true; } });
    canvas.listeners.pointerdown({ id: 'a' });
    canvas.listeners.pointermove({ id: 'b' });
    canvas.listeners.pointerup({ id: 'c' });
    canvas.listeners.pointerleave();
    canvas.listeners.pointercancel();
    canvas.listeners.wheel({ id: 'd' });
    windowRef.listeners.resize();

    assert.equal(prevented, true);
    assert.deepEqual(calls, [
        ['down', 'a'],
        ['move', 'b'],
        ['up', 'c'],
        ['cancel'],
        ['cancel'],
        ['wheel', 'd'],
        ['resize']
    ]);
}

{
    const refs = createRefs();
    const calls = [];
    let headerBound = false;
    const callbacks = {
        onOpen: () => calls.push(['open']),
        onUndo: () => calls.push(['undo']),
        onClose: () => calls.push(['close']),
        onReadSavedConfig: () => calls.push(['read']),
        onResetToBackup: () => calls.push(['reset']),
        onSaveToRuntime: () => calls.push(['save']),
        onLoadAsset: (value) => calls.push(['asset', value]),
        onApplyColor: (value) => calls.push(['color', value]),
        onApplyPatternColor: (value) => calls.push(['patternColor', value]),
        onApplyPattern: (value) => calls.push(['pattern', value]),
        onApplyPatternScale: (value) => calls.push(['patternScale', value]),
        onApplyLineStyle: (value) => calls.push(['lineStyle', value]),
        onApplyLineWidth: (value) => calls.push(['lineWidth', value]),
        onPickScreenColor: () => calls.push(['eyedropper'])
    };

    const bindings = bindModelEditorControls({
        refs,
        eyeDropper: function EyeDropper() {},
        bindHeaderButton({ onOpen }) {
            headerBound = true;
            onOpen();
        },
        ...callbacks
    });

    assert.equal(headerBound, true);
    assert.equal(bindings.length, 14);
    assert.equal(refs.eyeDropperButton.disabled, false);

    refs.undoButton.listeners.click();
    refs.closeButton.listeners.click();
    refs.readButton.listeners.click();
    refs.resetButton.listeners.click();
    refs.saveButton.listeners.click();
    refs.assetSelect.listeners.change();
    refs.colorPicker.listeners.input();
    refs.patternColorPicker.listeners.input();
    refs.patternSelect.listeners.change();
    refs.patternScale.listeners.input();
    refs.lineStyleSelect.listeners.change();
    refs.lineWidth.listeners.input();
    refs.eyeDropperButton.listeners.click();
    refs.modal.listeners.click({ target: refs.modal });

    assert.deepEqual(calls, [
        ['open'],
        ['undo'],
        ['close'],
        ['read'],
        ['reset'],
        ['save'],
        ['asset', 'boss'],
        ['color', '#123456'],
        ['patternColor', '#abcdef'],
        ['pattern', 'hatch'],
        ['patternScale', 12.5],
        ['lineStyle', 'dashed'],
        ['lineWidth', 4.5],
        ['eyedropper'],
        ['close']
    ]);
}

{
    const refs = createRefs();
    const calls = [];
    bindModelEditorControls({
        refs,
        eyeDropper: null,
        bindHeaderButton: () => {},
        onOpen: () => calls.push('open'),
        onUndo: () => calls.push('undo'),
        onClose: () => calls.push('close'),
        onReadSavedConfig: () => calls.push('read'),
        onResetToBackup: () => calls.push('reset'),
        onSaveToRuntime: () => calls.push('save'),
        onLoadAsset: () => calls.push('asset'),
        onApplyColor: () => calls.push('color'),
        onApplyPatternColor: () => calls.push('patternColor'),
        onApplyPattern: () => calls.push('pattern'),
        onApplyPatternScale: () => calls.push('patternScale'),
        onApplyLineStyle: () => calls.push('lineStyle'),
        onApplyLineWidth: () => calls.push('lineWidth'),
        onPickScreenColor: () => calls.push('eyedropper')
    });

    refs.patternSelect.value = MODEL_EDITOR_MIXED_VALUE;
    refs.lineStyleSelect.value = MODEL_EDITOR_MIXED_VALUE;
    refs.patternSelect.listeners.change();
    refs.lineStyleSelect.listeners.change();
    refs.modal.listeners.click({ target: createElement() });

    assert.deepEqual(calls, [], 'mixed style values and non-backdrop modal clicks should not invoke callbacks');
    assert.equal(refs.eyeDropperButton.disabled, true);
}

{
    const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const modelEditorStart = indexHtml.indexOf('class ModelEditor');
    const modelEditorEnd = indexHtml.indexOf('class SoundEditor', modelEditorStart);
    const modelEditorClass = indexHtml.slice(modelEditorStart, modelEditorEnd);

    assert.match(
        modelEditorClass,
        /bindModelEditorPreviewControls\(\{[\s\S]*?canvas: this\.canvas[\s\S]*?windowRef: window[\s\S]*?onPointerDown: \(event\) => this\.handlePointerDown\(event\)[\s\S]*?onPointerCancel: \(\) => this\.cancelPointerState\(\)[\s\S]*?onWheel: \(event\) => this\.handleWheel\(event\)[\s\S]*?onResize: this\.handleResize[\s\S]*?\}\);/,
        'ModelEditor.initPreview should route preview event binding through the bindings helper'
    );
    assert.doesNotMatch(
        modelEditorClass,
        /canvas\.addEventListener\('pointerdown'|canvas\.addEventListener\('pointermove'|canvas\.addEventListener\('pointerup'|canvas\.addEventListener\('wheel'|window\.addEventListener\('resize'/,
        'ModelEditor should not own preview canvas/window event binding details'
    );
}

console.log('model-editor-bindings checks passed');
