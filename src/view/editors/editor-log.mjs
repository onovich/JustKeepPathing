export function buildEditorLogText({
    existingText = '',
    message,
    now = new Date(),
    locale = 'zh-CN',
    maxLines = 10
} = {}) {
    const stamp = now.toLocaleTimeString(locale, { hour12: false });
    return `${stamp} ${message}\n${existingText}`
        .trim()
        .split('\n')
        .slice(0, maxLines)
        .join('\n');
}

export function appendEditorLog(logEl, message, options = {}) {
    logEl.innerText = buildEditorLogText({
        existingText: logEl.innerText,
        message,
        ...options
    });
    return logEl.innerText;
}
