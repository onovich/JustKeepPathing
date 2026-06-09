import {
    configureEditorCloseButton,
    configureEditorStopButton,
    setButtonTexts
} from './editor-chrome.mjs';

export const SOUND_EDITOR_PREVIEW_BUTTON_CLASS = 'flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-700 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25';

export function configureSoundEditorTransportButtons({
    previewButton,
    stopPreviewButton,
    readButton,
    resetButton,
    saveButton,
    closeButton
}) {
    previewButton.className = SOUND_EDITOR_PREVIEW_BUTTON_CLASS;
    configureEditorStopButton(stopPreviewButton);
    setButtonTexts([
        [readButton, 'Load'],
        [resetButton, 'Reset'],
        [saveButton, 'Save']
    ]);
    configureEditorCloseButton(closeButton);
}
