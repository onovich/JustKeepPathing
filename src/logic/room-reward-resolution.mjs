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

export function resolveEchoEngineEventBonus({
    hasEchoEngine = false,
    currentNextFloorAttackBonus = 0,
    attackBonus = 0,
    cap = 0.32
} = {}) {
    const current = Number.isFinite(currentNextFloorAttackBonus) ? currentNextFloorAttackBonus : 0;
    if (!hasEchoEngine) {
        return {
            applied: false,
            nextFloorAttackBonus: current,
            message: ''
        };
    }

    const bonus = Number.isFinite(attackBonus) ? attackBonus : 0;
    const nextFloorAttackBonus = Math.min(cap, current + bonus);
    return {
        applied: true,
        nextFloorAttackBonus,
        message: 'Echo Engine preheated next-floor attack by ' + Math.round(bonus * 100) + '%.'
    };
}
