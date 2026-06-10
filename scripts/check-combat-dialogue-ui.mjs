import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    COMBAT_DIALOGUE_ELEMENT_ID,
    COMBAT_DIALOGUE_TYPE_DELAY_MS,
    typeCombatDialogue
} from '../src/view/combat-dialogue-ui.mjs';

function createDocument(ids) {
    const elements = Object.fromEntries(ids.map((id) => [id, { innerText: '' }]));
    return {
        elements,
        getElementById(id) {
            return elements[id] || null;
        }
    };
}

{
    const documentRef = createDocument([COMBAT_DIALOGUE_ELEMENT_ID]);
    const delays = [];
    const el = await typeCombatDialogue(documentRef, 'AB', {
        sleep: async (ms) => delays.push(ms)
    });

    assert.equal(el, documentRef.elements[COMBAT_DIALOGUE_ELEMENT_ID]);
    assert.equal(el.innerText, 'AB');
    assert.deepEqual(delays, [COMBAT_DIALOGUE_TYPE_DELAY_MS, COMBAT_DIALOGUE_TYPE_DELAY_MS]);
}

{
    const documentRef = createDocument([COMBAT_DIALOGUE_ELEMENT_ID]);
    const delays = [];
    await typeCombatDialogue(documentRef, 42, {
        sleep: async (ms) => delays.push(ms),
        delayMs: 3
    });

    assert.equal(documentRef.elements[COMBAT_DIALOGUE_ELEMENT_ID].innerText, '42');
    assert.deepEqual(delays, [3, 3]);
}

assert.equal(await typeCombatDialogue(null, 'missing'), null);
assert.equal(await typeCombatDialogue(createDocument([]), 'missing'), null);

{
    const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    assert.match(
        indexHtml,
        /typeText\(text\) \{[\s\S]*?return typeCombatDialogue\(document, text, \{[\s\S]*?sleep: \(ms\) => this\.sleep\(ms\)[\s\S]*?\}\);[\s\S]*?\n    \}/,
        'GameController.typeText should route typewriter DOM work through the combat dialogue helper'
    );
    const typeTextMatch = indexHtml.match(/typeText\(text\) \{[\s\S]*?\n    \}/);
    assert.ok(typeTextMatch, 'combat typeText method should stay discoverable');
    assert.doesNotMatch(
        typeTextMatch[0],
        /getElementById\('rpg-dialogue'\)|innerText \+=|innerText = ''/,
        'GameController.typeText should not own dialogue DOM writes'
    );
}

console.log('combat-dialogue-ui checks passed');
