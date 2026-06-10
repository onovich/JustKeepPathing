import {
    buildSelectOptionsFromLabels,
    populateSelectOptions
} from './editor-select-options.mjs';

export function buildModelEditorAssetOptions(assetLabels = {}) {
    return buildSelectOptionsFromLabels(assetLabels);
}

export function populateModelEditorAssetSelect(select, assetLabels = {}, { selectedValue = '' } = {}) {
    return populateSelectOptions(select, buildModelEditorAssetOptions(assetLabels), { selectedValue });
}
