export function buildCombatProfile({
    enemyData = {},
    level = 1,
    floorBuff = {},
    activeEliteSupports = []
} = {}) {
    const linearScale = enemyData.boss
        ? 1 + (level - 1) * 0.34
        : 1 + (level - 1) * 0.18;
    const curveScale = Math.pow(enemyData.boss ? 1.1 : 1.06, Math.max(0, level - 1));
    let rewardMult = floorBuff?.monsterRewardMult || 1;
    if (enemyData.boss) rewardMult *= floorBuff?.bossRewardMult || 1;

    let supportHpMult = 0;
    let supportAtkMult = 0;
    let intro = enemyData.intro;
    const supports = activeEliteSupports || [];

    for (const supportNode of supports) {
        supportHpMult += supportNode.supportData?.hpMult || 0;
        supportAtkMult += supportNode.supportData?.atkMult || 0;
    }

    if (supports.length > 0) {
        const supportSummary = supports
            .map((supportNode) => supportNode.supportData?.label)
            .filter(Boolean)
            .slice(0, 3)
            .join('、');
        intro = `${enemyData.intro} 当前仍有 ${supports.length} 个装置在运转${supportSummary ? `：${supportSummary}` : ''}。`;
    }

    return {
        name: enemyData.name,
        intro,
        attackVerb: enemyData.attackVerb,
        reward: Math.floor(enemyData.reward * (1 + level * 0.18) * rewardMult),
        maxHp: Math.floor(enemyData.baseHp * linearScale * curveScale * (1 + supportHpMult)),
        atk: Math.floor(enemyData.baseAtk * linearScale * (1 + supportAtkMult)),
        boss: !!enemyData.boss,
        color: enemyData.color,
        finaleBoss: !!enemyData.finaleBoss,
        bossMechanic: enemyData.bossMechanic || null
    };
}

export function buildPlayerAttackDamageStatePlan({
    playerBaseAtk = 0,
    attackMult = 1,
    attackRoll = 1,
    boss = false
} = {}) {
    const damage = Math.floor(
        playerBaseAtk
            * (attackMult || 1)
            * attackRoll
            * (boss ? 0.92 : 1)
    );

    return { damage };
}

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
