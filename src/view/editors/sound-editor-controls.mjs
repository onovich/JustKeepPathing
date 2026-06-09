export function getSoundControlId(group, field) {
    return `snd-${group}-${field}`;
}

export function formatSoundControlDisplay(value, step, unit = '') {
    const precision = step < 1 ? (step < 0.1 ? 2 : 1) : 0;
    return `${Number(value).toFixed(precision)}${unit}`;
}

export function renderSoundSliderControl({
    label,
    field,
    value,
    min,
    max,
    step,
    unit = '',
    group
}) {
    const id = getSoundControlId(group, field);
    const display = formatSoundControlDisplay(value, step, unit);
    return `
            <label for="${id}" class="block rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div class="mb-2 flex items-center justify-between text-xs font-bold text-slate-200">
                    <span>${label}</span>
                    <span class="text-cyan-300" id="${id}-value">${display}</span>
                </div>
                <input id="${id}" data-group="${group}" data-field="${field}" class="settings-slider w-full" type="range" min="${min}" max="${max}" step="${step}" value="${value}">
            </label>
        `;
}

export function renderSoundSelectControl({
    label,
    field,
    value,
    options,
    group
}) {
    const id = getSoundControlId(group, field);
    return `
            <label for="${id}" class="block rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div class="mb-2 text-xs font-bold text-slate-200">${label}</div>
                <select id="${id}" data-group="${group}" data-field="${field}" class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-slate-100 outline-none focus:border-cyan-500">
                    ${options.map((option) => `<option value="${option.value}" ${option.value === value ? 'selected' : ''}>${option.label}</option>`).join('')}
                </select>
            </label>
        `;
}

export function renderSoundCheckboxControl({
    label,
    field,
    checked,
    group
}) {
    const id = getSoundControlId(group, field);
    return `
            <label for="${id}" class="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm font-bold text-slate-100">
                <span>${label}</span>
                <input id="${id}" data-group="${group}" data-field="${field}" type="checkbox" class="h-4 w-4 accent-cyan-400" ${checked ? 'checked' : ''}>
            </label>
        `;
}
