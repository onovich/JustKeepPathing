import { RUN_RELIC_SLOTS } from '../data/relics.mjs';

export const HUD_STATUS_LABELS = Object.freeze({
    GENERATING: '挖掘中',
    EXPLORING: '自动寻路',
    COMBAT: 'RPG 战斗模式!',
    SELFTEST: '自测场景'
});

export const HUD_STATUS_BOX_CLASS = 'bg-slate-900/95 px-4 py-2 rounded-lg border-2 border-slate-700 text-sm shadow-[0_4px_0_rgba(0,0,0,0.5)]';
export const HUD_COMBAT_STATUS_BOX_CLASS = 'bg-red-900/95 px-4 py-2 rounded-lg border-2 border-red-500 text-sm shadow-[0_4px_0_rgba(153,27,27,1)] animate-pulse';
export const HUD_STATUS_TEXT_CLASS = 'text-emerald-400 font-bold ml-1';
export const HUD_COMBAT_STATUS_TEXT_CLASS = 'text-white font-bold ml-1';
export const HUD_SUPPLY_PILL_BASE_CLASS = 'px-4 py-2 rounded-lg border-2 text-sm shadow-[0_4px_0_rgba(0,0,0,0.5)]';

const HUD_SUPPLY_TEXT_CLASSES = Object.freeze({
    assault: 'text-rose-300',
    salvage: 'text-amber-300',
    scout: 'text-cyan-300'
});

const HUD_SUPPLY_PILL_CLASSES = Object.freeze({
    assault: 'bg-rose-950/80 border-rose-700/80',
    salvage: 'bg-amber-950/80 border-amber-700/80',
    scout: 'bg-cyan-950/80 border-cyan-700/80'
});

export const HUD_SUPPLY_MODE_LABELS = Object.freeze({
    balanced: '自动均衡',
    combat: '偏战斗',
    loot: '偏资源',
    explore: '偏密室'
});

const HUD_SUPPLY_ACTIVE_DESCRIPTIONS = Object.freeze({
    assault: '本层当前偏战斗推进。系统会自动消耗储备，不需要手动购买。',
    salvage: '本层当前偏资源回收。系统会自动消耗储备，不需要手动购买。',
    scout: '本层当前偏密室探索。系统会自动消耗储备，不需要手动购买。'
});

export const HUD_SUPPLY_RESERVE_DESCRIPTION = '系统会在合适的楼层自动消耗补给储备，不需要你重复操作。';
export const HUD_SUPPLY_EMPTY_DESCRIPTION = '当前没有补给储备。后续可通过宝箱、房间奖励和主题效果自动补充。';

export function buildHudRuntimeStatusState({
    phase = 'EXPLORING',
    floorContent = null,
    floorBuff = {}
} = {}) {
    const combat = phase === 'COMBAT';
    const themeLabel = floorContent?.theme?.label || '';
    const accent = floorContent?.theme?.accentColor || '#93c5fd';
    const finaleLabel = floorContent?.isFinaleFloor ? floorContent?.finale?.label || '' : '';
    const actFloor = floorContent?.actFloor || 1;
    const actLength = floorContent?.actLength || 6;
    const supplyActive = !!floorBuff?.supplyActive && !!floorBuff?.supplyLabel;
    const supplyKey = floorBuff?.supplyKey || '';
    const themeText = themeLabel
        ? finaleLabel
            ? `${themeLabel} · ${actFloor}/${actLength} · ${finaleLabel}`
            : `${themeLabel} · ${actFloor}/${actLength}`
        : '';

    return {
        statusText: HUD_STATUS_LABELS[phase] || '就绪',
        statusBoxClass: combat ? HUD_COMBAT_STATUS_BOX_CLASS : HUD_STATUS_BOX_CLASS,
        statusTextClass: combat ? HUD_COMBAT_STATUS_TEXT_CLASS : HUD_STATUS_TEXT_CLASS,
        theme: {
            visible: !!themeLabel,
            borderColor: `${accent}66`,
            backgroundColor: `${accent}22`,
            textColor: accent,
            text: themeText
        },
        supply: {
            visible: supplyActive,
            label: floorBuff?.supplyLabel || '',
            pillClass: `${HUD_SUPPLY_PILL_BASE_CLASS} ${HUD_SUPPLY_PILL_CLASSES[supplyKey] || 'bg-slate-900/95 border-slate-700'}`,
            textClass: `ml-1 inline-block font-bold ${HUD_SUPPLY_TEXT_CLASSES[supplyKey] || 'text-emerald-300'}`
        }
    };
}

