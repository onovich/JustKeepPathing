export const EDITOR_SECONDARY_ICON_BUTTON_CLASS = 'flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800';

export const EDITOR_CLOSE_ICON_SVG = '<svg viewBox="0 0 24 24" class="h-4.5 w-4.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6 18 18"></path><path d="M18 6 6 18"></path></svg>';

export const EDITOR_STOP_ICON_SVG = '<svg viewBox="0 0 24 24" class="h-4.5 w-4.5" fill="currentColor" aria-hidden="true"><path d="M7 7h10v10H7z"></path></svg>';

export function configureIconButton(button, {
    className = EDITOR_SECONDARY_ICON_BUTTON_CLASS,
    title,
    ariaLabel = title,
    iconSvg
}) {
    button.className = className;
    button.title = title;
    button.setAttribute('aria-label', ariaLabel);
    button.innerHTML = iconSvg;
    return button;
}

export function configureEditorCloseButton(button) {
    return configureIconButton(button, {
        title: 'Close',
        iconSvg: EDITOR_CLOSE_ICON_SVG
    });
}

export function configureEditorStopButton(button) {
    return configureIconButton(button, {
        title: 'Stop',
        iconSvg: EDITOR_STOP_ICON_SVG
    });
}

export function setButtonTexts(entries) {
    for (const [button, text] of entries) {
        button.textContent = text;
    }
}

export function applyEditorModalOpenState({
    modal,
    isOpen
} = {}) {
    if (isOpen) {
        modal?.classList?.remove?.('hidden');
    } else {
        modal?.classList?.add?.('hidden');
    }
    return !!isOpen;
}
