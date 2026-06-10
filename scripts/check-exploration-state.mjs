import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
    buildExplorationChestPickupStatePlan,
    buildLevelExitStatePlan
} from '../src/logic/exploration-state.mjs';
import { applyRoomRewardActions } from '../src/logic/room-reward-state.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

{
    const plan = buildExplorationChestPickupStatePlan({
        level: 4,
        chestRewardMult: 1.5
    });

    assert.equal(plan.reward, 90);
    assert.deepEqual(plan.actions, [
        { type: 'score', amount: 90 },
        { type: 'increment-floor-stat', field: 'chests', amount: 1 }
    ]);

    const state = {
        score: 10,
        level: 4,
        floorStats: { chests: 2 },
        player: { baseHp: 80, currentHp: 80, baseAtk: 20 },
        maze: { baseChestRate: 0.05, baseMonsterRate: 0.03 },
        meta: { nextHiddenRoomBonus: 0, nextFloorAttackBonus: 0 },
        floorBuff: { incomingDamageMult: 1 },
        items: { supplies: {} }
    };
    applyRoomRewardActions({
        gameState: state,
        actions: plan.actions,
        addScore: (amount) => {
            state.score += amount;
        }
    });

    assert.equal(state.score, 100);
    assert.equal(state.floorStats.chests, 3);
}

{
    const plan = buildLevelExitStatePlan({ level: 3 });

    assert.equal(plan.reward, 300);
    assert.equal(plan.nextLevel, 4);
    assert.deepEqual(plan.actions, [
        { type: 'score', amount: 300 },
        { type: 'increment-game-field', field: 'level', amount: 1 }
    ]);

    const state = {
        score: 20,
        level: 3,
        floorStats: { chests: 0 },
        player: { baseHp: 80, currentHp: 80, baseAtk: 20 },
        maze: { baseChestRate: 0.05, baseMonsterRate: 0.03 },
        meta: { nextHiddenRoomBonus: 0, nextFloorAttackBonus: 0 },
        floorBuff: { incomingDamageMult: 1 },
        items: { supplies: {} }
    };
    applyRoomRewardActions({
        gameState: state,
        actions: plan.actions,
        addScore: (amount) => {
            state.score += amount;
        }
    });

    assert.equal(state.score, 320);
    assert.equal(state.level, 4);
}

assert.match(
    indexHtml,
    /if \(type === 'chest'\) \{[\s\S]*?buildExplorationChestPickupStatePlan\(/,
    'normal chest pickups should route score and chest-count state through the exploration state helper'
);

assert.match(
    indexHtml,
    /else if \(type === 'end'\) \{[\s\S]*?buildLevelExitStatePlan\(/,
    'level exits should route score and level state through the exploration state helper'
);

console.log('exploration-state checks passed');
