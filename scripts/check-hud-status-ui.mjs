import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
    HUD_COMBAT_STATUS_BOX_CLASS,
    HUD_COMBAT_STATUS_TEXT_CLASS,
    HUD_STATUS_BOX_CLASS,
    HUD_STATUS_TEXT_CLASS,
    HUD_SUPPLY_EMPTY_DESCRIPTION,
    HUD_SUPPLY_RESERVE_DESCRIPTION,
    applyHudSupplyCard,
    applyHudSupplyCardState,
    applyHudRuntimeStatus,
    applyHudRuntimeStatusState,
    buildHudSupplyCardState,
    buildHudRuntimeStatusState
} from '../src/view/hud-status-ui.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

function createElement(initialClassName = '') {
    let className = initialClassName;
    let classes = new Set(className.split(/\s+/).filter(Boolean));
    const syncClassName = () => {
        className = [...classes].join(' ');
    };

    return {
        innerText: '',
        style: {},
        get className() {
            return className;
        },
        set className(value) {
            className = value;
            classes = new Set(className.split(/\s+/).filter(Boolean));
        },
        classList: {
            add(...tokens) {
                for (const token of tokens) classes.add(token);
                syncClassName();
            },
            remove(...tokens) {
                for (const token of tokens) classes.delete(token);
                syncClassName();
            },
            contains(token) {
                return classes.has(token);
            }
        }
    };
}

function createDocument() {
    const elements = {
        'ui-status': createElement(),
        'ui-status-box': createElement(),
        'ui-theme-pill': createElement('hidden'),
        'ui-theme-pill-text': createElement(),
        'ui-supply-pill': createElement('hidden'),
        'ui-supply-pill-text': createElement(),
        'ui-supply-mode': createElement(),
        'ui-supply-status': createElement(),
        'ui-supply-desc': createElement()
    };

    return {
        elements,
        getElementById(id) {
            return elements[id] || null;
        }
    };
}

assert.deepEqual(
    buildHudRuntimeStatusState({
        phase: 'COMBAT',
        floorContent: null,
        floorBuff: {}
    }),
    {
        statusText: 'RPG 战斗模式!',
        statusBoxClass: HUD_COMBAT_STATUS_BOX_CLASS,
        statusTextClass: HUD_COMBAT_STATUS_TEXT_CLASS,
        theme: {
            visible: false,
            borderColor: '#93c5fd66',
            backgroundColor: '#93c5fd22',
            textColor: '#93c5fd',
            text: ''
        },
        supply: {
            visible: false,
            label: '',
            pillClass: 'px-4 py-2 rounded-lg border-2 text-sm shadow-[0_4px_0_rgba(0,0,0,0.5)] bg-slate-900/95 border-slate-700',
            textClass: 'ml-1 inline-block font-bold text-emerald-300'
        }
    },
    'combat HUD status should use combat classes and hide inactive pills'
);

assert.deepEqual(
    buildHudRuntimeStatusState({
        phase: 'EXPLORING',
        floorContent: {
            theme: { label: 'Ember Route', accentColor: '#fb923c' },
            actFloor: 2,
            actLength: 6,
            isFinaleFloor: true,
            finale: { label: 'Warden' }
        },
        floorBuff: {
            supplyActive: true,
            supplyKey: 'assault',
            supplyLabel: 'Assault Supply'
        }
    }),
    {
        statusText: '自动寻路',
        statusBoxClass: HUD_STATUS_BOX_CLASS,
        statusTextClass: HUD_STATUS_TEXT_CLASS,
        theme: {
            visible: true,
            borderColor: '#fb923c66',
            backgroundColor: '#fb923c22',
            textColor: '#fb923c',
            text: 'Ember Route · 2/6 · Warden'
        },
        supply: {
            visible: true,
            label: 'Assault Supply',
            pillClass: 'px-4 py-2 rounded-lg border-2 text-sm shadow-[0_4px_0_rgba(0,0,0,0.5)] bg-rose-950/80 border-rose-700/80',
            textClass: 'ml-1 inline-block font-bold text-rose-300'
        }
    },
    'exploration HUD status should surface theme/finale/supply pill state'
);

{
    const state = buildHudRuntimeStatusState({
        phase: 'UNKNOWN',
        floorBuff: {
            supplyActive: true,
            supplyKey: 'unknown',
            supplyLabel: 'Mystery Supply'
        }
    });

    assert.equal(state.statusText, '就绪');
    assert.equal(state.supply.pillClass.endsWith('bg-slate-900/95 border-slate-700'), true);
    assert.equal(state.supply.textClass.endsWith('text-emerald-300'), true);
}

