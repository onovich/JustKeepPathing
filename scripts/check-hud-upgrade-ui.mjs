import assert from 'node:assert/strict';
import {
    applyHudUpgradeState,
    applyHudUpgradeStates,
    buildHudUpgradeState,
    buildHudUpgradeStates
} from '../src/view/hud-upgrade-ui.mjs';

function createElement() {
    const classes = new Set(['opacity-50', 'grayscale']);
    return {
        innerText: '',
        classList: {
            add(...tokens) {
                for (const token of tokens) classes.add(token);
            },
            remove(...tokens) {
                for (const token of tokens) classes.delete(token);
            },
            contains(token) {
                return classes.has(token);
            }
        }
    };
}

function createDocument(ids) {
    const elements = Object.fromEntries(ids.map((id) => [id, createElement()]));
    return {
        elements,
        getElementById(id) {
            return elements[id] || null;
        }
    };
}

const baseState = {
    score: 45,
    player: {
        lvSpeed: 2,
        lvAtk: 3,
        lvHp: 4
    },
    maze: {
        lvChest: 2,
        lvSize: 3,
        lvMonster: 5
    },
    costs: {
        speed: 30,
        atk: 50,
        hp: 45,
        chest: 60,
        size: 70,
        monster: 90
    },
    mazeSide: 15,
    sizeMaxed: false
};

assert.deepEqual(
    buildHudUpgradeState({ ...baseState, id: 'speed' }),
    {
        id: 'speed',
        valueText: 'Lv.2',
        costText: 30,
        affordable: true
    }
);

assert.deepEqual(
    buildHudUpgradeState({ ...baseState, id: 'atk' }),
    {
        id: 'atk',
        valueText: 'Lv.3',
        costText: 50,
        affordable: false
    }
);

assert.deepEqual(
    buildHudUpgradeState({ ...baseState, id: 'size', sizeMaxed: true }),
    {
        id: 'size',
        valueText: '15x15',
        costText: 'MAX',
        affordable: false
    }
);

assert.deepEqual(
    buildHudUpgradeStates(baseState).map((state) => state.id),
    ['speed', 'atk', 'hp', 'chest', 'size', 'monster']
);

{
    const documentRef = createDocument(['val-speed', 'cost-speed', 'btn-up-speed']);
    applyHudUpgradeState(documentRef, buildHudUpgradeState({ ...baseState, id: 'speed' }));
    assert.equal(documentRef.elements['val-speed'].innerText, 'Lv.2');
    assert.equal(documentRef.elements['cost-speed'].innerText, 30);
    assert.equal(documentRef.elements['btn-up-speed'].classList.contains('opacity-50'), false);
    assert.equal(documentRef.elements['btn-up-speed'].classList.contains('grayscale'), false);
}

{
    const documentRef = createDocument(['val-size', 'cost-size', 'btn-up-size']);
    applyHudUpgradeState(documentRef, buildHudUpgradeState({ ...baseState, id: 'size', sizeMaxed: true }));
    assert.equal(documentRef.elements['val-size'].innerText, '15x15');
    assert.equal(documentRef.elements['cost-size'].innerText, 'MAX');
    assert.equal(documentRef.elements['btn-up-size'].classList.contains('opacity-50'), true);
    assert.equal(documentRef.elements['btn-up-size'].classList.contains('grayscale'), true);
}

{
    const documentRef = createDocument(['val-speed', 'cost-speed', 'btn-up-speed']);
    const applied = applyHudUpgradeStates(documentRef, [buildHudUpgradeState({ ...baseState, id: 'speed' })]);
    assert.equal(applied.length, 1);
    assert.equal(applied[0].buttonEl, documentRef.elements['btn-up-speed']);
}

assert.equal(applyHudUpgradeState(null, { id: 'speed' }), null);

console.log('hud-upgrade-ui checks passed');
