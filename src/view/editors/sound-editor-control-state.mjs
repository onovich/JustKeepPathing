export function getSoundEditorControlTarget(control) {
    const dataset = control?.dataset || {};
    return {
        group: dataset.group || '',
        field: dataset.field || ''
    };
}

export function readSoundEditorControlRawValue(control) {
    return String(control?.type || '').toLowerCase() === 'checkbox'
        ? !!control.checked
        : control?.value;
}

export function applySoundEditorControlState({
    workingConfig,
    currentSoundKey,
    currentTrackIndex = 0,
    group,
    field,
    rawValue,
    inputType = ''
}) {
    const hasControlTarget = !!(group && field);
    if (!hasControlTarget) {
        return { workingConfig, currentTrackIndex, hasControlTarget };
    }

    const isCheckbox = String(inputType).toLowerCase() === 'checkbox';
    if (group === 'oneshot') {
        workingConfig.sounds[currentSoundKey][field] = field === 'waveform' ? rawValue : Number(rawValue);
    } else if (group === 'loop') {
        workingConfig.sounds.footsteps[field] = Number(rawValue);
    } else if (group === 'track') {
        workingConfig.sounds.footsteps.tracks[currentTrackIndex][field] = isCheckbox
            ? rawValue
            : (field === 'waveform' ? rawValue : Number(rawValue));
    } else if (group === 'bgm') {
        workingConfig.sounds.bgm[field] = isCheckbox
            ? rawValue
            : (field === 'kernel' ? rawValue : Number(rawValue));
    } else if (group === 'meta' && field === 'trackIndex') {
        currentTrackIndex = Number(rawValue);
    }

    return { workingConfig, currentTrackIndex, hasControlTarget };
}

export function applySoundEditorControlValue({
    workingConfig,
    currentSoundKey,
    currentTrackIndex = 0,
    control
}) {
    const { group, field } = getSoundEditorControlTarget(control);
    return applySoundEditorControlState({
        workingConfig,
        currentSoundKey,
        currentTrackIndex,
        group,
        field,
        rawValue: readSoundEditorControlRawValue(control),
        inputType: control?.type
    });
}
