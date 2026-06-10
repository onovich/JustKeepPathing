export function buildFinaleBossArchetype({
    baseBoss = null,
    bossMod = null,
    themeKey = 'finale',
    finaleLabel = '\u7ec8\u5c40\u5a01\u80c1'
} = {}) {
    if (!baseBoss || !bossMod) return baseBoss;

    return {
        ...baseBoss,
        id: `${baseBoss.id}-${themeKey || 'finale'}`,
        name: bossMod.name || baseBoss.name,
        intro: bossMod.intro || baseBoss.intro,
        attackVerb: bossMod.attackVerb || baseBoss.attackVerb,
        color: bossMod.color ?? baseBoss.color,
        accent: bossMod.accent ?? baseBoss.accent,
        baseHp: Math.max(1, Math.floor(baseBoss.baseHp * (bossMod.hpMult || 1))),
        baseAtk: Math.max(1, Math.floor(baseBoss.baseAtk * (bossMod.atkMult || 1))),
        reward: Math.max(1, Math.floor(baseBoss.reward * (bossMod.rewardMult || 1))),
        scale: (baseBoss.scale || 1) * 1.04,
        finaleBoss: true,
        finaleBossLabel: finaleLabel || '\u7ec8\u5c40\u5a01\u80c1',
        finaleBossClearBonusMult: Math.max(0, bossMod.clearBonusMult || 0),
        bossMechanic: bossMod.bossMechanic || null
    };
}

export function getFinaleBossClearBonus({
    enemyData = null,
    profileReward = 0
} = {}) {
    const mult = enemyData?.finaleBossClearBonusMult || 0;
    if (!mult) return 0;
    return Math.max(40, Math.floor(profileReward * mult));
}

export function buildBossMechanicState(enemyData = null) {
    const mechanic = enemyData?.bossMechanic;
    if (!enemyData?.finaleBoss || !mechanic?.key) return null;

    if (mechanic.key === 'heat_ramp') {
        return {
            key: mechanic.key,
            stacks: 0,
            maxStacks: mechanic.maxStacks || 3,
            atkGainPerStack: mechanic.atkGainPerStack || 0.16
        };
    }

    if (mechanic.key === 'salvage_repair') {
        return {
            key: mechanic.key,
            healRatio: mechanic.healRatio || 0.08,
            remainingTriggers: mechanic.maxTriggers || 3
        };
    }

    if (mechanic.key === 'signal_jam') {
        return {
            key: mechanic.key,
            playerDamageMult: mechanic.playerDamageMult || 0.62,
            pendingJam: false
        };
    }

    if (mechanic.key === 'seal_layers') {
        return {
            key: mechanic.key,
            layers: mechanic.layers || 2,
            damageMult: mechanic.damageMult || 0.48
        };
    }

    return null;
}
