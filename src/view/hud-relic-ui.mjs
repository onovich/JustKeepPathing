import { RUN_RELIC_SLOTS } from '../data/relics.mjs';

export const HUD_RELIC_ACTIVE_HINT = '这些核心会持续影响当前这轮推进。';
export const HUD_RELIC_EMPTY_HINT = '精英密室和 Boss 有机会掉当前这轮的核心。';
export const HUD_RELIC_EMPTY_LIST_HTML = '<div class="rounded-lg border border-dashed border-slate-700 bg-slate-950/50 px-3 py-3 text-[11px] font-bold text-slate-500">还没有拿到核心。先闯精英密室，或者把 Boss 打出来。</div>';

export function buildHudRelicListHtml(relicDefs = []) {
    return relicDefs.length > 0
        ? relicDefs.map((relic) => `
                    <div class="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2">
                        <div class="flex items-center justify-between gap-3">
                            <div class="text-xs font-bold text-slate-100">${relic.label}</div>
                            <div class="text-[10px] font-bold text-cyan-300">${relic.summary}</div>
                        </div>
                        <div class="mt-1 text-[10px] leading-4 text-slate-400">${relic.shortLabel}</div>
                    </div>
                `).join('')
        : HUD_RELIC_EMPTY_LIST_HTML;
}

export function buildHudRelicCardState({
    relicDefs = [],
    relicSlots = RUN_RELIC_SLOTS,
    nextFloorAttackBonus = 0
} = {}) {
    return {
        countText: `${relicDefs.length}/${relicSlots}`,
        hintText: nextFloorAttackBonus > 0
            ? `回响引擎已为下层预热 +${Math.round(nextFloorAttackBonus * 100)}% 火力`
            : relicDefs.length > 0
                ? HUD_RELIC_ACTIVE_HINT
                : HUD_RELIC_EMPTY_HINT,
        listHtml: buildHudRelicListHtml(relicDefs)
    };
}

export function applyHudRelicCardState(documentRef, state) {
    if (!documentRef || !state) return null;

    const relicCountEl = documentRef.getElementById('ui-relic-count');
    const relicListEl = documentRef.getElementById('ui-relic-list');
    const relicHintEl = documentRef.getElementById('ui-relic-hint');

    if (relicCountEl) relicCountEl.innerText = state.countText;
    if (relicHintEl) relicHintEl.innerText = state.hintText;
    if (relicListEl) relicListEl.innerHTML = state.listHtml;

    return {
        relicCountEl,
        relicListEl,
        relicHintEl
    };
}

export function applyHudRelicCard(documentRef, {
    relicDefs = [],
    relicSlots = RUN_RELIC_SLOTS,
    nextFloorAttackBonus = 0
} = {}) {
    return applyHudRelicCardState(
        documentRef,
        buildHudRelicCardState({ relicDefs, relicSlots, nextFloorAttackBonus })
    );
}

export function initializeHudRelicUi({
    documentRef = document,
    slotCount = RUN_RELIC_SLOTS
} = {}) {
    const scoreCard = documentRef.getElementById('ui-score-card');
    if (!scoreCard || documentRef.getElementById('ui-relic-card')) return null;

    const card = documentRef.createElement('div');
    card.id = 'ui-relic-card';
    card.className = 'bg-slate-800 rounded-xl p-4 border-2 border-slate-700 shadow-inner';
    card.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="text-slate-400 font-bold text-sm">本轮核心</span>
            <span id="ui-relic-count" class="text-xl font-black text-cyan-300">0/${slotCount}</span>
        </div>
        <div id="ui-relic-hint" class="mt-2 text-[11px] font-bold text-slate-400">${HUD_RELIC_EMPTY_HINT}</div>
        <div id="ui-relic-list" class="mt-3 space-y-2"></div>
    `;
    scoreCard.insertAdjacentElement('afterend', card);
    return card;
}
