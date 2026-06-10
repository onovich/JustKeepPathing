import { normalizeColorHex } from '../logic/model-appearance-config.mjs';

export const COMBAT_MONSTER_CARD_CLASS = 'bg-red-900/90 border-2 border-red-500 p-2 md:p-3 rounded-lg w-32 md:w-56 shadow-[0_0_15px_rgba(248,113,113,0.4)] transform skew-x-6 backdrop-blur-sm';
export const COMBAT_MONSTER_NAME_CLASS = 'text-red-100 font-bold italic mb-1 text-xs md:text-sm tracking-widest text-right';
export const COMBAT_MONSTER_BAR_CLASS = 'bg-red-500 h-full w-full hp-bar-fill origin-right';
export const COMBAT_MONSTER_TEXT_CLASS = 'text-left text-[10px] md:text-xs text-red-200 mt-1 font-mono';

export const COMBAT_BOSS_CARD_CLASS = 'bg-amber-900/90 border-2 border-amber-400 p-2 md:p-3 rounded-lg w-32 md:w-56 shadow-[0_0_18px_rgba(251,191,36,0.55)] transform skew-x-6 backdrop-blur-sm';
export const COMBAT_BOSS_NAME_CLASS = 'text-amber-50 font-bold italic mb-1 text-xs md:text-sm tracking-widest text-right';
export const COMBAT_BOSS_BAR_CLASS = 'bg-amber-400 h-full w-full hp-bar-fill origin-right';
export const COMBAT_BOSS_TEXT_CLASS = 'text-left text-[10px] md:text-xs text-amber-100 mt-1 font-mono';

function buildPercent(current, max) {
    return Math.max(0, current / max * 100);
}

export function buildCombatHpUiState({
    playerCurrentHp = 0,
    playerBaseHp = 1,
    enemyHp = 0,
    enemyMaxHp = 1,
    enemyData = {}
} = {}) {
    const boss = !!enemyData.boss;
    const finaleBoss = !!enemyData.finaleBoss;
    const playerBase = playerBaseHp || 1;
    const enemyMax = enemyMaxHp || 1;
    const finaleAccentColor = finaleBoss
        ? normalizeColorHex(enemyData.accent || enemyData.color || 0xfbbf24, '#fbbf24')
        : '';
    const finaleBaseColor = finaleBoss
        ? normalizeColorHex(enemyData.color || 0xf59e0b, '#f59e0b')
        : '';

    return {
        playerBarWidth: `${buildPercent(playerCurrentHp, playerBase)}%`,
        playerText: `${Math.floor(Math.max(0, playerCurrentHp))}/${playerBaseHp}`,
        monsterName: enemyData.name || '',
        monsterBarWidth: `${buildPercent(enemyHp, enemyMax)}%`,
        monsterText: `${Math.floor(Math.max(0, enemyHp))}/${Math.floor(enemyMaxHp)}`,
        monsterCardClass: boss ? COMBAT_BOSS_CARD_CLASS : COMBAT_MONSTER_CARD_CLASS,
        monsterNameClass: boss ? COMBAT_BOSS_NAME_CLASS : COMBAT_MONSTER_NAME_CLASS,
        monsterBarClass: boss ? COMBAT_BOSS_BAR_CLASS : COMBAT_MONSTER_BAR_CLASS,
        monsterTextClass: boss ? COMBAT_BOSS_TEXT_CLASS : COMBAT_MONSTER_TEXT_CLASS,
        customStyles: {
            cardBorderColor: finaleAccentColor,
            cardBoxShadow: finaleBoss ? `0 0 18px ${finaleAccentColor}88` : '',
            nameColor: finaleAccentColor,
            barBackground: finaleBaseColor,
            textColor: finaleAccentColor
        }
    };
}

export function applyCombatHpUiState(documentRef, state) {
    if (!documentRef || !state) return null;

    const playerBar = documentRef.getElementById('rpg-p-hp-bar');
    const playerText = documentRef.getElementById('rpg-p-hp-text');
    const monsterName = documentRef.getElementById('rpg-m-name');
    const monsterCard = documentRef.getElementById('rpg-m-card');
    const monsterBar = documentRef.getElementById('rpg-m-hp-bar');
    const monsterText = documentRef.getElementById('rpg-m-hp-text');

    if (playerBar) playerBar.style.width = state.playerBarWidth;
    if (playerText) playerText.innerText = state.playerText;
    if (monsterName) {
        monsterName.innerText = state.monsterName;
        monsterName.className = state.monsterNameClass;
        monsterName.style.color = state.customStyles.nameColor;
    }
    if (monsterCard) {
        monsterCard.className = state.monsterCardClass;
        monsterCard.style.borderColor = state.customStyles.cardBorderColor;
        monsterCard.style.boxShadow = state.customStyles.cardBoxShadow;
    }
    if (monsterBar) {
        monsterBar.style.width = state.monsterBarWidth;
        monsterBar.className = state.monsterBarClass;
        monsterBar.style.background = state.customStyles.barBackground;
    }
    if (monsterText) {
        monsterText.innerText = state.monsterText;
        monsterText.className = state.monsterTextClass;
        monsterText.style.color = state.customStyles.textColor;
    }

    return {
        playerBar,
        playerText,
        monsterName,
        monsterCard,
        monsterBar,
        monsterText
    };
}

export function showCombatOverlay(documentRef) {
    const ui = documentRef?.getElementById('rpg-combat-ui');
    if (!ui) return null;

    ui.classList.remove('hidden');
    void ui.offsetWidth;
    ui.classList.remove('opacity-0');
    return ui;
}

export function beginHideCombatOverlay(documentRef) {
    const ui = documentRef?.getElementById('rpg-combat-ui');
    if (!ui) return null;

    ui.classList.add('opacity-0');
    return ui;
}

export function finishHideCombatOverlay(ui) {
    if (!ui) return null;

    ui.classList.add('hidden');
    return ui;
}
