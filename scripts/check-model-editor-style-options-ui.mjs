import assert from 'node:assert/strict';
import {
    MODEL_EDITOR_FACE_PATTERN_LABELS,
    MODEL_EDITOR_LINE_STYLE_LABELS,
    MODEL_EDITOR_MIXED_OPTION,
    buildModelEditorFacePatternOptions,
    buildModelEditorLineStyleOptions,
    populateModelEditorStyleSelects
} from '../src/view/editors/model-editor-style-options-ui.mjs';

assert.equal(MODEL_EDITOR_FACE_PATTERN_LABELS.none, '\u65e0');
assert.equal(MODEL_EDITOR_FACE_PATTERN_LABELS.halftone, '\u534a\u8c03\u7f51\u70b9');
assert.equal(MODEL_EDITOR_LINE_STYLE_LABELS.solid, '\u5b9e\u7ebf');
assert.equal(MODEL_EDITOR_MIXED_OPTION.value, '__mixed');

assert.deepEqual(
    buildModelEditorFacePatternOptions(['none', 'hatch', 'custom']),
    [
        { value: 'none', label: '\u65e0' },
        { value: 'hatch', label: '\u659c\u7ebf\u6392\u5e03' },
        { value: 'custom', label: 'custom' },
        { value: '__mixed', label: '...' }
    ],
    'face pattern options should follow the supplied key order and include mixed'
);

assert.deepEqual(
    buildModelEditorLineStyleOptions(['solid', 'dashed']),
    [
        { value: 'solid', label: '\u5b9e\u7ebf' },
        { value: 'dashed', label: '\u865a\u7ebf' },
        { value: '__mixed', label: '...' }
    ],
    'line style options should include mixed after the concrete styles'
);

function createDomSelect(value = '') {
    return {
        value,
        options: [],
        ownerDocument: {
            createElement(tagName) {
                return {
                    tagName: tagName.toUpperCase(),
                    value: '',
                    textContent: ''
                };
            }
        },
        replaceChildren(...optionNodes) {
            this.options = optionNodes;
        }
    };
}

{
    const patternSelect = createDomSelect();
    const lineStyleSelect = createDomSelect();
    const result = populateModelEditorStyleSelects({
        patternSelect,
        lineStyleSelect
    }, {
        patternKeys: ['none', 'halftone', 'dither', 'hatch'],
        selectedPattern: 'hatch',
        selectedLineStyle: 'dashed'
    });

    assert.equal(patternSelect.value, 'hatch');
    assert.equal(lineStyleSelect.value, 'dashed');
    assert.equal(patternSelect.options.length, 5);
    assert.equal(lineStyleSelect.options.length, 3);
    assert.deepEqual(
        patternSelect.options.map((option) => option.value),
        ['none', 'halftone', 'dither', 'hatch', '__mixed']
    );
    assert.deepEqual(
        lineStyleSelect.options.map((option) => option.value),
        ['solid', 'dashed', '__mixed']
    );
    assert.equal(result.patternOptions.length, 5);
    assert.equal(result.lineStyleOptions.length, 3);
}

{
    const result = populateModelEditorStyleSelects({}, {
        patternKeys: ['none'],
        selectedPattern: 'none',
        selectedLineStyle: 'solid'
    });
    assert.deepEqual(result.patternOptions, [], 'missing pattern select should be a no-op');
    assert.deepEqual(result.lineStyleOptions, [], 'missing line style select should be a no-op');
}

console.log('model-editor-style-options-ui checks passed');
