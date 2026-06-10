import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
    SCORE_PULSE_COLOR,
    SCORE_PULSE_TRANSFORM,
    SCORE_TEXT_COLOR,
    SCORE_TEXT_TRANSFORM,
    applyScoreText,
    formatScoreText,
    pulseScoreDisplay
} from '../src/view/score-ui.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

function createScoreDocument() {
    const scoreEl = {
        innerText: '',
        style: {}
    };
    return {
        scoreEl,
        getElementById(id) {
            return id === 'ui-score' ? scoreEl : null;
        }
    };
}

assert.equal(formatScoreText(12.9), '12');
assert.equal(formatScoreText('7.8'), '7');
assert.equal(formatScoreText(Number.NaN), '0');

{
    const documentRef = createScoreDocument();
    const applied = applyScoreText(documentRef, 34.6);
    assert.equal(applied, documentRef.scoreEl);
    assert.equal(documentRef.scoreEl.innerText, '34');
    assert.deepEqual(documentRef.scoreEl.style, {}, 'plain score text updates should not touch pulse styles');
}

assert.equal(applyScoreText(null, 10), null);
assert.equal(applyScoreText({ getElementById: () => null }, 10), null);

{
    const documentRef = createScoreDocument();
    let delayed = null;
    const applied = pulseScoreDisplay(documentRef, {
        score: 88.4,
        setTimeoutRef: (callback, delay) => {
            delayed = { callback, delay };
            return 1;
        }
    });

    assert.equal(applied, documentRef.scoreEl);
    assert.equal(documentRef.scoreEl.innerText, '88');
    assert.equal(documentRef.scoreEl.style.transform, SCORE_PULSE_TRANSFORM);
    assert.equal(documentRef.scoreEl.style.color, SCORE_PULSE_COLOR);
    assert.equal(delayed.delay, 150);

    delayed.callback();
    assert.equal(documentRef.scoreEl.innerText, '88');
    assert.equal(documentRef.scoreEl.style.transform, SCORE_TEXT_TRANSFORM);
    assert.equal(documentRef.scoreEl.style.color, SCORE_TEXT_COLOR);
}

assert.equal(pulseScoreDisplay({ getElementById: () => null }, { score: 5 }), null);

assert.match(
    indexHtml,
    /addScore\(val\) \{[\s\S]*?pulseScoreDisplay\(document, \{ score: this\.score \}\)/,
    'score changes should route pulse styling through the score UI helper'
);

assert.match(
    indexHtml,
    /updateUI\(\) \{[\s\S]*?applyScoreText\(document, this\.score\)/,
    'plain UI refreshes should route score text through the score UI helper'
);

const addScoreMatch = indexHtml.match(/addScore\(val\) \{[\s\S]*?\n    \}/);
assert.ok(addScoreMatch, 'addScore method should stay discoverable');
assert.doesNotMatch(
    addScoreMatch[0],
    /style\.(transform|color)/,
    'score mutation should not own score pulse styles directly'
);

console.log('score-ui checks passed');
