export function bindHeaderAction({ documentRef = globalThis.document, buttonId, onClick }) {
    const button = documentRef?.getElementById(buttonId);
    if (!button || typeof onClick !== 'function') return null;

    button.addEventListener('click', async (event) => {
        event.stopPropagation();
        await onClick(event);
    });
    return button;
}

export function bindModelEditorHeaderButton({ documentRef = globalThis.document, onOpen }) {
    return bindHeaderAction({
        documentRef,
        buttonId: 'btn-editor',
        onClick: onOpen
    });
}

export function bindSoundEditorHeaderButton({ documentRef = globalThis.document, soundEngine, onOpen }) {
    return bindHeaderAction({
        documentRef,
        buttonId: 'btn-sound-editor',
        onClick: async () => {
            await soundEngine.unlock();
            onOpen();
        }
    });
}
