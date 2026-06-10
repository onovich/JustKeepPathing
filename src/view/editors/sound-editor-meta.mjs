export function getSoundEditorTypeLabel(type) {
    if (type === 'oneshot') return '\u666e\u901a\u97f3\u6548';
    if (type === 'loop') return '\u8fde\u7eed\u97f3\u6548';
    return '\u80cc\u666f\u97f3\u4e50';
}

export function buildSoundEditorMeta(def = {}) {
    return {
        typeLabel: getSoundEditorTypeLabel(def.type),
        usage: def.usage || '',
        description: def.description || ''
    };
}

export function renderSoundEventOptions(soundEventDefs) {
    return Object.entries(soundEventDefs)
        .map(([key, def]) => `<option value="${key}">${def.label}</option>`)
        .join('');
}

export function applySoundEditorEventOptions({
    select,
    soundEventDefs,
    currentSoundKey
} = {}) {
    const markup = renderSoundEventOptions(soundEventDefs);
    if (!select) return markup;

    select.innerHTML = markup;
    select.value = currentSoundKey;
    return markup;
}

export function applySoundEditorMeta({
    typeEl,
    usageEl,
    descriptionEl,
    select,
    currentSoundKey,
    def
}) {
    const meta = buildSoundEditorMeta(def);
    typeEl.innerText = meta.typeLabel;
    usageEl.innerText = meta.usage;
    descriptionEl.innerText = meta.description;
    select.value = currentSoundKey;
    return meta;
}
