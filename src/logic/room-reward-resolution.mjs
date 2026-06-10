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

function getSupplyLabel(supplyLabels, type, fallback) {
    return supplyLabels?.[type] || fallback;
}

export function formatThemeChainBonusMessage({
    plan = null,
    supplyLabels = {}
} = {}) {
    if (!plan?.kind) return '';

    if (plan.kind === 'ember_forge') {
        const attackBonus = plan.attackBonus || 0;
        if (plan.supplyType) {
            const label = getSupplyLabel(supplyLabels, 'assault', '战备补给');
            return `熔压火线顺手把下一层火力又预热了 ${Math.round(attackBonus * 100)}%，并补了 1 份${label}。`;
        }
        return `熔压火线顺手把下一层火力又预热了 ${Math.round(attackBonus * 100)}%。`;
    }

    if (plan.kind === 'salvage_reaches') {
        const salvageBonus = plan.scoreBonus || 0;
        const label = getSupplyLabel(supplyLabels, 'salvage', '探宝补给');
        return `回收浪潮又卷出 ${salvageBonus} 魂能，并补了 1 份${label}。`;
    }

    if (plan.kind === 'signal_warrens') {
        const hiddenBonus = plan.hiddenRoomBonus || 0;
        if (plan.supplyType) {
            const label = getSupplyLabel(supplyLabels, 'scout', '侦测补给');
            return `讯号导流把下层密室率又抬了 ${Math.round(hiddenBonus * 100)}%，并补了 1 份${label}。`;
        }
        return `讯号导流把下层密室率又抬了 ${Math.round(hiddenBonus * 100)}%。`;
    }

    if (plan.kind === 'quarantine_vault') {
        const repair = plan.repair || 0;
        if (plan.refreshReflexShield) {
            return `封锁协议稳住了机体，立刻修复 ${repair} 点护盾，并重新挂上一次反射护盾。`;
        }
        return `封锁协议稳住了机体，立刻修复 ${repair} 点护盾，并让本层后续受伤更轻。`;
    }

    return '';
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
