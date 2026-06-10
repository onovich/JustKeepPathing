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
