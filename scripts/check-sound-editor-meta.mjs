import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    applySoundEditorEventOptions,
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
    const select = { innerHTML: '', value: '' };
    const markup = applySoundEditorEventOptions({
        select,
        currentSoundKey: 'footsteps',
        soundEventDefs: {
            upgrade: { label: 'Upgrade' },
            footsteps: { label: 'Footsteps' }
        }
    });

    assert.equal(markup, '<option value="upgrade">Upgrade</option><option value="footsteps">Footsteps</option>');
    assert.equal(select.innerHTML, markup);
    assert.equal(select.value, 'footsteps');
    assert.equal(
        applySoundEditorEventOptions({
            select: null,
            currentSoundKey: 'footsteps',
            soundEventDefs: { footsteps: { label: 'Footsteps' } }
        }),
        '<option value="footsteps">Footsteps</option>'
    );
}

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

{
    const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const soundEditorStart = indexHtml.indexOf('class SoundEditor');
    const soundEditorEnd = indexHtml.indexOf('window.onload', soundEditorStart);
    const soundEditorClass = indexHtml.slice(soundEditorStart, soundEditorEnd);

    assert.match(
        soundEditorClass,
        /populateSelect\(\) \{[\s\S]*?applySoundEditorEventOptions\(\{[\s\S]*?select: this\.select[\s\S]*?soundEventDefs: SOUND_EVENT_DEFS[\s\S]*?currentSoundKey: this\.currentSoundKey[\s\S]*?\}\);[\s\S]*?\n    \}/,
        'SoundEditor.populateSelect should route option rendering through the meta helper'
    );
    assert.doesNotMatch(
        soundEditorClass,
        /select\.innerHTML = renderSoundEventOptions|renderSoundEventOptions\(SOUND_EVENT_DEFS\)/,
        'SoundEditor should not own event option markup'
    );
}

console.log('sound-editor-meta checks passed');
