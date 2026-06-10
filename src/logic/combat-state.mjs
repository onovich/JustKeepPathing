export function buildCombatVictoryStatePlan({
    reward = 0,
    killCount = 1
} = {}) {
    return {
        reward,
        killCount,
        actions: [
            { type: 'score', amount: reward },
            { type: 'increment-floor-stat', field: 'kills', amount: killCount }
        ]
    };
}

export function buildCombatBonusScoreStatePlan({
    bonusScore = 0
} = {}) {
    return {
        bonusScore,
        actions: bonusScore > 0
            ? [{ type: 'score', amount: bonusScore }]
            : []
    };
}

export function buildEnemyAttackDamageStatePlan({
    profileAtk = 0,
    attackRoll = 1,
    incomingDamageMult = 1,
    attackMult = 1,
    reflexShieldReady = false,
    reflexShieldDamageMult = 0.38
} = {}) {
    const damageBeforeReflex = Math.floor(profileAtk * attackRoll * incomingDamageMult * (attackMult || 1));
    const reflexShieldTriggered = !!reflexShieldReady;
    const enemyDamage = reflexShieldTriggered
        ? Math.floor(damageBeforeReflex * reflexShieldDamageMult)
        : damageBeforeReflex;
    const preventedDamage = reflexShieldTriggered
        ? Math.max(0, damageBeforeReflex - enemyDamage)
        : 0;
    const actions = [];

    if (reflexShieldTriggered) {
        actions.push({ type: 'set-floor-runtime-field', field: 'reflexShieldReady', value: false });
    }
    actions.push({ type: 'damage-player-raw', amount: enemyDamage });

    return {
        damageBeforeReflex,
        enemyDamage,
        preventedDamage,
        reflexShieldTriggered,
        reflexShieldMessage: reflexShieldTriggered
            ? `反射护盾挡下 ${preventedDamage} 点伤害，本次只承受 ${enemyDamage} 点。`
            : '',
        actions
    };
}
