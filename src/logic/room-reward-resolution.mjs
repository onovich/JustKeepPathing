export function appendRoomRewardDetails(message, details = []) {
    let resolved = message;
    for (const detail of details) {
        if (!detail) continue;
        resolved = resolved ? resolved + ' ' + detail : detail;
    }
    return resolved;
}

export function finalizeRoomRewardMessage({
    message,
    details = [],
    updateUI = () => {}
}) {
    const resolved = appendRoomRewardDetails(message, details);
    updateUI();
    return resolved;
}

export function resolveHiddenRoomRewardMessage({
    sourceKey,
    room,
    message,
    anchorPos = null,
    details = [],
    applyThemeChainBonus = () => '',
    updateUI = () => {}
} = {}) {
    const themeChainMessage = applyThemeChainBonus(sourceKey, room, anchorPos);
    return finalizeRoomRewardMessage({
        message,
        details: [...details, themeChainMessage],
        updateUI
    });
}
