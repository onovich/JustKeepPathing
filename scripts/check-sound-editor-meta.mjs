import assert from 'node:assert/strict';
import {
    applySoundEditorMeta,
    buildSoundEditorMeta,
    getSoundEditorTypeLabel,
    renderSoundEventOptions
} from '../src/view/editors/sound-editor-meta.mjs';

assert.equal(getSoundEditorTypeLabel('oneshot'), '\u666e\u901a\u97f3\u6548');
assert.equal(getSoundEditorTypeLabel('loop'), '\u8fde\u7eed\u97f3\u6548');
assert.equal(getSoundEditorTypeLabel('bgm'), '\u80cc\u666f\u97f3\u4e50');

assert.deepEqual(
    buildSoundEditorMeta({
        type: 'loop',
        usage: 'movement',
        description: 'looping sound'
    }),
    {
        typeLabel: '\u8fde\u7eed\u97f3\u6548',
        usage: 'movement',
        description: 'looping sound'
    }
);

assert.equal(
    renderSoundEventOptions({
        upgrade: { label: 'Upgrade' },
        footsteps: { label: 'Footsteps' }
    }),
    '<option value="upgrade">Upgrade</option><option value="footsteps">Footsteps</option>'
);

{
    const refs = {
        typeEl: { innerText: '' },
        usageEl: { innerText: '' },
        descriptionEl: { innerText: '' },
        select: { value: '' }
    };
    const meta = applySoundEditorMeta({
        ...refs,
        currentSoundKey: 'bgm',
        def: {
            type: 'bgm',
            usage: 'ambient',
            description: 'background music'
        }
    });
    assert.deepEqual(meta, {
        typeLabel: '\u80cc\u666f\u97f3\u4e50',
        usage: 'ambient',
        description: 'background music'
    });
    assert.equal(refs.typeEl.innerText, '\u80cc\u666f\u97f3\u4e50');
    assert.equal(refs.usageEl.innerText, 'ambient');
    assert.equal(refs.descriptionEl.innerText, 'background music');
    assert.equal(refs.select.value, 'bgm');
}

console.log('sound-editor-meta checks passed');
