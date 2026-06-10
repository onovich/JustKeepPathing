function buildModelEditorAssetOptionMarkup(options) {
    return options
        .map(({ value, label }) => `<option value="${value}">${label}</option>`)
        .join('');
}

export function buildModelEditorAssetOptions(assetLabels = {}) {
    return Object.entries(assetLabels).map(([value, label]) => ({
        value,
        label
    }));
}

export function populateModelEditorAssetSelect(select, assetLabels = {}, { selectedValue = '' } = {}) {
    if (!select) return [];

    const options = buildModelEditorAssetOptions(assetLabels);
    const documentRef = select.ownerDocument || globalThis.document;
    const previousValue = select.value;

    if (documentRef?.createElement && typeof select.replaceChildren === 'function') {
        const optionNodes = options.map(({ value, label }) => {
            const option = documentRef.createElement('option');
            option.value = value;
            option.textContent = label;
            return option;
        });
        select.replaceChildren(...optionNodes);
    } else {
        select.innerHTML = buildModelEditorAssetOptionMarkup(options);
    }

    const validValues = new Set(options.map((option) => option.value));
    const nextValue = validValues.has(selectedValue)
        ? selectedValue
        : (validValues.has(previousValue) ? previousValue : options[0]?.value);
    if (nextValue) select.value = nextValue;

    return options;
}
