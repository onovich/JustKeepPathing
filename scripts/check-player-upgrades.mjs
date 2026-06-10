import assert from 'node:assert/strict';
import {
    applyUpgradePurchase,
    getUpgradeCost,
    getUpgradeCosts
} from '../src/logic/player-upgrades.mjs';

const player = {
    lvSpeed: 3,
    baseSpeed: 0.055,
    lvAtk: 2,
    baseAtk: 15,
    lvHp: 3,
    baseHp: 90,
    currentHp: 32
};
const maze = {
    lvChest: 2,
    baseChestRate: 0.07,
    lvMonster: 2,
    baseMonsterRate: 0.045,
    lvSize: 2,
    baseSide: 11,
    maxSide: 25
};

assert.equal(getUpgradeCost('speed', { player, maze }), 22);
assert.equal(getUpgradeCost('atk', { player, maze }), 30);
assert.equal(getUpgradeCost('hp', { player, maze }), 39);
assert.equal(getUpgradeCost('chest', { player, maze }), 80);
assert.equal(getUpgradeCost('size', { player, maze }), 68);
assert.equal(getUpgradeCost('monster', { player, maze }), 180);
assert.equal(getUpgradeCost('unknown', { player, maze }), Infinity);
assert.deepEqual(getUpgradeCosts({ player, maze }), {
    speed: 22,
    atk: 30,
    hp: 39,
    chest: 80,
    size: 68,
    monster: 180
});

{
    const result = applyUpgradePurchase({
        type: 'atk',
        score: 50,
        player,
        maze
    });
    assert.equal(result.purchased, true);
    assert.equal(result.cost, 30);
    assert.equal(result.score, 20);
    assert.equal(result.player.lvAtk, 3);
    assert.equal(result.player.baseAtk, 20);
    assert.equal(player.lvAtk, 2, 'input player should not be mutated');
}

{
    const result = applyUpgradePurchase({
        type: 'hp',
        score: 50,
        player,
        maze
    });
    assert.equal(result.purchased, true);
    assert.equal(result.player.lvHp, 4);
    assert.equal(result.player.baseHp, 110);
    assert.equal(result.player.currentHp, 110);
}

{
    const result = applyUpgradePurchase({
        type: 'speed',
        score: 100,
        player: { ...player, baseSpeed: 0.045 },
        maze
    });
    assert.equal(result.purchased, true);
    assert.equal(result.player.lvSpeed, 4);
    assert.equal(result.player.baseSpeed, 0.04);
}

{
    const result = applyUpgradePurchase({
        type: 'chest',
        score: 100,
        player,
        maze
    });
    assert.equal(result.purchased, true);
    assert.equal(result.maze.lvChest, 3);
    assert.equal(result.maze.baseChestRate, 0.09000000000000001);
    assert.equal(maze.lvChest, 2, 'input maze should not be mutated');
}

{
    const result = applyUpgradePurchase({
        type: 'monster',
        score: 200,
        player,
        maze
    });
    assert.equal(result.purchased, true);
    assert.equal(result.maze.lvMonster, 3);
    assert.equal(result.maze.baseMonsterRate, 0.06);
}

{
    const result = applyUpgradePurchase({
        type: 'size',
        score: 200,
        player,
        maze,
        sizeUpgradeMaxed: true
    });
    assert.equal(result.purchased, false);
    assert.equal(result.blockedReason, 'size-maxed');
    assert.equal(result.score, 200);
    assert.equal(result.maze.lvSize, 2);
}

{
    const result = applyUpgradePurchase({
        type: 'atk',
        score: 29,
        player,
        maze
    });
    assert.equal(result.purchased, false);
    assert.equal(result.blockedReason, 'insufficient-score');
    assert.equal(result.score, 29);
}

assert.equal(
    applyUpgradePurchase({
        type: 'mystery',
        score: 999,
        player,
        maze
    }).blockedReason,
    'unknown-upgrade'
);

console.log('player-upgrades checks passed');
