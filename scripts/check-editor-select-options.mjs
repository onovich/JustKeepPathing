import assert from 'node:assert/strict';
import {
    buildSelectOptionMarkup,
    buildSelectOptionsFromLabels,
    populateSelectOptions
} from '../src/view/editors/editor-select-options.mjs';

const options = [
    { value: 'alpha', label: 'Alpha' },
    { value: 'beta', label: 'Beta' }
];

assert.deepEqual(
    buildSelectOptionsFromLabels({ alpha: 'Alpha', beta: 'Beta' }),
    options,
    'label maps should keep stable insertion order'
);

assert.equal(
    buildSelectOptionMarkup(options),
    '<option value="alpha">Alpha</option><option value="beta">Beta</option>',
    'fallback option markup should match descriptors'
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
        replaceChildren(...optionNodes) {
            this.options = optionNodes;
        }
    };
}

{
    const select = createDomSelect('beta');
    assert.deepEqual(populateSelectOptions(select, options), options);
    assert.equal(select.value, 'beta', 'valid existing selections should be preserved');
    assert.deepEqual(
        select.options.map((option) => [option.tagName, option.value, option.textContent]),
        [
            ['OPTION', 'alpha', 'Alpha'],
            ['OPTION', 'beta', 'Beta']
        ],
        'DOM option nodes should be rendered through createElement'
    );
}

{
    const select = createDomSelect('alpha');
    populateSelectOptions(select, options, { selectedValue: 'beta' });
    assert.equal(select.value, 'beta', 'explicit valid selected values should win');
}

{
    const select = { value: 'missing', innerHTML: '' };
    populateSelectOptions(select, options);
    assert.equal(select.value, 'alpha', 'invalid selections should fall back to the first option');
    assert.equal(select.innerHTML, buildSelectOptionMarkup(options));
}

assert.deepEqual(populateSelectOptions(null, options), [], 'missing select refs should be a no-op');

console.log('editor-select-options checks passed');