export function applyHudRuntimeStatusState(documentRef, state) {
    if (!documentRef || !state) return null;

    const statusSpan = documentRef.getElementById('ui-status');
    const statusBox = documentRef.getElementById('ui-status-box');
    const themePill = documentRef.getElementById('ui-theme-pill');
    const themePillText = documentRef.getElementById('ui-theme-pill-text');
    const supplyPill = documentRef.getElementById('ui-supply-pill');
    const supplyPillText = documentRef.getElementById('ui-supply-pill-text');

    if (statusSpan) {
        statusSpan.innerText = state.statusText;
        statusSpan.className = state.statusTextClass;
    }
    if (statusBox) statusBox.className = state.statusBoxClass;

    if (themePill && themePillText) {
        if (state.theme.visible) {
            themePill.classList.remove('hidden');
            themePill.style.borderColor = state.theme.borderColor;
            themePill.style.backgroundColor = state.theme.backgroundColor;
            themePillText.style.color = state.theme.textColor;
            themePillText.innerText = state.theme.text;
        } else {
            themePill.classList.add('hidden');
        }
    }

    if (supplyPill && supplyPillText) {
        if (state.supply.visible) {
            supplyPill.classList.remove('hidden');
            supplyPill.className = state.supply.pillClass;
            supplyPillText.className = state.supply.textClass;
            supplyPillText.innerText = state.supply.label;
        } else {
            supplyPill.classList.add('hidden');
        }
    }

    return {
        statusSpan,
        statusBox,
        themePill,
        themePillText,
        supplyPill,
        supplyPillText
    };
}

export function applyHudRuntimeStatus(documentRef, {
    phase = 'EXPLORING',
    floorContent = null,
    floorBuff = {}
} = {}) {
    return applyHudRuntimeStatusState(
        documentRef,
        buildHudRuntimeStatusState({ phase, floorContent, floorBuff })
    );
}

export function buildHudSupplyCardState({
    supplyMode = 'balanced',
    totalSupply = 0,
    floorBuff = {}
} = {}) {
    const count = Number.isFinite(Number(totalSupply)) ? Number(totalSupply) : 0;
    const supplyKey = floorBuff?.supplyKey || '';
    const activeDescription = HUD_SUPPLY_ACTIVE_DESCRIPTIONS[supplyKey] || '';
    return {
        modeText: HUD_SUPPLY_MODE_LABELS[supplyMode] || HUD_SUPPLY_MODE_LABELS.balanced,
        statusText: `补给储备 x${count}`,
        descText: activeDescription || (count > 0 ? HUD_SUPPLY_RESERVE_DESCRIPTION : HUD_SUPPLY_EMPTY_DESCRIPTION)
    };
}

export function applyHudSupplyCardState(documentRef, state) {
    if (!documentRef || !state) return null;

    const supplyModeEl = documentRef.getElementById('ui-supply-mode');
    const supplyStatusEl = documentRef.getElementById('ui-supply-status');
    const supplyDescEl = documentRef.getElementById('ui-supply-desc');

    if (supplyModeEl) supplyModeEl.innerText = state.modeText;
    if (supplyStatusEl) supplyStatusEl.innerText = state.statusText;
    if (supplyDescEl) supplyDescEl.innerText = state.descText;

    return {
        supplyModeEl,
        supplyStatusEl,
        supplyDescEl
    };
}

export function applyHudSupplyCard(documentRef, {
    supplyMode = 'balanced',
    totalSupply = 0,
    floorBuff = {}
} = {}) {
    return applyHudSupplyCardState(
        documentRef,
        buildHudSupplyCardState({ supplyMode, totalSupply, floorBuff })
    );
}

