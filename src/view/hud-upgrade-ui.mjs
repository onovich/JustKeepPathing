export const HUD_UPGRADE_IDS = Object.freeze(['speed', 'atk', 'hp', 'chest', 'size', 'monster']);

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
