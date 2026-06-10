export const HUD_UPGRADE_IDS = Object.freeze(['speed', 'atk', 'hp', 'chest', 'size', 'monster']);
export const HUD_UPGRADE_FLOOR_LABELS = Object.freeze({
    combat: '普通楼层',
    treasure: '藏宝楼层',
    event: '异象楼层',
    elite: '精英楼层'
});

function getUpgradeLevel(id, { player = {}, maze = {} } = {}) {
    const suffix = id.charAt(0).toUpperCase() + id.slice(1);
    return player[`lv${suffix}`] || maze[`lv${suffix}`] || 1;
}

export function buildHudUpgradeState({
    id,
    score = 0,
    player = {},
    maze = {},
    costs = {},
    mazeSide = 0,
    sizeMaxed = false
} = {}) {
    const isSize = id === 'size';
    const isSizeMaxed = isSize && sizeMaxed;
    const cost = isSizeMaxed ? null : costs[id];
    return {
        id,
        valueText: isSize ? `${mazeSide}x${mazeSide}` : `Lv.${getUpgradeLevel(id, { player, maze })}`,
        costText: isSizeMaxed ? 'MAX' : cost,
        affordable: !isSizeMaxed && score >= cost
    };
}

export function buildHudUpgradeStates({
    score = 0,
    player = {},
    maze = {},
    costs = {},
    mazeSide = 0,
    sizeMaxed = false
} = {}) {
    return HUD_UPGRADE_IDS.map((id) => buildHudUpgradeState({
        id,
        score,
        player,
        maze,
        costs,
        mazeSide,
        sizeMaxed
    }));
}

export function buildHudUpgradeDescriptionState({
    mazeSide = 0,
    mazeSizeFactor = 1,
    sizeMaxed = false,
    bossUnlocked = false,
    bossFloorChance = 0,
    floorContent = null,
    floorDirective = null
} = {}) {
    const sizeText = sizeMaxed
        ? `当前 ${mazeSide}x${mazeSide}，已经是最大迷宫`
        : `当前 ${mazeSide}x${mazeSide}，总收益约 ${Math.round(mazeSizeFactor * 100)}%`;
    const bossText = bossUnlocked
        ? `怪物更容易出现，Boss 出现概率 ${Math.round(bossFloorChance * 100)}%`
        : '怪物更容易出现，升到 Lv.4 解锁 Boss';
    const floorLabel = HUD_UPGRADE_FLOOR_LABELS[floorContent?.archetypeKey] || HUD_UPGRADE_FLOOR_LABELS.combat;
    const themeLabel = floorContent?.theme?.label;
    const finaleLabel = floorContent?.isFinaleFloor ? floorContent?.finale?.label : '';
    const themedMonsterText = themeLabel
        ? `${bossText} · ${floorLabel} · ${themeLabel}${finaleLabel ? ` · ${finaleLabel}` : ''}`
        : `${bossText} · ${floorLabel}`;

    return {
        sizeText,
        monsterText: `${themedMonsterText}${floorDirective?.label ? ` 路 ${floorDirective.label}` : ''}${floorDirective?.summary ? ` 路 ${floorDirective.summary}` : ''}`
    };
}

export function applyHudUpgradeState(documentRef, state) {
    if (!documentRef || !state?.id) return null;

    const valueEl = documentRef.getElementById(`val-${state.id}`);
    const costEl = documentRef.getElementById(`cost-${state.id}`);
    const buttonEl = documentRef.getElementById(`btn-up-${state.id}`);

    if (valueEl) valueEl.innerText = state.valueText;
    if (costEl) costEl.innerText = state.costText;
    if (buttonEl) {
        if (state.affordable) buttonEl.classList.remove('opacity-50', 'grayscale');
        else buttonEl.classList.add('opacity-50', 'grayscale');
    }

    return {
        valueEl,
        costEl,
        buttonEl
    };
}

export function applyHudUpgradeStates(documentRef, states = []) {
    return states.map((state) => applyHudUpgradeState(documentRef, state));
}

export function applyHudUpgradeDescriptions(documentRef, state) {
    if (!documentRef || !state) return null;

    const sizeDescEl = documentRef.getElementById('desc-size');
    const monsterDescEl = documentRef.getElementById('desc-monster');

    if (sizeDescEl) sizeDescEl.innerText = state.sizeText;
    if (monsterDescEl) monsterDescEl.innerText = state.monsterText;

    return {
        sizeDescEl,
        monsterDescEl
    };
}