function initializeSupplyCardUi() {
    const card = document.getElementById('ui-supply-card');
    if (!card) return;
    card.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="text-slate-400 font-bold text-sm">挂机倾向</span>
            <span id="ui-supply-mode" class="text-sm font-black text-emerald-300">自动均衡</span>
        </div>
        <div id="ui-supply-status" class="mt-2 text-[11px] font-bold text-slate-300">补给储备 x0</div>
        <div id="ui-supply-desc" class="mt-1 text-[10px] leading-5 text-slate-500">系统会自动使用补给储备，不需要手动购买或切换。</div>
    `;
}

function initializeUpgradeStripUi() {
    let strip = document.getElementById('upgrade-strip');
    if (!strip) {
        const dock = document.getElementById('ui-mobile-dock');
        if (!dock) return;
        strip = document.createElement('div');
        strip.id = 'upgrade-strip';
        strip.className = 'space-y-3';
        const supplyCard = document.getElementById('ui-supply-card');
        if (supplyCard?.parentElement === dock && supplyCard.nextSibling) {
            dock.insertBefore(strip, supplyCard.nextSibling);
        } else {
            dock.appendChild(strip);
        }
    }
    strip.innerHTML = `
        <button id="btn-up-speed" class="upgrade-btn w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left border-2 border-slate-700 flex justify-between items-center">
            <div>
                <div class="font-bold text-blue-300 flex items-center gap-2">升级移动速度 <span id="val-speed" class="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800/50">Lv.1</span></div>
                <div class="text-[10px] text-slate-500 mt-0.5">提高自动寻路移动速度</div>
            </div>
            <div class="text-right"><div id="cost-speed" class="text-yellow-400 font-bold text-sm">10</div></div>
        </button>
        <button id="btn-up-atk" class="upgrade-btn w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left border-2 border-slate-700 flex justify-between items-center">
            <div>
                <div class="font-bold text-red-400 flex items-center gap-2">升级攻击力 <span id="val-atk" class="text-[10px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-800/50">Lv.1</span></div>
                <div class="text-[10px] text-slate-500 mt-0.5">提高每次攻击造成的伤害</div>
            </div>
            <div class="text-right"><div id="cost-atk" class="text-yellow-400 font-bold text-sm">20</div></div>
        </button>
        <button id="btn-up-hp" class="upgrade-btn w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left border-2 border-slate-700 flex justify-between items-center">
            <div>
                <div class="font-bold text-green-400 flex items-center gap-2">升级生命值 <span id="val-hp" class="text-[10px] bg-green-950 text-green-300 px-1.5 py-0.5 rounded border border-green-800/50">Lv.1</span></div>
                <div class="text-[10px] text-slate-500 mt-0.5">提高生命值上限</div>
            </div>
            <div class="text-right"><div id="cost-hp" class="text-yellow-400 font-bold text-sm">20</div></div>
        </button>
        <button id="btn-up-chest" class="upgrade-btn w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left border-2 border-slate-700 flex justify-between items-center">
            <div>
                <div class="font-bold text-yellow-300 flex items-center gap-2">升级宝箱密度 <span id="val-chest" class="text-[10px] bg-yellow-950 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-800/50">Lv.1</span></div>
                <div class="text-[10px] text-slate-500 mt-0.5">提高地图中的宝箱出现率</div>
            </div>
            <div class="text-right"><div id="cost-chest" class="text-yellow-400 font-bold text-sm">50</div></div>
        </button>
        <button id="btn-up-size" class="upgrade-btn w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left border-2 border-slate-700 flex justify-between items-center">
            <div>
                <div class="font-bold text-cyan-300 flex items-center gap-2">升级迷宫规模 <span id="val-size" class="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/50">11x11</span></div>
                <div id="desc-size" class="text-[10px] text-slate-500 mt-0.5">增大迷宫规模并提升整体产出</div>
            </div>
            <div class="text-right"><div id="cost-size" class="text-yellow-400 font-bold text-sm">40</div></div>
        </button>
        <button id="btn-up-monster" class="upgrade-btn w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left border-2 border-slate-700 flex justify-between items-center">
            <div>
                <div class="font-bold text-purple-400 flex items-center gap-2">升级怪物与Boss密度 <span id="val-monster" class="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/50">Lv.1</span></div>
                <div id="desc-monster" class="text-[10px] text-slate-500 mt-0.5">提高怪物出现率，并逐步解锁Boss</div>
            </div>
            <div class="text-right"><div id="cost-monster" class="text-yellow-400 font-bold text-sm">100</div></div>
        </button>
    `;
    const setUpgradeCopy = (buttonId, titleHtml, detailText) => {
        const button = strip.querySelector(`#${buttonId}`);
        if (!button) return;
        const titleEl = button.querySelector('div > div');
        const detailEl = button.querySelector('div > div:nth-child(2)');
        if (titleEl) titleEl.innerHTML = titleHtml;
        if (detailEl) detailEl.innerText = detailText;
    };
    setUpgradeCopy('btn-up-speed', '升级移动速度 <span id="val-speed" class="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800/50">Lv.1</span>', '提高自动寻路移动速度');
    setUpgradeCopy('btn-up-atk', '升级攻击力 <span id="val-atk" class="text-[10px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-800/50">Lv.1</span>', '提高每次攻击造成的伤害');
    setUpgradeCopy('btn-up-hp', '升级生命值 <span id="val-hp" class="text-[10px] bg-green-950 text-green-300 px-1.5 py-0.5 rounded border border-green-800/50">Lv.1</span>', '提高生命值上限');
    setUpgradeCopy('btn-up-chest', '升级宝箱密度 <span id="val-chest" class="text-[10px] bg-yellow-950 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-800/50">Lv.1</span>', '提高地图中的宝箱出现率');
    setUpgradeCopy('btn-up-size', '升级迷宫规模 <span id="val-size" class="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/50">11x11</span>', '增大迷宫规模并提升整体产出');
    setUpgradeCopy('btn-up-monster', '升级怪物与Boss密度 <span id="val-monster" class="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/50">Lv.1</span>', '提高怪物出现率，并逐步解锁Boss');
    if (!document.getElementById('ui-mobile-dock-spacer')) {
        const spacer = document.createElement('div');
        spacer.id = 'ui-mobile-dock-spacer';
        spacer.className = 'h-4';
        strip.insertAdjacentElement('afterend', spacer);
    }
}

