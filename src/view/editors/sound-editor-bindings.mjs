export function getSoundEditorControlEventName(control) {
    const tagName = String(control?.tagName || '').toUpperCase();
    const type = String(control?.type || '').toLowerCase();
    return tagName === 'SELECT' || type === 'checkbox' ? 'change' : 'input';
}

export function bindSoundEditorRenderedControls({ controlsEl, onControlEvent }) {
    if (!controlsEl || typeof controlsEl.querySelectorAll !== 'function') {
        return [];
    }
    if (typeof onControlEvent !== 'function') {
        throw new TypeError('bindSoundEditorRenderedControls requires onControlEvent');
    }

    const controls = Array.from(controlsEl.querySelectorAll('input, select'));
    controls.forEach((control) => {
        control.addEventListener(getSoundEditorControlEventName(control), () => onControlEvent(control));
    });
    return controls;
}
