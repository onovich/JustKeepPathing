import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    HUD_RELIC_ACTIVE_HINT,
    HUD_RELIC_EMPTY_HINT,
    HUD_RELIC_EMPTY_LIST_HTML,
    applyHudRelicCard,
    applyHudRelicCardState,
    buildHudRelicCardState,
    buildHudRelicListHtml,
    initializeHudRelicUi
} from '../src/view/hud-relic-ui.mjs';

function createElement() {
    return {
        id: '',
        className: '',
        innerText: '',
        innerHTML: '',
        insertAdjacentElement() {}
    };
}

function createDocument(ids) {
    const elements = Object.fromEntries(ids.map((id) => [id, createElement()]));
    return {
        elements,
        getElementById(id) {
            return elements[id] || null;
        },
        createElement() {
            return createElement();
        }
    };
}

assert.deepEqual(
    buildHudRelicCardState({
        relicDefs: [],
        relicSlots: 4,
        nextFloorAttackBonus: 0
    }),
    {
        countText: '0/4',
        hintText: HUD_RELIC_EMPTY_HINT,
        listHtml: HUD_RELIC_EMPTY_LIST_HTML
    },
    'empty relic card state should show empty hint and placeholder HTML'
);

{
    const relicDefs = [
        {
            label: '侧路雷达',
            summary: '密室绕行',
            shortLabel: '让隐藏房间更容易被选中'
        }
    ];
    const state = buildHudRelicCardState({
        relicDefs,
        relicSlots: 3,
        nextFloorAttackBonus: 0
    });

    assert.equal(state.countText, '1/3');
    assert.equal(state.hintText, HUD_RELIC_ACTIVE_HINT);
    assert.match(state.listHtml, /侧路雷达/);
    assert.match(state.listHtml, /密室绕行/);
    assert.match(state.listHtml, /让隐藏房间更容易被选中/);
    assert.match(state.listHtml, /rounded-lg border border-slate-700/);
}

assert.equal(
    buildHudRelicCardState({
        relicDefs: [{ label: 'Echo', summary: 'Boost', shortLabel: 'Next floor' }],
        relicSlots: 3,
        nextFloorAttackBonus: 0.126
    }).hintText,
    '回响引擎已为下层预热 +13% 火力',
    'Echo Engine preheat should override the generic owned-relic hint'
);

assert.equal(buildHudRelicListHtml([]), HUD_RELIC_EMPTY_LIST_HTML);

{
    const documentRef = createDocument(['ui-relic-count', 'ui-relic-list', 'ui-relic-hint']);
    const applied = applyHudRelicCard(documentRef, {
        relicDefs: [{ label: 'Path Lens', summary: 'Routes', shortLabel: 'Hidden odds' }],
        relicSlots: 3,
        nextFloorAttackBonus: 0
    });

    assert.equal(applied.relicCountEl, documentRef.elements['ui-relic-count']);
    assert.equal(documentRef.elements['ui-relic-count'].innerText, '1/3');
    assert.equal(documentRef.elements['ui-relic-hint'].innerText, HUD_RELIC_ACTIVE_HINT);
    assert.match(documentRef.elements['ui-relic-list'].innerHTML, /Path Lens/);
}

assert.equal(applyHudRelicCardState(null, buildHudRelicCardState()), null);

{
    const documentRef = createDocument([]);
    const scoreCard = createElement();
    scoreCard.insertAdjacentElement = (position, child) => {
        assert.equal(position, 'afterend');
        documentRef.elements[child.id] = child;
        scoreCard.inserted = child;
    };
    documentRef.elements['ui-score-card'] = scoreCard;

    const card = initializeHudRelicUi({ documentRef, slotCount: 5 });
    assert.equal(card, scoreCard.inserted);
    assert.equal(card.id, 'ui-relic-card');
    assert.equal(card.className, 'bg-slate-800 rounded-xl p-4 border-2 border-slate-700 shadow-inner');
    assert.match(card.innerHTML, /本轮核心/);
    assert.match(card.innerHTML, /0\/5/);
    assert.match(card.innerHTML, new RegExp(HUD_RELIC_EMPTY_HINT));
    assert.equal(initializeHudRelicUi({ documentRef, slotCount: 5 }), null);
}

{
    const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    assert.match(
        indexHtml,
        /applyHudRelicCard\(document, \{[\s\S]*?relicDefs: this\.getRunRelicDefs\(\),[\s\S]*?relicSlots: this\.relicSlots,[\s\S]*?nextFloorAttackBonus: this\.meta\.nextFloorAttackBonus[\s\S]*?\}\);/,
        'GameState.updateUI should route relic card state through the HUD relic helper'
    );
    const updateUiBody = indexHtml.match(/updateUI\(\) \{([\s\S]*?)\n    \}\n};/)?.[1] || '';
    assert.doesNotMatch(
        updateUiBody,
        /ui-relic-(?:count|list|hint)|relicListEl|relicHintEl|relicDefs\.map/,
        'GameState.updateUI should not own HUD relic DOM writes or card markup'
    );
    assert.match(
        indexHtml,
        /initializeHudStatusUi\(\);\s*initializeHudRelicUi\(\);/,
        'HUD relic shell initialization should stay next to HUD status initialization'
    );
}

console.log('hud-relic-ui checks passed');
