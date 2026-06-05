import {
    FLOOR_ARCHETYPE_DEFS,
    HIDDEN_ROOM_COUNT_PARAMS
} from '../data/floor-content.mjs';

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function getMazeSide(maze) {
    return Math.min(maze.maxSide, maze.baseSide + (maze.lvSize - 1) * 2);
}

export function getMazeDimensions(maze) {
    const side = getMazeSide(maze);
    return { cols: side, rows: side };
}

export function getMaxMazeSizeLevel(maze) {
    return 1 + Math.floor((maze.maxSide - maze.baseSide) / 2);
}

export function isMazeSizeMaxed(maze) {
    return maze.lvSize >= getMaxMazeSizeLevel(maze);
}

export function getMazeSizeFactor(maze) {
    const side = getMazeSide(maze);
    return (side * side) / (maze.baseSide * maze.baseSide);
}

export function getMazeSizeProgress(maze) {
    const side = getMazeSide(maze);
    const sideSpan = Math.max(1, maze.maxSide - maze.baseSide);
    return clamp((side - maze.baseSide) / sideSpan, 0, 1);
}

export function getMazeSizeBand(maze) {
    const sizeProgress = getMazeSizeProgress(maze);
    if (sizeProgress < 0.34) return 'small';
    if (sizeProgress < 0.67) return 'medium';
    return 'large';
}

export function isBossUnlocked(maze) {
    return maze.lvMonster >= 4;
}

export function getBossFloorChance(maze) {
    if (!isBossUnlocked(maze)) return 0;
    return Math.min(0.58, 0.14 + (maze.lvMonster - 4) * 0.11);
}

export function pickFloorArchetypeKey(level) {
    if (level > 0 && level % 6 === 0) return 'elite';
    if (level > 0 && level % 5 === 0) return 'event';
    if (level > 0 && level % 3 === 0) return 'treasure';
    return 'combat';
}

export function rollHiddenRoomCount({
    sizeProgress,
    specialFloorBonus = 0,
    unlockBonus = 0,
    random = Math.random
}) {
    const chanceOne = clamp(
        HIDDEN_ROOM_COUNT_PARAMS.baseChanceOneMin
        + sizeProgress * HIDDEN_ROOM_COUNT_PARAMS.baseChanceOneSizeScale
        + unlockBonus
        + specialFloorBonus,
        0,
        1
    );
    const chanceTwo = clamp(
        HIDDEN_ROOM_COUNT_PARAMS.baseChanceTwoMin
        + sizeProgress * HIDDEN_ROOM_COUNT_PARAMS.baseChanceTwoSizeScale
        + unlockBonus * HIDDEN_ROOM_COUNT_PARAMS.unlockBonusSecondScale
        + specialFloorBonus * HIDDEN_ROOM_COUNT_PARAMS.specialFloorBonusSecondScale,
        0,
        1
    );

    let count = 0;
    if (random() < chanceOne) count += 1;
    if (random() < chanceTwo) count += 1;
    return Math.min(HIDDEN_ROOM_COUNT_PARAMS.roomCap, count);
}

export function buildFloorContentPlan({
    level,
    maze,
    archetypeKey = 'combat',
    hiddenRoomUnlockBonus = 0,
    random = Math.random
}) {
    const resolvedArchetypeKey = archetypeKey || pickFloorArchetypeKey(level);
    const archetype = FLOOR_ARCHETYPE_DEFS[resolvedArchetypeKey] || FLOOR_ARCHETYPE_DEFS.combat;
    const sizeProgress = getMazeSizeProgress(maze);
    const sizeBand = getMazeSizeBand(maze);
    return {
        level,
        archetypeKey: resolvedArchetypeKey,
        archetype,
        sizeProgress,
        sizeBand,
        hiddenRoomCount: rollHiddenRoomCount({
            sizeProgress,
            specialFloorBonus: archetype.hiddenRoomBonus || 0,
            unlockBonus: hiddenRoomUnlockBonus,
            random
        }),
        hiddenRoomUnlockBonus
    };
}

export function calculateSpawnTargets({
    openCellCount,
    maze,
    floorPlan = null
}) {
    const sizeProgress = floorPlan?.sizeProgress ?? getMazeSizeProgress(maze);
    const archetype = floorPlan?.archetype ?? FLOOR_ARCHETYPE_DEFS.combat;

    const placementBudgetRatio = 0.12 + sizeProgress * 0.16;
    const placementBudget = Math.min(
        Math.max(0, openCellCount - 1),
        Math.floor(openCellCount * placementBudgetRatio)
    );
    if (placementBudget <= 0) return { monsters: 0, chests: 0 };

    const densityScale = 0.58 + sizeProgress * 0.42;
    const monsterDensity = maze.baseMonsterRate * (0.78 + sizeProgress * 0.45) * densityScale * (archetype.monsterRateMult ?? 1);
    const chestDensity = maze.baseChestRate * (0.72 + sizeProgress * 0.4) * densityScale * (archetype.chestRateMult ?? 1);
    const monsterTarget = Math.round(openCellCount * monsterDensity);
    const chestTarget = Math.round(openCellCount * chestDensity);

    let monsters = monsterTarget;
    let chests = chestTarget;
    const totalTargets = monsterTarget + chestTarget;

    if (totalTargets > placementBudget) {
        const monsterShare = totalTargets > 0 ? monsterTarget / totalTargets : 0.5;
        monsters = Math.min(monsterTarget, Math.round(placementBudget * monsterShare));
        chests = Math.min(chestTarget, placementBudget - monsters);

        const remainder = placementBudget - monsters - chests;
        if (remainder > 0) {
            if (monsterTarget - monsters >= chestTarget - chests) monsters += remainder;
            else chests += remainder;
        }
    }

    if (monsters === 0 && maze.lvMonster > 0 && placementBudget > 0 && (archetype.monsterRateMult ?? 1) > 0) monsters = 1;
    if (chests === 0 && maze.lvChest > 0 && placementBudget - monsters > 0 && (archetype.chestRateMult ?? 1) > 0) chests = 1;

    if (monsters + chests > placementBudget) {
        if (chests > monsters) chests = Math.max(0, placementBudget - monsters);
        else monsters = Math.max(0, placementBudget - chests);
    }

    return { monsters, chests };
}
