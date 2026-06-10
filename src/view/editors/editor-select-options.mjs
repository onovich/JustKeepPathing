export function buildSelectOptionsFromLabels(labels = {}) {
    return Object.entries(labels).map(([value, label]) => ({
        value,
        label
    }));
}

export function buildSelectOptionMarkup(options = []) {
    return options
        .map(({ value, label }) => `<option value="${value}">${label}</option>`)
        .join('');
}

export function populateSelectOptions(select, options = [], { selectedValue = '' } = {}) {
    if (!select) return [];

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
        select.innerHTML = buildSelectOptionMarkup(options);
    }

    const validValues = new Set(options.map((option) => option.value));
    const nextValue = validValues.has(selectedValue)
        ? selectedValue
        : (validValues.has(previousValue) ? previousValue : options[0]?.value);
    if (nextValue) select.value = nextValue;

    return options;
}
