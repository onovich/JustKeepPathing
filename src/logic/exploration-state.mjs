export function buildExplorationChestPickupStatePlan({
    level = 1,
    chestRewardMult = 1
} = {}) {
    const reward = Math.floor(15 * level * (chestRewardMult || 1));
    return {
        reward,
        actions: [
            { type: 'score', amount: reward },
            { type: 'increment-floor-stat', field: 'chests', amount: 1 }
        ]
    };
}

export function buildLevelExitStatePlan({
    level = 1
} = {}) {
    const reward = 100 * level;
    return {
        reward,
        nextLevel: level + 1,
        actions: [
            { type: 'score', amount: reward },
            { type: 'increment-game-field', field: 'level', amount: 1 }
        ]
    };
}
