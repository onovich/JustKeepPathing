import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

const expectedHiddenRewardSources = ['event', 'rest', 'merchant', 'trial', 'treasure', 'elite'];
const finalizeCallPattern = /finalizeHiddenRoomRewardResolution\(\s*['"]([^'"]+)['"]/g;
const finalizedSources = new Set([...indexHtml.matchAll(finalizeCallPattern)].map((match) => match[1]));

assert.deepEqual(
    [...finalizedSources].sort(),
    [...expectedHiddenRewardSources].sort(),
    'all hidden room reward source keys should route through finalizeHiddenRoomRewardResolution'
);

assert.match(
    indexHtml,
    /finalizeHiddenRoomRewardResolution\(sourceKey, room, message, anchorPos = null, details = \[\]\) \{[\s\S]*?resolveHiddenRoomRewardMessage\(/,
    'hidden room reward finalization wrapper should delegate to resolveHiddenRoomRewardMessage'
);

assert.match(
    indexHtml,
    /resolveEventRoomV2\(room\)[\s\S]*?buildEventRoomRewardStatePlan\(/,
    'event room final resolution should route reward state through the shared state-plan helper'
);

const roomRewardState = fs.readFileSync(path.join(repoRoot, 'src', 'logic', 'room-reward-state.mjs'), 'utf8');
assert.match(
    roomRewardState,
    /buildEventRoomRewardStatePlan\([\s\S]*?resolveEchoEngineEventBonus\(/,
    'event reward state helper should preserve Echo Engine handling through resolveEchoEngineEventBonus'
);

assert.match(
    indexHtml,
    /applyThemeChainBonus\(sourceKey, room, anchorPos = null\)[\s\S]*?buildThemeChainBonusStatePlan\(plan\)[\s\S]*?applyRoomRewardActions\(/,
    'theme-chain bonuses should route state application through the shared state-plan helper'
);

assert.match(
    indexHtml,
    /applyThemeChainBonus\(sourceKey, room, anchorPos = null\)[\s\S]*?formatThemeChainBonusMessage\(/,
    'theme-chain bonuses should format visible text through the shared reward-resolution helper'
);

const themeChainControllerMatch = indexHtml.match(/applyThemeChainBonus\(sourceKey, room, anchorPos = null\) \{[\s\S]*?\n    \}/);
assert.ok(themeChainControllerMatch, 'theme-chain bonus controller method should stay discoverable');
assert.doesNotMatch(
    themeChainControllerMatch[0],
    /plan\?\.kind === 'ember_forge'/,
    'theme-chain bonus controller should not own per-theme message branches'
);

const relicRollCalls = [...indexHtml.matchAll(/GameState\.rollRelicReward\(([^)]*)\)/g)].map((match) => match[1].trim());
assert.deepEqual(
    relicRollCalls,
    ['relicRollPlan.request', 'relicRollPlan.request'],
    'controller relic reward rolls should use buildRunRelicRewardRollPlan requests'
);

assert.match(
    indexHtml,
    /buildRunRelicRewardRollPlan\(\{[\s\S]*?source: 'elite'[\s\S]*?rewardTier: room\.rewardTier[\s\S]*?\}\)/,
    'elite hidden room clears should build relic roll requests through the shared plan helper'
);

assert.match(
    indexHtml,
    /resolveHiddenEliteRoomClear\(room, enemyMesh\)[\s\S]*?buildEliteRoomClearRewardStatePlan\(/,
    'elite hidden room clears should route reward state through the shared state-plan helper'
);

assert.match(
    indexHtml,
    /resolveHiddenCachePickup\(room, entityObj\)[\s\S]*?buildHiddenCachePickupStatePlan\(/,
    'treasure cache pickups should route reward state through the shared state-plan helper'
);

assert.match(
    indexHtml,
    /resolveHiddenEventNodePickup\(room, entityObj\)[\s\S]*?buildHiddenEventNodePickupStatePlan\(/,
    'event hidden room node pickups should route reward state through the shared state-plan helper'
);

assert.match(
    indexHtml,
    /resolveHiddenTrialNodePickup\(room, entityObj\)[\s\S]*?buildHiddenTrialNodePickupStatePlan\(/,
    'trial hidden room node pickups should route reward state through the shared state-plan helper'
);

assert.match(
    indexHtml,
    /resolveHiddenEliteNodePickup\(room, entityObj\)[\s\S]*?buildHiddenEliteNodePickupStatePlan\(/,
    'elite hidden room support node pickups should route reward state through the shared state-plan helper'
);

assert.match(
    indexHtml,
    /buildRunRelicRewardRollPlan\(\{[\s\S]*?enabled: profile\.boss[\s\S]*?source: 'boss'[\s\S]*?guaranteed: true[\s\S]*?\}\)/,
    'boss clears should build guaranteed relic roll requests through the shared plan helper'
);

console.log('room-reward-paths checks passed');
