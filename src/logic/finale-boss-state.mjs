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

export function resolveBossMechanicPlayerDamage(mechanicState, damage = 0) {
    if (!mechanicState) return { damage, message: '' };

    if (mechanicState.key === 'signal_jam' && mechanicState.pendingJam) {
        mechanicState.pendingJam = false;
        const reducedDamage = Math.max(1, Math.floor(damage * mechanicState.playerDamageMult));
        return {
            damage: reducedDamage,
            message: `脉冲干扰压低了锁定精度，这一击只打出了 ${reducedDamage}。`,
            floatingText: '干扰',
            textColor: '#67e8f9',
            strong: true
        };
    }

    if (mechanicState.key === 'seal_layers' && mechanicState.layers > 0) {
        mechanicState.layers -= 1;
        const reducedDamage = Math.max(1, Math.floor(damage * mechanicState.damageMult));
        return {
            damage: reducedDamage,
            message: `封锁护壳吞掉了大半伤害，还剩 ${mechanicState.layers} 层。`,
            floatingText: `封锁 ${mechanicState.layers}`,
            textColor: '#c4b5fd',
            strong: true
        };
    }

    return { damage, message: '' };
}

export function resolveBossMechanicEnemyAttackPrep({
    mechanicState = null,
    enemyHp = 0,
    enemyMaxHp = 0
} = {}) {
    if (!mechanicState) {
        return { enemyHp, attackMult: 1, message: '' };
    }

    if (mechanicState.key === 'heat_ramp') {
        mechanicState.stacks = Math.min(mechanicState.maxStacks, mechanicState.stacks + 1);
        return {
            enemyHp,
            attackMult: 1 + mechanicState.stacks * mechanicState.atkGainPerStack,
            message: '熔压核心继续升温，下一击更重了。',
            floatingText: `过热 x${mechanicState.stacks}`,
            textColor: '#fb923c',
            strong: true
        };
    }

    if (mechanicState.key === 'salvage_repair' && mechanicState.remainingTriggers > 0 && enemyHp < enemyMaxHp) {
        const heal = Math.max(8, Math.floor(enemyMaxHp * mechanicState.healRatio));
        const nextHp = Math.min(enemyMaxHp, enemyHp + heal);
        mechanicState.remainingTriggers -= 1;
        return {
            enemyHp: nextHp,
            attackMult: 1,
            message: '回收洪流把它重新拼起来了一点。',
            floatingText: `+${nextHp - enemyHp}`,
            textColor: '#fde68a',
            strong: true,
            updateEnemyHp: true
        };
    }

    if (mechanicState.key === 'signal_jam') {
        mechanicState.pendingJam = true;
        return {
            enemyHp,
            attackMult: 1,
            message: '满频干扰已经锁上来了，你下一轮火力会被压住。',
            floatingText: '干扰脉冲',
            textColor: '#67e8f9',
            strong: true
        };
    }

    return { enemyHp, attackMult: 1, message: '' };
}
