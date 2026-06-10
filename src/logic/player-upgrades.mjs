export const UPGRADE_TYPES = Object.freeze(['speed', 'atk', 'hp', 'chest', 'size', 'monster']);

export function getUpgradeCost(type, { player = {}, maze = {} } = {}) {
    if (type === 'speed') return Math.floor(10 * Math.pow(1.5, (player.lvSpeed || 1) - 1));
    if (type === 'atk') return Math.floor(20 * Math.pow(1.5, (player.lvAtk || 1) - 1));
    if (type === 'hp') return Math.floor(20 * Math.pow(1.4, (player.lvHp || 1) - 1));
    if (type === 'chest') return Math.floor(50 * Math.pow(1.6, (maze.lvChest || 1) - 1));
    if (type === 'size') return Math.floor(40 * Math.pow(1.7, (maze.lvSize || 1) - 1));
    if (type === 'monster') return Math.floor(100 * Math.pow(1.8, (maze.lvMonster || 1) - 1));
    return Infinity;
}

export function getUpgradeCosts({ player = {}, maze = {} } = {}) {
    return Object.fromEntries(
        UPGRADE_TYPES.map((type) => [type, getUpgradeCost(type, { player, maze })])
    );
}

export function applyUpgradePurchase({
    type,
    score = 0,
    player = {},
    maze = {},
    sizeUpgradeMaxed = false
} = {}) {
    const nextPlayer = { ...player };
    const nextMaze = { ...maze };
    const cost = getUpgradeCost(type, { player: nextPlayer, maze: nextMaze });
    if (!UPGRADE_TYPES.includes(type)) {
        return {
            purchased: false,
            blockedReason: 'unknown-upgrade',
            cost,
            score,
            player: nextPlayer,
            maze: nextMaze
        };
    }
    if (type === 'size' && sizeUpgradeMaxed) {
        return {
            purchased: false,
            blockedReason: 'size-maxed',
            cost,
            score,
            player: nextPlayer,
            maze: nextMaze
        };
    }
    if (score < cost) {
        return {
            purchased: false,
            blockedReason: 'insufficient-score',
            cost,
            score,
            player: nextPlayer,
            maze: nextMaze
        };
    }

    const nextScore = score - cost;
    if (type === 'speed') {
        nextPlayer.lvSpeed = (nextPlayer.lvSpeed || 1) + 1;
        nextPlayer.baseSpeed = Math.max(0.04, (nextPlayer.baseSpeed || 0) - 0.015);
    }
    if (type === 'atk') {
        nextPlayer.lvAtk = (nextPlayer.lvAtk || 1) + 1;
        nextPlayer.baseAtk = (nextPlayer.baseAtk || 0) + 5;
    }
    if (type === 'hp') {
        nextPlayer.lvHp = (nextPlayer.lvHp || 1) + 1;
        nextPlayer.baseHp = (nextPlayer.baseHp || 0) + 20;
        nextPlayer.currentHp = nextPlayer.baseHp;
    }
    if (type === 'chest') {
        nextMaze.lvChest = (nextMaze.lvChest || 1) + 1;
        nextMaze.baseChestRate = (nextMaze.baseChestRate || 0) + 0.02;
    }
    if (type === 'size') {
        nextMaze.lvSize = (nextMaze.lvSize || 1) + 1;
    }
    if (type === 'monster') {
        nextMaze.lvMonster = (nextMaze.lvMonster || 1) + 1;
        nextMaze.baseMonsterRate = (nextMaze.baseMonsterRate || 0) + 0.015;
    }

    return {
        purchased: true,
        blockedReason: null,
        cost,
        score: nextScore,
        player: nextPlayer,
        maze: nextMaze
    };
}
