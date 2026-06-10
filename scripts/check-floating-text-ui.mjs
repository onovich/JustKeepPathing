import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    FLOATING_TEXT_CLASS,
    FLOATING_TEXT_CRITICAL_FONT_SIZE,
    appendFloatingTextElement,
    applyFloatingTextFrame,
    buildFloatingTextFrame,
    createFloatingTextElement,
    removeFloatingTextElement
} from '../src/view/floating-text-ui.mjs';

function createElement() {
    return {
        className: '',
        innerText: '',
        style: {},
        removed: false,
        remove() {
            this.removed = true;
        }
    };
}

function createDocument() {
    return {
        createElement() {
            return createElement();
        }
    };
}

{
    const normal = createFloatingTextElement(createDocument(), {
        text: 42,
        color: '#facc15'
    });

    assert.equal(normal.className, FLOATING_TEXT_CLASS);
    assert.equal(normal.innerText, '42');
    assert.equal(normal.style.color, '#facc15');
    assert.equal(normal.style.fontSize, undefined);
}

{
    const critical = createFloatingTextElement(createDocument(), {
        text: 'CRIT',
        color: '#fff',
        critical: true
    });

    assert.equal(critical.style.fontSize, FLOATING_TEXT_CRITICAL_FONT_SIZE);
}

assert.equal(createFloatingTextElement(null), null);

{
    const el = createFloatingTextElement(createDocument(), { text: 'hit' });
    const appended = [];
    const container = {
        appendChild(element) {
            appended.push(element);
        }
    };

    assert.equal(appendFloatingTextElement(container, el), el);
    assert.deepEqual(appended, [el]);
    assert.equal(appendFloatingTextElement(null, el), null);
    assert.equal(appendFloatingTextElement(container, null), null);
}

assert.deepEqual(buildFloatingTextFrame({ x: 10, y: 20, life: 1 }), {
    transform: 'translate(-50%, -50%) translate(10px, 20px) scale(1)',
    opacity: 1
});
assert.deepEqual(buildFloatingTextFrame({ x: 4, y: 5, life: 0.1 }), {
    transform: 'translate(-50%, -50%) translate(4px, 5px) scale(0.5)',
    opacity: 0.1
});

{
    const el = createElement();
    const frame = buildFloatingTextFrame({ x: 1, y: 2, life: 0.5 });

    assert.equal(applyFloatingTextFrame(el, frame), el);
    assert.equal(el.style.transform, 'translate(-50%, -50%) translate(1px, 2px) scale(1)');
    assert.equal(el.style.opacity, 0.5);
    assert.equal(applyFloatingTextFrame(null, frame), null);

    assert.equal(removeFloatingTextElement(el), el);
    assert.equal(el.removed, true);
    assert.equal(removeFloatingTextElement(null), null);
}

{
    const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const addFloatingTextMatch = indexHtml.match(/addFloatingText\(text, pos3D, colorStr, isCritical = false\) \{[\s\S]*?\r?\n    \}/);

    assert.ok(addFloatingTextMatch, 'VisualEngine.addFloatingText should stay discoverable');
    assert.match(
        addFloatingTextMatch[0],
        /appendFloatingTextElement\(this\.textContainer, createFloatingTextElement\(document, \{[\s\S]*?critical: isCritical[\s\S]*?\}\)\)/,
        'VisualEngine.addFloatingText should route DOM creation and mount through floating text helpers'
    );
    assert.doesNotMatch(
        addFloatingTextMatch[0],
        /document\.createElement\('div'\)|className = 'floating-text'|innerText = text|style\.fontSize = '24px'/,
        'VisualEngine.addFloatingText should not own floating text element details'
    );

    const updateTextMatch = indexHtml.match(/updateParticlesAndText\(dt\) \{[\s\S]*?\r?\n    \}\r?\n\r?\n    updateEntityMotion/);

    assert.ok(updateTextMatch, 'VisualEngine.updateParticlesAndText should stay discoverable');
    assert.match(
        updateTextMatch[0],
        /removeFloatingTextElement\(text\.el\)/,
        'expired floating text should route DOM removal through the helper'
    );
    assert.match(
        updateTextMatch[0],
        /applyFloatingTextFrame\(text\.el, buildFloatingTextFrame\(\{ x, y, life: text\.life \}\)\)/,
        'floating text frame styles should route through the helper'
    );
    assert.doesNotMatch(
        updateTextMatch[0],
        /text\.el\.remove\(\)|text\.el\.style\.transform|text\.el\.style\.opacity/,
        'VisualEngine should not directly mutate floating text DOM style/removal details'
    );
}

console.log('floating-text-ui checks passed');
