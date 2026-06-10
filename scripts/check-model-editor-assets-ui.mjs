import assert from 'node:assert/strict';
import {
    buildModelEditorAssetOptions,
    populateModelEditorAssetSelect
} from '../src/view/editors/model-editor-assets-ui.mjs';

const assetLabels = {
    player: 'Player',
    scout: 'Scout',
    boss: 'Boss'
};

assert.deepEqual(
    buildModelEditorAssetOptions(assetLabels),
    [
        { value: 'player', label: 'Player' },
        { value: 'scout', label: 'Scout' },
        { value: 'boss', label: 'Boss' }
    ],
    'asset labels should become stable select option descriptors'
);

function createDomSelect(value = '') {
    return {
        value,
        options: [],
        ownerDocument: {
            createElement(tagName) {
                return {
                    tagName: tagName.toUpperCase(),
                    value: '',
                    textContent: ''
                };
            }
        },
        replaceChildren(...options) {
            this.options = options;
        }
    };
}

{
    const select = createDomSelect();
    const options = populateModelEditorAssetSelect(select, assetLabels);

    assert.deepEqual(options, buildModelEditorAssetOptions(assetLabels));
    assert.equal(select.value, 'player');
    assert.equal(select.options.length, 3);
    assert.deepEqual(
        select.options.map((option) => [option.tagName, option.value, option.textContent]),
        [
            ['OPTION', 'player', 'Player'],
            ['OPTION', 'scout', 'Scout'],
            ['OPTION', 'boss', 'Boss']
        ],
        'DOM option nodes should be created without relying on static HTML'
    );
}

{
    const select = createDomSelect('scout');
    populateModelEditorAssetSelect(select, assetLabels);
    assert.equal(select.value, 'scout', 'an existing valid selection should be preserved');
}

{
    const select = createDomSelect('player');
    populateModelEditorAssetSelect(select, assetLabels, { selectedValue: 'boss' });
    assert.equal(select.value, 'boss', 'an explicit valid selected value should win');
}

{
    const select = { value: 'missing', innerHTML: '' };
    populateModelEditorAssetSelect(select, assetLabels, { selectedValue: 'missing' });
    assert.equal(select.value, 'player', 'invalid selections should fall back to the first asset');
    assert.equal(
        select.innerHTML,
        '<option value="player">Player</option><option value="scout">Scout</option><option value="boss">Boss</option>',
        'fallback markup should match the select option descriptors'
    );
}

assert.deepEqual(
    populateModelEditorAssetSelect(null, assetLabels),
    [],
    'missing select refs should be a no-op'
);

console.log('model-editor-assets-ui checks passed');
