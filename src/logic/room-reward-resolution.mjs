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

export function formatRunRelicRewardMessage({
    result,
    contextLabel = ''
} = {}) {
    if (!result || result.status === 'miss') return '';

    if (result.status === 'added' && result.relic) {
        const prefix = contextLabel ? `${contextLabel} ` : '';
        return `${prefix}掉出了核心「${result.relic.label}」，${result.relic.shortLabel}`;
    }

    if ((result.status === 'overflow' || result.status === 'duplicate' || result.status === 'empty-pool') && result.bonusScore > 0) {
        if (result.status === 'duplicate') {
            return `这枚核心你已经拿过了，转化成了 ${result.bonusScore} 魂能。`;
        }
        if (result.status === 'empty-pool') {
            return `当前核心池没有新的可用核心，额外掉落转化成了 ${result.bonusScore} 魂能。`;
        }
        return `核心槽已经装满，额外掉落转化成了 ${result.bonusScore} 魂能。`;
    }

    return '';
}

export function buildRunRelicRewardEffectPlan(result) {
    if (!result) return { kind: 'none' };

    if (result.status === 'added' && result.relic) {
        return {
            kind: 'added',
            sound: 'upgrade',
            burstColor: 0x22d3ee,
            burstCount: 22,
            burstScale: 2.1,
            floatingText: result.relic.label,
            textColor: '#67e8f9',
            strong: true
        };
    }

    if ((result.status === 'overflow' || result.status === 'duplicate' || result.status === 'empty-pool') && result.bonusScore > 0) {
        return {
            kind: 'bonus-score',
            floatingText: `+核心残响 ${result.bonusScore}`,
            textColor: '#facc15',
            strong: true
        };
    }

    return { kind: 'none' };
}
