import assert from 'node:assert/strict';
import {
    appendEditorLog,
    buildEditorLogText
} from '../src/view/editors/editor-log.mjs';

const fakeNow = {
    toLocaleTimeString(locale, options) {
        assert.equal(locale, 'zh-CN');
        assert.deepEqual(options, { hour12: false });
        return '09:30:05';
    }
};

assert.equal(
    buildEditorLogText({
        existingText: 'old line',
        message: 'new line',
        now: fakeNow,
        maxLines: 4
    }),
    '09:30:05 new line\nold line',
    'new editor log entries should prepend timestamped text'
);

assert.equal(
    buildEditorLogText({
        existingText: ['a', 'b', 'c'].join('\n'),
        message: 'top',
        now: fakeNow,
        maxLines: 2
    }),
    '09:30:05 top\na',
    'editor logs should keep only the configured maximum lines'
);

{
    const logEl = { innerText: 'existing' };
    const text = appendEditorLog(logEl, 'appended', { now: fakeNow, maxLines: 3 });
    assert.equal(text, '09:30:05 appended\nexisting');
    assert.equal(logEl.innerText, text);
}

console.log('editor-log checks passed');
