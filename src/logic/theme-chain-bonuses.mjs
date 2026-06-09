const THEME_CHAIN_SOURCE_SETS = Object.freeze({
    ember_forge: Object.freeze(['event', 'elite', 'trial']),
    salvage_reaches: Object.freeze(['treasure', 'merchant', 'rest']),
    signal_warrens: Object.freeze(['event', 'trial']),
    quarantine_vault: Object.freeze(['rest', 'elite'])
});

function getRewardTier(roomOrTier) {
    if (typeof roomOrTier === 'number') return Math.max(1, roomOrTier || 1);
    return Math.max(1, roomOrTier?.rewardTier || 1);
}

function supportsSource(themeKey, sourceKey) {
    return (THEME_CHAIN_SOURCE_SETS[themeKey] || []).includes(sourceKey);
}

export function buildThemeChainBonusPlan({
    themeKey,
    sourceKey,
    rewardTier,
    level = 1,
    playerBaseHp = 1
}) {
    const tier = getRewardTier(rewardTier);
    if (!themeKey || !sourceKey || !supportsSource(themeKey, sourceKey)) return null;

    if (themeKey === 'ember_forge') {
        return {
            kind: themeKey,
            attackBonus: Math.min(0.18, 0.04 + tier * 0.015),
            nextFloorAttackBonusCap: 0.42,
            supplyType: sourceKey === 'elite' && tier >= 3 ? 'assault' : null,
            supplyCount: sourceKey === 'elite' && tier >= 3 ? 1 : 0
        };
    }

    if (themeKey === 'salvage_reaches') {
        return {
            kind: themeKey,
            scoreBonus: Math.floor((16 + tier * 7) * level * 0.72),
            supplyType: 'salvage',
            supplyCount: 1
        };
    }

    if (themeKey === 'signal_warrens') {
        return {
            kind: themeKey,
            hiddenRoomBonus: 0.03 + tier * 0.012,
            nextHiddenRoomBonusCap: 0.38,
            supplyType: sourceKey === 'event' || tier >= 3 ? 'scout' : null,
            supplyCount: sourceKey === 'event' || tier >= 3 ? 1 : 0
        };
    }

    if (themeKey === 'quarantine_vault') {
        return {
            kind: themeKey,
            damageReduction: Math.min(0.2, 0.06 + tier * 0.02),
            incomingDamageFloor: 0.58,
            repair: Math.max(8, Math.floor(playerBaseHp * (0.04 + tier * 0.012))),
            refreshReflexShield: sourceKey === 'elite'
        };
    }

    return null;
}
