import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    applyCollectionBadge,
    applyCollectionBadgeState,
    buildCollectionBadgeState
} from '../src/view/panels/collection-panel.mjs';

function createDocument(ids) {
    const elements = Object.fromEntries(ids.map((id) => [id, { innerText: '' }]));
    return {
        elements,
        getElementById(id) {
            return elements[id] || null;
        }
    };
}

const progress = {
    eventRoomSeeds: { found: 2, total: 8 },
    trialRoomSeeds: { found: 1, total: 6 },
    relics: { found: 3, total: 6 },
    finaleBosses: { found: 1, total: 4 }
};

assert.deepEqual(
    buildCollectionBadgeState(progress),
    { text: '7/24' },
    'collection badge should aggregate every codex bucket'
);

assert.deepEqual(
    buildCollectionBadgeState(),
    { text: '0/0' },
    'collection badge should tolerate missing progress'
);

{
    const documentRef = createDocument(['collection-count-badge']);
    const applied = applyCollectionBadge(documentRef, { progress });
    assert.equal(applied.badgeEl, documentRef.elements['collection-count-badge']);
    assert.equal(documentRef.elements['collection-count-badge'].innerText, '7/24');
}

assert.equal(applyCollectionBadgeState(null, buildCollectionBadgeState(progress)), null);

{
    const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    assert.match(
        indexHtml,
        /applyCollectionBadge\(document, \{ progress: this\.getCollectionProgress\(\) \}\);/,
        'GameState.updateUI should route collection badge text through CollectionPanel helpers'
    );
    const updateUiBody = indexHtml.match(/updateUI\(\) \{([\s\S]*?)\n    \}\n};/)?.[1] || '';
    assert.doesNotMatch(
        updateUiBody,
        /collection-count-badge|collectionBadgeEl|eventRoomSeeds\.found \+ progress\.trialRoomSeeds\.found/,
        'GameState.updateUI should not own collection badge DOM writes or aggregation'
    );
}

console.log('collection-panel checks passed');