{
    const documentRef = createDocument();
    const applied = applyHudRuntimeStatus(documentRef, {
        phase: 'EXPLORING',
        floorContent: {
            theme: { label: 'Signal', accentColor: '#22d3ee' },
            actFloor: 3,
            actLength: 6
        },
        floorBuff: {
            supplyActive: true,
            supplyKey: 'scout',
            supplyLabel: 'Scout Supply'
        }
    });

    assert.equal(applied.statusSpan, documentRef.elements['ui-status']);
    assert.equal(documentRef.elements['ui-status'].innerText, '自动寻路');
    assert.equal(documentRef.elements['ui-status-box'].className, HUD_STATUS_BOX_CLASS);
    assert.equal(documentRef.elements['ui-theme-pill'].classList.contains('hidden'), false);
    assert.equal(documentRef.elements['ui-theme-pill'].style.borderColor, '#22d3ee66');
    assert.equal(documentRef.elements['ui-theme-pill'].style.backgroundColor, '#22d3ee22');
    assert.equal(documentRef.elements['ui-theme-pill-text'].style.color, '#22d3ee');
    assert.equal(documentRef.elements['ui-theme-pill-text'].innerText, 'Signal · 3/6');
    assert.equal(documentRef.elements['ui-supply-pill'].classList.contains('hidden'), false);
    assert.equal(documentRef.elements['ui-supply-pill-text'].innerText, 'Scout Supply');
    assert.equal(documentRef.elements['ui-supply-pill-text'].className.endsWith('text-cyan-300'), true);
}

{
    const documentRef = createDocument();
    applyHudRuntimeStatusState(documentRef, buildHudRuntimeStatusState());
    assert.equal(documentRef.elements['ui-theme-pill'].classList.contains('hidden'), true);
    assert.equal(documentRef.elements['ui-supply-pill'].classList.contains('hidden'), true);
}

assert.equal(applyHudRuntimeStatusState(null, buildHudRuntimeStatusState()), null);

assert.deepEqual(
    buildHudSupplyCardState({
        supplyMode: 'combat',
        totalSupply: 3,
        floorBuff: { supplyKey: 'assault' }
    }),
    {
        modeText: '偏战斗',
        statusText: '补给储备 x3',
        descText: '本层当前偏战斗推进。系统会自动消耗储备，不需要手动购买。'
    },
    'active assault supply card state should show combat mode and active supply copy'
);

assert.deepEqual(
    buildHudSupplyCardState({
        supplyMode: 'unknown',
        totalSupply: 2,
        floorBuff: {}
    }),
    {
        modeText: '自动均衡',
        statusText: '补给储备 x2',
        descText: HUD_SUPPLY_RESERVE_DESCRIPTION
    },
    'supply card should fall back to balanced mode and reserve copy'
);

assert.equal(
    buildHudSupplyCardState({
        supplyMode: 'loot',
        totalSupply: 0,
        floorBuff: {}
    }).descText,
    HUD_SUPPLY_EMPTY_DESCRIPTION,
    'empty supply card should explain how reserves can be refilled'
);

{
    const documentRef = createDocument();
    const applied = applyHudSupplyCard(documentRef, {
        supplyMode: 'explore',
        totalSupply: 4,
        floorBuff: { supplyKey: 'scout' }
    });

    assert.equal(applied.supplyModeEl, documentRef.elements['ui-supply-mode']);
    assert.equal(documentRef.elements['ui-supply-mode'].innerText, '偏密室');
    assert.equal(documentRef.elements['ui-supply-status'].innerText, '补给储备 x4');
    assert.equal(
        documentRef.elements['ui-supply-desc'].innerText,
        '本层当前偏密室探索。系统会自动消耗储备，不需要手动购买。'
    );
}

assert.equal(applyHudSupplyCardState(null, buildHudSupplyCardState()), null);

assert.match(
    indexHtml,
    /updateUI\(\) \{[\s\S]*?applyHudRuntimeStatus\(document, \{[\s\S]*?phase: this\.phase[\s\S]*?floorContent: this\.floorContent[\s\S]*?floorBuff: this\.floorBuff/,
    'GameState.updateUI should route HUD runtime status through the shared view helper'
);

assert.match(
    indexHtml,
    /updateUI\(\) \{[\s\S]*?applyHudSupplyCard\(document, \{[\s\S]*?supplyMode: this\.autoStrategy\.supply[\s\S]*?totalSupply: this\.getTotalSupplyCount\(\)[\s\S]*?floorBuff: this\.floorBuff/,
    'GameState.updateUI should route HUD supply card text through the shared view helper'
);

const updateUiStart = indexHtml.indexOf('    updateUI() {');
const updateUiEnd = indexHtml.indexOf('        applyScoreText(document, this.score);', updateUiStart);
assert.notEqual(updateUiStart, -1, 'updateUI should stay discoverable');
assert.notEqual(updateUiEnd, -1, 'score text update should stay after HUD runtime status');
const hudStatusSlice = indexHtml.slice(updateUiStart, updateUiEnd);
assert.doesNotMatch(
    hudStatusSlice,
    /statusMap|themePill\.style|supplyPill\.className/,
    'GameState.updateUI should not own HUD status, theme pill, or supply pill styling'
);

const supplyCardStart = indexHtml.indexOf('        applyHudSupplyCard(document, {', updateUiStart);
const supplyCardEnd = indexHtml.indexOf('        const sizeDesc = document.getElementById', supplyCardStart);
assert.notEqual(supplyCardStart, -1, 'supply card update should stay discoverable');
assert.notEqual(supplyCardEnd, -1, 'size description should stay after supply card update');
const supplyCardSlice = indexHtml.slice(supplyCardStart, supplyCardEnd);
assert.doesNotMatch(
    supplyCardSlice,
    /supplyModeLabels|ui-supply-mode|ui-supply-status|ui-supply-desc/,
    'GameState.updateUI should not own HUD supply card text branches'
);

console.log('hud-status-ui checks passed');
