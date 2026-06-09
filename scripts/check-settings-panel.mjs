import assert from 'node:assert/strict';
import { buildAutoStrategyHint } from '../src/view/settings-panel.mjs';

assert.equal(
    buildAutoStrategyHint({
        risk: 'greedy',
        rest: 'prefer',
        merchant: 'supplies',
        supply: 'explore'
    }),
    '\u4f1a\u66f4\u613f\u610f\u4e3a\u4e86\u9ad8\u6536\u76ca\u7ed5\u8def\uff1b\u4f11\u6574\u5bc6\u5ba4\u4f1a\u66f4\u79ef\u6781\u53bb\u8865\u72b6\u6001\uff1b\u5546\u8d29\u66f4\u504f\u5411\u8865\u5c42\u8865\u7ed9\uff1b\u6302\u673a\u503e\u5411\u4f1a\u66f4\u504f\u5411\u5bc6\u5ba4\u63a2\u7d22\u3002',
    'settings strategy hint should preserve selected labels'
);

assert.equal(
    buildAutoStrategyHint({}),
    '\u4f1a\u6309\u6b63\u5e38\u6536\u76ca\u5224\u65ad\u7ed5\u8def\uff1b\u4f11\u6574\u5bc6\u5ba4\u4fdd\u6301\u6b63\u5e38\u4f18\u5148\u7ea7\uff1b\u5546\u8d29\u66f4\u504f\u5411\u4e70\u5347\u7ea7\uff1b\u6302\u673a\u503e\u5411\u4f1a\u81ea\u52a8\u4fdd\u6301\u5747\u8861\u3002',
    'settings strategy hint should preserve default labels'
);

console.log('settings-panel checks passed');
