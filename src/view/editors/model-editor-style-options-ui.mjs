import { populateSelectOptions } from './editor-select-options.mjs';

export const MODEL_EDITOR_FACE_PATTERN_LABELS = Object.freeze({
    none: '\u65e0',
    halftone: '\u534a\u8c03\u7f51\u70b9',
    dither: '\u6296\u52a8\u68cb\u76d8',
    hatch: '\u659c\u7ebf\u6392\u5e03'
});

export const MODEL_EDITOR_LINE_STYLE_LABELS = Object.freeze({
    solid: '\u5b9e\u7ebf',
    dashed: '\u865a\u7ebf'
});

export const MODEL_EDITOR_MIXED_OPTION = Object.freeze({
    value: '__mixed',
    label: '...'
});

export function buildModelEditorFacePatternOptions(patternKeys = []) {
    return [
        ...patternKeys.map((value) => ({
            value,
            label: MODEL_EDITOR_FACE_PATTERN_LABELS[value] || value
        })),
        MODEL_EDITOR_MIXED_OPTION
    ];
}

export function buildModelEditorLineStyleOptions(lineStyleKeys = Object.keys(MODEL_EDITOR_LINE_STYLE_LABELS)) {
    return [
        ...lineStyleKeys.map((value) => ({
            value,
            label: MODEL_EDITOR_LINE_STYLE_LABELS[value] || value
        })),
        MODEL_EDITOR_MIXED_OPTION
    ];
}

export function populateModelEditorStyleSelects({
    patternSelect,
    lineStyleSelect
} = {}, {
    patternKeys = [],
    lineStyleKeys = Object.keys(MODEL_EDITOR_LINE_STYLE_LABELS),
    selectedPattern = '',
    selectedLineStyle = ''
} = {}) {
    return {
        patternOptions: populateSelectOptions(
            patternSelect,
            buildModelEditorFacePatternOptions(patternKeys),
            { selectedValue: selectedPattern }
        ),
        lineStyleOptions: populateSelectOptions(
            lineStyleSelect,
            buildModelEditorLineStyleOptions(lineStyleKeys),
            { selectedValue: selectedLineStyle }
        )
    };
}
