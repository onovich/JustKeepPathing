export function appendRoomRewardDetails(message, details = []) {
    let resolved = message;
    for (const detail of details) {
        if (detail) resolved += ' ' + detail;
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
