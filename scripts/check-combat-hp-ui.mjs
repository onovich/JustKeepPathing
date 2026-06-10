import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
    COMBAT_BOSS_CARD_CLASS,
    COMBAT_MONSTER_CARD_CLASS,
    applyCombatHpUiState,
    buildCombatHpUiState
} from '../src/view/combat-hp-ui.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

function createElement() {
    return {
        innerText: '',
        className: '',
        style: {}
    };
}

function createDocument() {
    const elements = Object.fromEntries([
        'rpg-p-hp-bar',
        'rpg-p-hp-text',
        'rpg-m-name',
        'rpg-m-card',
        'rpg-m-hp-bar',
        'rpg-m-hp-text'
    ].map((id) => [id, createElement()]));

    return {
        elements,
        getElementById(id) {
            return elements[id] || null;
        }
    };
}

assert.deepEqual(
    buildCombatHpUiState({
        playerCurrentHp: 44.8,
        playerBaseHp: 100,
        enemyHp: 18.4,
        enemyMaxHp: 60,
        enemyData: { name: 'Drone' }
    }),
    {
        playerBarWidth: '44.8%',
        playerText: '44/100',
        monsterName: 'Drone',
        monsterBarWidth: '30.666666666666664%',
        monsterText: '18/60',
        monsterCardClass: COMBAT_MONSTER_CARD_CLASS,
        monsterNameClass: 'text-red-100 font-bold italic mb-1 text-xs md:text-sm tracking-widest text-right',
        monsterBarClass: 'bg-red-500 h-full w-full hp-bar-fill origin-right',
        monsterTextClass: 'text-left text-[10px] md:text-xs text-red-200 mt-1 font-mono',
        customStyles: {
            cardBorderColor: '',
            cardBoxShadow: '',
            nameColor: '',
            barBackground: '',
            textColor: ''
        }
    },
    'normal enemy HP UI state should preserve text, percentages, and default monster classes'
);

{
    const state = buildCombatHpUiState({
        playerCurrentHp: -4,
        playerBaseHp: 80,
        enemyHp: 72,
        enemyMaxHp: 90,
        enemyData: { name: 'Warden', boss: true }
    });

    assert.equal(state.playerBarWidth, '0%');
    assert.equal(state.playerText, '0/80');
    assert.equal(state.monsterCardClass, COMBAT_BOSS_CARD_CLASS);
    assert.equal(state.monsterBarWidth, '80%');
    assert.deepEqual(state.customStyles, {
        cardBorderColor: '',
        cardBoxShadow: '',
        nameColor: '',
        barBackground: '',
        textColor: ''
    });
}

assert.deepEqual(
    buildCombatHpUiState({
        playerCurrentHp: 90,
        playerBaseHp: 100,
        enemyHp: 120,
        enemyMaxHp: 180,
        enemyData: {
            name: 'Finale',
            boss: true,
            finaleBoss: true,
            color: 0x123456,
            accent: '#ABCDEF'
        }
    }).customStyles,
    {
        cardBorderColor: '#abcdef',
        cardBoxShadow: '0 0 18px #abcdef88',
        nameColor: '#abcdef',
        barBackground: '#123456',
        textColor: '#abcdef'
    },
    'finale bosses should preserve custom accent and base colors'
);

{
    const documentRef = createDocument();
    const state = buildCombatHpUiState({
        playerCurrentHp: 40,
        playerBaseHp: 80,
        enemyHp: 12,
        enemyMaxHp: 24,
        enemyData: { name: 'Brute' }
    });
    const applied = applyCombatHpUiState(documentRef, state);

    assert.equal(applied.playerBar, documentRef.elements['rpg-p-hp-bar']);
    assert.equal(documentRef.elements['rpg-p-hp-bar'].style.width, '50%');
    assert.equal(documentRef.elements['rpg-p-hp-text'].innerText, '40/80');
    assert.equal(documentRef.elements['rpg-m-name'].innerText, 'Brute');
    assert.equal(documentRef.elements['rpg-m-card'].className, COMBAT_MONSTER_CARD_CLASS);
    assert.equal(documentRef.elements['rpg-m-hp-bar'].style.width, '50%');
    assert.equal(documentRef.elements['rpg-m-hp-text'].innerText, '12/24');
}

assert.equal(applyCombatHpUiState(null, buildCombatHpUiState()), null);
assert.equal(applyCombatHpUiState(createDocument(), null), null);

assert.match(
    indexHtml,
    /updateRPG_HP\(enemyHp, enemyMaxHp, enemyObj\) \{[\s\S]*?applyCombatHpUiState\(document, buildCombatHpUiState\(/,
    'combat HP updates should route DOM application through the combat HP UI helper'
);

const updateHpMatch = indexHtml.match(/updateRPG_HP\(enemyHp, enemyMaxHp, enemyObj\) \{[\s\S]*?\n    \}/);
assert.ok(updateHpMatch, 'combat HP update method should stay discoverable');
assert.doesNotMatch(
    updateHpMatch[0],
    /monsterCard\.className/,
    'combat HP controller should not own monster card class switching'
);

console.log('combat-hp-ui checks passed');
