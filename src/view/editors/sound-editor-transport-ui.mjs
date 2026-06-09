export const SOUND_EDITOR_PLAY_ICON_SVG = '<svg viewBox="0 0 24 24" class="h-4.5 w-4.5" fill="currentColor" aria-hidden="true"><path d="M8 6.5v11l9-5.5-9-5.5Z"></path></svg>';

export const SOUND_EDITOR_PAUSE_ICON_SVG = '<svg viewBox="0 0 24 24" class="h-4.5 w-4.5" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"></path></svg>';

export function buildSoundEditorTransportState({
    currentSoundKey,
    def,
    currentPreviewKey = null,
    isContinuousPreviewActive = false,
    previewPaused = false
} = {}) {
    const isContinuous = def?.type === 'loop' || def?.type === 'bgm';
    const isCurrentActive = isContinuous && currentPreviewKey === currentSoundKey && isContinuousPreviewActive;
    const isPaused = isCurrentActive && previewPaused;
    const showPause = isCurrentActive && !isPaused;
    return {
        isContinuous,
        isCurrentActive,
        isPaused,
        showPause,
        previewTitle: showPause ? 'Pause' : 'Play',
        previewAriaLabel: showPause ? 'Pause' : 'Play',
        previewIconSvg: showPause ? SOUND_EDITOR_PAUSE_ICON_SVG : SOUND_EDITOR_PLAY_ICON_SVG,
        stopDisabled: !isCurrentActive && !previewPaused
    };
}

export function getSoundEditorPreviewToggleAction(options = {}) {
    const state = buildSoundEditorTransportState(options);
    if (state.isCurrentActive && !state.isPaused) return 'pause';
    if (state.isCurrentActive && state.isPaused) return 'resume';
    return 'preview';
}

export function shouldSyncSoundEditorPreviewConfig({
    currentSoundKey,
    currentPreviewKey = null,
    isContinuousPreviewActive = false
} = {}) {
    return currentPreviewKey === currentSoundKey && isContinuousPreviewActive;
}

export function applySoundEditorTransportState({ previewButton, stopPreviewButton, state }) {
    previewButton.title = state.previewTitle;
    previewButton.setAttribute('aria-label', state.previewAriaLabel);
    previewButton.innerHTML = state.previewIconSvg;
    stopPreviewButton.disabled = state.stopDisabled;
    stopPreviewButton.classList.toggle('opacity-40', state.stopDisabled);
    stopPreviewButton.classList.toggle('cursor-not-allowed', state.stopDisabled);
}
