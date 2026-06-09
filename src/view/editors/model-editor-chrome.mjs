import {
    configureEditorCloseButton,
    setButtonTexts
} from './editor-chrome.mjs';

export function configureModelEditorHeaderButtons({
    undoButton,
    readButton,
    resetButton,
    saveButton,
    closeButton
}) {
    setButtonTexts([
        [undoButton, 'Undo'],
        [readButton, 'Load'],
        [resetButton, 'Reset'],
        [saveButton, 'Save']
    ]);
    configureEditorCloseButton(closeButton);
}
