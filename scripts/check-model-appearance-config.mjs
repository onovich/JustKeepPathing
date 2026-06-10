import assert from 'node:assert/strict';
import {
    MODEL_EDITOR_DEFAULT_FACE_PATTERN,
    MODEL_EDITOR_DEFAULT_LINE_STYLE
} from '../src/data/game-config.mjs';
import {
    cleanupAppearancePart,
    cloneAppearanceConfig,
    getAppearancePart,
    getFaceAppearanceEntry,
    getLineAppearanceEntry,
    isDefaultFaceAppearance,
    isDefaultLineAppearance,
    normalizeColorHex,
    sanitizeAppearanceConfig,
    writeAppearanceSelectionEntry
} from '../src/logic/model-appearance-config.mjs';

assert.equal(normalizeColorHex(0x00ffaa), '#00ffaa');
assert.equal(normalizeColorHex('AA00ff'), '#aa00ff');
assert.equal(normalizeColorHex('#ABCDEF'), '#abcdef');
assert.equal(normalizeColorHex({ getHexString: () => '123456' }), '#123456');
assert.equal(normalizeColorHex('bad', '#AABBCC'), '#aabbcc');

const sanitized = sanitizeAppearanceConfig({
    version: 99,
    assets: {
        player: {
            hull: {
                faces: {
                    0: '#ff0000',
                    1: {
                        color: '00ff00',
                        pattern: 'hatch',
                        patternColor: '0000ff',
                        patternScale: 99
                    },
                    nope: '#ffffff'
                },
                lines: {
                    0: '#111111',
                    1: {
                        color: '#222222',
                        style: 'dashed',
                        width: 99
                    }
                }
            },
            empty: {
                faces: {},
                lines: {}
            }
        },
        broken: null
    }
});

assert.equal(sanitized.version, 1);
assert.deepEqual(Object.keys(sanitized.assets), ['player']);
assert.deepEqual(Object.keys(sanitized.assets.player), ['hull']);
assert.deepEqual(sanitized.assets.player.hull.faces[0], { color: '#ff0000' });
assert.deepEqual(sanitized.assets.player.hull.faces[1], {
    color: '#00ff00',
    pattern: 'hatch',
    patternColor: '#0000ff',
    patternScale: 24
});
assert.deepEqual(sanitized.assets.player.hull.lines[1], {
    color: '#222222',
    style: 'dashed',
    width: 6
});
assert.deepEqual(sanitizeAppearanceConfig(null), { version: 1, assets: {} });

{
    const original = {
        version: 1,
        assets: {
            player: {
                hull: {
                    faces: { 0: { color: '#ff0000' } },
                    lines: {}
                }
            }
        }
    };
    const cloned = cloneAppearanceConfig(original);
    cloned.assets.player.hull.faces[0].color = '#00ff00';
    assert.equal(original.assets.player.hull.faces[0].color, '#ff0000', 'clone should deep copy config data');
}

{
    const config = { version: 1, assets: {} };
    assert.equal(getAppearancePart(config, 'player', 'hull', false), null);
    const part = getAppearancePart(config, 'player', 'hull', true);
    assert.deepEqual(part, { faces: {}, lines: {} });
    assert.equal(getAppearancePart(config, 'player', 'hull', false), part);
}

assert.deepEqual(
    getFaceAppearanceEntry(null, 0, '#abcdef'),
    {
        color: '#abcdef',
        pattern: MODEL_EDITOR_DEFAULT_FACE_PATTERN.pattern,
        patternColor: MODEL_EDITOR_DEFAULT_FACE_PATTERN.patternColor,
        patternScale: MODEL_EDITOR_DEFAULT_FACE_PATTERN.patternScale
    }
);

assert.deepEqual(
    getLineAppearanceEntry({ lines: { 2: { color: '#111111', style: 'dashed', width: 3.5 } } }, 2, '#abcdef'),
    {
        color: '#111111',
        style: 'dashed',
        width: 3.5
    }
);

assert.equal(isDefaultFaceAppearance({
    color: '#abcdef',
    pattern: MODEL_EDITOR_DEFAULT_FACE_PATTERN.pattern,
    patternColor: MODEL_EDITOR_DEFAULT_FACE_PATTERN.patternColor,
    patternScale: MODEL_EDITOR_DEFAULT_FACE_PATTERN.patternScale
}, '#abcdef'), true);
assert.equal(isDefaultLineAppearance({
    color: '#abcdef',
    style: MODEL_EDITOR_DEFAULT_LINE_STYLE.style,
    width: MODEL_EDITOR_DEFAULT_LINE_STYLE.width
}, '#abcdef'), true);

{
    const config = { version: 1, assets: {} };
    const item = {
        kind: 'mesh',
        assetKey: 'player',
        partKey: 'hull',
        index: 4,
        defaultColor: '#abcdef'
    };
    writeAppearanceSelectionEntry(config, item, {
        color: '#123456',
        pattern: 'halftone',
        patternColor: '#654321',
        patternScale: 12
    });
    assert.deepEqual(config.assets.player.hull.faces[4], {
        color: '#123456',
        pattern: 'halftone',
        patternColor: '#654321',
        patternScale: 12
    });
    writeAppearanceSelectionEntry(config, item, {
        color: '#abcdef',
        pattern: MODEL_EDITOR_DEFAULT_FACE_PATTERN.pattern,
        patternColor: MODEL_EDITOR_DEFAULT_FACE_PATTERN.patternColor,
        patternScale: MODEL_EDITOR_DEFAULT_FACE_PATTERN.patternScale
    });
    assert.deepEqual(config.assets, {}, 'default face writes should clean empty part and asset');
}

{
    const config = { version: 1, assets: {} };
    const item = {
        kind: 'line',
        assetKey: 'exit',
        partKey: 'outline',
        index: 1,
        defaultColor: '#0f172a'
    };
    writeAppearanceSelectionEntry(config, item, {
        color: '#eeeeee',
        style: 'dashed',
        width: 4
    });
    assert.deepEqual(config.assets.exit.outline.lines[1], {
        color: '#eeeeee',
        style: 'dashed',
        width: 4
    });
    cleanupAppearancePart(config, 'exit', 'missing');
    writeAppearanceSelectionEntry(config, item, {
        color: '#0f172a',
        style: MODEL_EDITOR_DEFAULT_LINE_STYLE.style,
        width: MODEL_EDITOR_DEFAULT_LINE_STYLE.width
    });
    assert.deepEqual(config.assets, {}, 'default line writes should clean empty part and asset');
}

console.log('model-appearance-config checks passed');