function initializeRelicCardUi() {
    const scoreCard = document.getElementById('ui-score-card');
    if (!scoreCard || document.getElementById('ui-relic-card')) return;
    const card = document.createElement('div');
    card.id = 'ui-relic-card';
    card.className = 'bg-slate-800 rounded-xl p-4 border-2 border-slate-700 shadow-inner';
    card.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="text-slate-400 font-bold text-sm">本轮核心</span>
            <span id="ui-relic-count" class="text-xl font-black text-cyan-300">0/${RUN_RELIC_SLOTS}</span>
        </div>
        <div id="ui-relic-hint" class="mt-2 text-[11px] font-bold text-slate-400">精英密室和 Boss 有机会掉当前这轮的核心。</div>
        <div id="ui-relic-list" class="mt-3 space-y-2"></div>
    `;
    scoreCard.insertAdjacentElement('afterend', card);
}

function initializeSupplyStatusPill() {
    const host = document.getElementById('ui-status-box')?.parentElement;
    if (!host || document.getElementById('ui-supply-pill')) return;
    const pill = document.createElement('div');
    pill.id = 'ui-supply-pill';
    pill.className = 'hidden bg-slate-900/95 px-4 py-2 rounded-lg border-2 border-slate-700 text-sm shadow-[0_4px_0_rgba(0,0,0,0.5)]';
    pill.innerHTML = '<span class="whitespace-nowrap">本层倾向</span><span id="ui-supply-pill-text" class="ml-1 inline-block font-bold text-emerald-300">未启用</span>';
    host.appendChild(pill);
}

function initializeThemeStatusPill() {
    const host = document.getElementById('ui-status-box')?.parentElement;
    if (!host || document.getElementById('ui-theme-pill')) return;
    const pill = document.createElement('div');
    pill.id = 'ui-theme-pill';
    pill.className = 'hidden px-4 py-2 rounded-lg border-2 border-slate-700 text-sm shadow-[0_4px_0_rgba(0,0,0,0.5)]';
    pill.innerHTML = '<span class="whitespace-nowrap">地带</span><span id="ui-theme-pill-text" class="ml-1 inline-block font-bold text-sky-300">未定</span>';
    host.appendChild(pill);
}

export function initializeHudStatusUi() {
    initializeSupplyCardUi();
    initializeUpgradeStripUi();
    initializeRelicCardUi();
    initializeThemeStatusPill();
    initializeSupplyStatusPill();
}
