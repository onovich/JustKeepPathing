export const MODEL_EDITOR_CLOSE_BUTTON_CLASS = 'flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800';

export const EDITOR_CLOSE_ICON_SVG = '<svg viewBox="0 0 24 24" class="h-4.5 w-4.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6 18 18"></path><path d="M18 6 6 18"></path></svg>';

export function configureEditorCloseButton(button) {
    button.className = MODEL_EDITOR_CLOSE_BUTTON_CLASS;
    button.title = 'Close';
    button.setAttribute('aria-label', 'Close');
    button.innerHTML = EDITOR_CLOSE_ICON_SVG;
    return button;
}

export function configureModelEditorHeaderButtons({
    undoButton,
    readButton,
    resetButton,
    saveButton,
    closeButton
}) {
    undoButton.textContent = 'Undo';
    readButton.textContent = 'Load';
    resetButton.textContent = 'Reset';
    saveButton.textContent = 'Save';
    configureEditorCloseButton(closeButton);
}
