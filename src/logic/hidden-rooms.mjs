import {
    ELITE_ROOM_SUPPORT_SEEDS,
    EVENT_ROOM_SEEDS,
    FLOOR_ARCHETYPE_ROOM_WEIGHTS,
    HIDDEN_ROOM_ACCESS_PARAMS,
    HIDDEN_ROOM_GATES,
    HIDDEN_ROOM_PLACEMENT_ARCHETYPES,
    HIDDEN_ROOM_REWARD_TIERS,
    HIDDEN_ROOM_TYPES,
    TRIAL_ROOM_SEEDS,
    V1_HIDDEN_ROOM_ENABLED_GATES,
    V1_HIDDEN_ROOM_ENABLED_PLACEMENTS,
    V1_HIDDEN_ROOM_ENABLED_TYPES
} from '../data/floor-content.mjs';

const HIDDEN_ROOM_DISPLAY_NAMES = Object.freeze({
    treasure: '藏宝密室',
    event: '异象密室',
    elite: '精英密室',
    merchant: '商贩密室',
    rest: '休整密室',
    trial: '试炼密室'
});

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function weightedPick(entries, random = Math.random) {
    const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight || 0), 0);
    if (total <= 0) return entries[0]?.value ?? null;
    let roll = random() * total;
    for (const entry of entries) {
        roll -= Math.max(0, entry.weight || 0);
        if (roll <= 0) return entry.value;
    }
    return entries[entries.length - 1]?.value ?? null;
}

function getThemeAdjustedWeight(baseWeight, themeBias, themeKey) {
    return Math.max(0, (baseWeight || 0) + (themeKey && themeBias ? (themeBias[themeKey] || 0) : 0));
}

function randomInt(min, max, random = Math.random) {
    return Math.floor(min + random() * (max - min + 1));
}

function chooseCandidateForPlacement(candidates, placementKey, usedKeys, random = Math.random) {
    const placement = HIDDEN_ROOM_PLACEMENT_ARCHETYPES[placementKey] || HIDDEN_ROOM_PLACEMENT_ARCHETYPES.branch_pocket;
    const available = candidates.filter((candidate) => !usedKeys.has(candidate.key));
    if (available.length === 0) return null;

    let best = null;
    let bestScore = -Infinity;
    for (const candidate of available) {
        const center = (placement.difficultyTargetMin + placement.difficultyTargetMax) * 0.5;
        const range = Math.max(0.08, (placement.difficultyTargetMax - placement.difficultyTargetMin) * 0.5);
        const distancePenalty = Math.abs(candidate.difficultyScore - center) / range;
        const deadEndBonus = candidate.deadEndScore * 0.18;
        const depthBonus = candidate.branchDepthNorm * 0.22;
        const jitter = (random() * 2 - 1) * 0.03;
        const score = 1 - distancePenalty + deadEndBonus + depthBonus + jitter;
        if (score > bestScore) {
            bestScore = score;
            best = candidate;
        }
    }
    return best;
}

function estimateAccessScore({
    roomTypeKey,
    rewardTier,
    floorWeightNorm,
    detourNorm,
    sealedNorm,
    scannerBonus = 0
}) {
    const rewardTierNorm = clamp((rewardTier - 1) / 3, 0, 1);
    const dangerNorm = roomTypeKey === 'elite'
        ? 0.78
        : roomTypeKey === 'trial'
            ? 0.56
            : roomTypeKey === 'event'
                ? 0.22
                : 0.12;
    const roomDef = HIDDEN_ROOM_TYPES[roomTypeKey] || HIDDEN_ROOM_TYPES.treasure;
    const score = rewardTierNorm * HIDDEN_ROOM_ACCESS_PARAMS.rewardWeightScale
        + clamp(scannerBonus, 0, 1) * HIDDEN_ROOM_ACCESS_PARAMS.scannerBonusScale
        + clamp(floorWeightNorm, 0, 1) * HIDDEN_ROOM_ACCESS_PARAMS.floorArchetypeBiasScale
        + clamp(roomDef.autoDiversionBias + 0.08, 0, 0.4)
        - clamp(detourNorm, 0, 1) * HIDDEN_ROOM_ACCESS_PARAMS.detourCostScale
        - dangerNorm * HIDDEN_ROOM_ACCESS_PARAMS.dangerPenaltyScale
        - clamp(sealedNorm, 0, 1) * HIDDEN_ROOM_ACCESS_PARAMS.sealedPenaltyScale;
    return score;
}

function pickEventSeed(level, themeKey = null, random = Math.random) {
    const entries = EVENT_ROOM_SEEDS
        .filter((seed) => level >= seed.minLevel)
        .map((seed) => ({ value: seed, weight: getThemeAdjustedWeight(seed.weight, seed.themeBias, themeKey) }));
    return weightedPick(entries, random);
}

function pickTrialSeed(level, themeKey = null, random = Math.random) {
    const entries = TRIAL_ROOM_SEEDS
        .filter((seed) => level >= seed.minLevel)
        .map((seed) => ({ value: seed, weight: getThemeAdjustedWeight(seed.weight, seed.themeBias, themeKey) }));
    return weightedPick(entries, random);
}

export function buildEliteRoomSupportLoadout(level, rewardTier, random = Math.random) {
    const targetCount = rewardTier >= 3 ? 2 : 1;
    const pool = ELITE_ROOM_SUPPORT_SEEDS.filter((seed) => level >= seed.minLevel);
    if (pool.length === 0) return [];

    const picks = [];
    const usedIds = new Set();
    while (picks.length < targetCount) {
        const available = pool.filter((seed) => !usedIds.has(seed.id));
        const pick = weightedPick(
            (available.length > 0 ? available : pool).map((seed) => ({ value: seed, weight: seed.weight })),
            random
        );
        if (!pick) break;
        picks.push(pick);
        usedIds.add(pick.id);
        if (available.length === 0) break;
    }
    return picks;
}

export function buildEliteRoomVariant(level, rewardTier, placementKey, random = Math.random) {
    const entries = [
        {
            value: {
                key: 'bulwark',
                label: '壁垒密室',
                chamberStyle: 'bastion',
                introHint: '前场是装置区，深处藏着精英。'
            },
            weight: placementKey === 'sealed_chamber' ? 28 : 20
        },
        {
            value: {
                key: 'gauntlet',
                label: '长廊密室',
                chamberStyle: 'corridor',
                introHint: '需要穿过一段狭长通道。'
            },
            weight: placementKey === 'deep_route_reward' ? 28 : 18
        },
        {
            value: {
                key: 'pincer',
                label: '夹击密室',
                chamberStyle: 'fork',
                introHint: '左右两翼会摆出支援装置。'
            },
            weight: rewardTier >= 3 || level >= 4 ? 24 : 12
        }
    ];
    return weightedPick(entries, random) || entries[0].value;
}

export function getHiddenRoomDisplayName(typeKey) {
    return HIDDEN_ROOM_DISPLAY_NAMES[typeKey] || '隐藏房间';
}

export function getHiddenRoomRewardTier(rewardTier) {
    return HIDDEN_ROOM_REWARD_TIERS[rewardTier] || HIDDEN_ROOM_REWARD_TIERS[1];
}

export function buildEliteEnemyArchetype({
    baseEnemy = {},
    room = {}
} = {}) {
    const rewardProfile = room.rewardProfile || getHiddenRoomRewardTier(room.rewardTier);
    const variantLabel = room.eliteVariant?.label || room.displayName;
    const variantHint = room.eliteVariant?.introHint || '精英正在深处待命。';

    return {
        ...baseEnemy,
        id: `${baseEnemy.id}-elite-${room.id}`,
        name: `${baseEnemy.name}精英`,
        baseHp: Math.floor(baseEnemy.baseHp * 1.52),
        baseAtk: Math.floor(baseEnemy.baseAtk * 1.26),
        reward: Math.floor(baseEnemy.reward * (1.55 + rewardProfile.scoreMult * 0.35)),
        scale: (baseEnemy.scale || 1) * 1.12,
        hoverAmplitude: baseEnemy.hoverAmplitude * 1.08,
        hoverSpeed: Math.max(1.5, baseEnemy.hoverSpeed * 0.94),
        intro: `${variantLabel}里的 ${baseEnemy.name} 精英开始反击。${variantHint}`,
        attackVerb: `精英${baseEnemy.attackVerb}`,
        elite: true,
        hiddenRoomId: room.id,
        hiddenRoomRewardTier: room.rewardTier
    };
}

export function buildHiddenCacheEntityState({
    room = {},
    slot = {},
    index = 0,
    level = 1,
    hoverOffset = 0
} = {}) {
    const rewardProfile = room.rewardProfile || getHiddenRoomRewardTier(room.rewardTier);
    const reward = Math.max(
        8,
        Math.floor((18 + rewardProfile.chestBonus * 7 + index * 3) * level * (0.7 + rewardProfile.scoreMult))
    );

    return {
        id: `${room.id}-cache-${index + 1}`,
        type: 'hidden-cache',
        c: slot.c,
        r: slot.r,
        hiddenRoomId: room.id,
        reward,
        baseY: 0.19,
        hoverAmplitude: 0.035,
        hoverSpeed: 2.2,
        hoverOffset,
        spinSpeed: 0.92,
        counterSpinSpeed: 0
    };
}

export function buildHiddenEventNodeEntityState({
    room = {},
    slot = {},
    index = 0,
    level = 1,
    hoverOffset = 0
} = {}) {
    const eventSeed = room.eventSeed || {};
    const reward = Math.max(
        10,
        Math.floor((14 + room.rewardTier * 5 + index * 2) * level * 0.8 * (eventSeed.rewardMult || 1))
    );

    return {
        id: `${room.id}-event-node-${index + 1}`,
        type: 'hidden-event-node',
        c: slot.c,
        r: slot.r,
        hiddenRoomId: room.id,
        reward,
        baseY: 0.12,
        hoverAmplitude: 0.045,
        hoverSpeed: 2.6,
        hoverOffset,
        spinSpeed: 1.35,
        counterSpinSpeed: 0
    };
}

export function buildHiddenEliteNodeEntityState({
    room = {},
    slot = {},
    supportDef = null,
    index = 0,
    level = 1,
    hoverOffset = 0
} = {}) {
    const reward = Math.max(
        12,
        Math.floor((16 + room.rewardTier * 6 + index * 3) * level * (supportDef?.rewardMult || 1))
    );

    return {
        id: `${room.id}-elite-node-${index + 1}`,
        type: 'hidden-elite-node',
        c: slot.c,
        r: slot.r,
        hiddenRoomId: room.id,
        reward,
        supportData: supportDef,
        baseY: 0.14,
        hoverAmplitude: 0.05,
        hoverSpeed: 2.3,
        hoverOffset,
        spinSpeed: 1.24,
        counterSpinSpeed: 0
    };
}

export function buildHiddenTrialNodeEntityState({
    room = {},
    slot = {},
    index = 0,
    level = 1,
    hoverOffset = 0
} = {}) {
    const rewardProfile = room.rewardProfile || getHiddenRoomRewardTier(room.rewardTier);
    const trialSeed = room.trialSeed || {};
    const reward = Math.max(
        14,
        Math.floor(
            (18 + room.rewardTier * 7 + index * 4)
                * level
                * (0.82 + rewardProfile.scoreMult * 0.32)
                * (trialSeed.rewardMult || 1)
        )
    );

    return {
        id: `${room.id}-trial-node-${index + 1}`,
        type: 'hidden-trial-node',
        c: slot.c,
        r: slot.r,
        hiddenRoomId: room.id,
        reward,
        hazardRatio: Math.min(0.2, (0.045 + room.rewardTier * 0.012 + index * 0.008) * (trialSeed.hazardMult || 1)),
        baseY: 0.15,
        hoverAmplitude: 0.05,
        hoverSpeed: 2.55,
        hoverOffset,
        spinSpeed: 1.2,
        counterSpinSpeed: 1.55
    };
}

function getInteriorRoomCells(room = {}) {
    const anchor = room.anchor || {};
    return (room.chamberCells || [])
        .filter((cell) => !(cell.c === anchor.c && cell.r === anchor.r));
}

function buildDistanceSortedRoomSlots(room = {}) {
    const anchor = room.anchor || {};
    return getInteriorRoomCells(room)
        .map((cell) => ({
            c: cell.c,
            r: cell.r,
            score: Math.abs(cell.c - anchor.c) + Math.abs(cell.r - anchor.r)
        }))
        .sort((a, b) => b.score - a.score);
}

export function buildTreasureRoomCachePrepState({
    room = {}
} = {}) {
    const slots = buildDistanceSortedRoomSlots(room);
    const rewardProfile = room.rewardProfile || getHiddenRoomRewardTier(room.rewardTier);
    const count = Math.min(slots.length, Math.max(2, rewardProfile.chestBonus));

    return {
        cacheSlots: slots.slice(0, count),
        cacheEntities: [],
        pendingCacheIds: [],
        cacheSpawned: false
    };
}

export function buildEventRoomNodePrepState({
    room = {}
} = {}) {
    const slots = buildDistanceSortedRoomSlots(room);
    const eventSeed = room.eventSeed || {};
    const count = Math.min(
        slots.length,
        Math.max(1, Math.min(3, Math.min(2, room.rewardTier) + (eventSeed.nodeCountBias || 0)))
    );

    return {
        eventNodeSlots: slots.slice(0, count),
        eventNodeEntities: [],
        pendingEventNodeIds: [],
        eventNodesSpawned: false,
        eventCharge: 0
    };
}

export function buildEliteRoomEncounterPrepState({
    room = {},
    level = 1,
    random = Math.random
} = {}) {
    const anchor = room.anchor || {};
    const slots = getInteriorRoomCells(room)
        .map((cell) => ({
            c: cell.c,
            r: cell.r,
            depth: Math.abs(cell.c - anchor.c) + Math.abs(cell.r - anchor.r),
            sideBias: room.chamberBlueprint
                ? Math.abs((cell.c - anchor.c) * room.chamberBlueprint.left.dc + (cell.r - anchor.r) * room.chamberBlueprint.left.dr)
                : 0
        }));
    const supportDefs = buildEliteRoomSupportLoadout(level, room.rewardTier, random);
    const variantKey = room.eliteVariant?.key || 'bulwark';
    const eliteSlots = [...slots].sort((a, b) => {
        if (variantKey === 'pincer') return (b.depth + b.sideBias * 0.45) - (a.depth + a.sideBias * 0.45);
        if (variantKey === 'gauntlet') return (b.depth * 1.4 - b.sideBias * 0.1) - (a.depth * 1.4 - a.sideBias * 0.1);
        return (b.depth * 1.2 - b.sideBias * 0.08) - (a.depth * 1.2 - a.sideBias * 0.08);
    });
    const eliteSlot = eliteSlots.shift() || { c: anchor.c, r: anchor.r };
    const supportSlots = slots
        .filter((slot) => !(slot.c === eliteSlot.c && slot.r === eliteSlot.r))
        .sort((a, b) => {
            if (variantKey === 'pincer') return (b.sideBias * 1.2 + b.depth * 0.4) - (a.sideBias * 1.2 + a.depth * 0.4);
            if (variantKey === 'gauntlet') return (a.depth - b.depth) || (b.sideBias - a.sideBias);
            return (b.depth * 0.9 + b.sideBias * 0.5) - (a.depth * 0.9 + a.sideBias * 0.5);
        });
    const supportLabelMap = {
        amp_pylon: '增幅装置',
        shield_core: '护盾核心',
        jammer: '干扰核心'
    };
    const eliteSupportDefs = supportDefs
        .slice(0, Math.max(0, Math.min(supportDefs.length, supportSlots.length)))
        .map((supportDef) => ({
            ...supportDef,
            label: supportLabelMap[supportDef.id] || supportDef.label
        }));

    return {
        eliteSlot,
        eliteSupportDefs,
        eliteSupportSlots: supportSlots.slice(0, eliteSupportDefs.length),
        eliteNodeEntities: [],
        pendingEliteNodeIds: [],
        eliteEncounterRevealed: false,
        eliteEntity: null
    };
}

export function buildTrialRoomNodePrepState({
    room = {}
} = {}) {
    const slots = buildDistanceSortedRoomSlots(room);
    const trialSeed = room.trialSeed || {};
    const count = Math.min(
        slots.length,
        Math.max(2, Math.min(5, room.rewardTier + (trialSeed.nodeCountBias || 0)))
    );

    return {
        trialNodeSlots: slots.slice(0, count),
        trialNodeEntities: [],
        pendingTrialNodeIds: [],
        trialNodesSpawned: false,
        trialCharge: 0,
        trialHazardTaken: 0
    };
}

export function getHiddenRoomDiversionThreshold() {
    return HIDDEN_ROOM_ACCESS_PARAMS.diversionThresholdBase;
}

export function getHiddenRoomAccentColor(typeKey) {
    if (typeKey === 'treasure') return 0xfacc15;
    if (typeKey === 'event') return 0xc084fc;
    if (typeKey === 'elite') return 0x38bdf8;
    if (typeKey === 'rest') return 0x34d399;
    if (typeKey === 'merchant') return 0xf59e0b;
    if (typeKey === 'trial') return 0xfb7185;
    return 0x94a3b8;
}

export function buildHiddenRoomPlan({
    level,
    maze,
    floorPlan,
    candidates,
    random = Math.random
}) {
    if (!floorPlan || !Array.isArray(candidates) || candidates.length === 0 || floorPlan.hiddenRoomCount <= 0) {
        return [];
    }

    const baseFloorWeights = FLOOR_ARCHETYPE_ROOM_WEIGHTS[floorPlan.archetypeKey] || FLOOR_ARCHETYPE_ROOM_WEIGHTS.combat;
    const themeWeightBias = floorPlan.theme?.hiddenRoomWeightBias || {};
    const finaleWeightBias = floorPlan.finale?.hiddenRoomWeightBias || {};
    const floorWeights = Object.fromEntries(
        Object.keys(HIDDEN_ROOM_TYPES).map((typeKey) => [
            typeKey,
            Math.max(0, (baseFloorWeights[typeKey] || 0) + (themeWeightBias[typeKey] || 0) + (finaleWeightBias[typeKey] || 0))
        ])
    );
    const eligibleTypes = V1_HIDDEN_ROOM_ENABLED_TYPES
        .map((typeKey) => ({ typeKey, def: HIDDEN_ROOM_TYPES[typeKey] }))
        .filter((entry) => entry.def && level >= entry.def.minFloorLevel);
    if (eligibleTypes.length === 0) return [];

    let roomCap = floorPlan.sizeBand === 'small' ? 1 : 2;
    if (maze.lvSize < 3) roomCap = Math.min(roomCap, 1);
    const requestedCount = Math.min(roomCap, floorPlan.hiddenRoomCount, candidates.length);
    if (requestedCount <= 0) return [];

    const rooms = [];
    const usedKeys = new Set();
    let forcedTypeKey = floorPlan.archetype?.guaranteedRoomType;
    if (!V1_HIDDEN_ROOM_ENABLED_TYPES.includes(forcedTypeKey)) forcedTypeKey = null;

    for (let index = 0; index < requestedCount; index++) {
        const typeKey = index === 0 && forcedTypeKey
            ? forcedTypeKey
            : weightedPick(
                eligibleTypes.map(({ typeKey: value, def }) => ({
                    value,
                    weight: Math.max(1, (floorWeights[value] || def.baseWeight || 1))
                })),
                random
            );
        const typeDef = HIDDEN_ROOM_TYPES[typeKey];
        if (!typeDef) continue;

        const placementKey = weightedPick(
            typeDef.placementPool
                .filter((key) => V1_HIDDEN_ROOM_ENABLED_PLACEMENTS.includes(key))
                .map((value) => ({ value, weight: 1 })),
            random
        ) || 'branch_pocket';

        const candidate = chooseCandidateForPlacement(candidates, placementKey, usedKeys, random);
        if (!candidate) break;
        usedKeys.add(candidate.key);

        const gateKey = weightedPick(
            typeDef.gatePool
                .filter((key) => V1_HIDDEN_ROOM_ENABLED_GATES.includes(key))
                .map((value) => ({ value, weight: value === 'none' ? 3 : 1 })),
            random
        ) || 'none';

        const gateDef = HIDDEN_ROOM_GATES[gateKey] || HIDDEN_ROOM_GATES.none;
        const rewardTier = randomInt(typeDef.rewardTierMin, typeDef.rewardTierMax, random);
        const detourNorm = clamp(candidate.detourSteps / Math.max(6, candidate.basePathLength + 4), 0, 1);
        const sealedNorm = gateKey === 'none' ? 0 : clamp((gateDef.thresholdBySize?.[floorPlan.sizeBand] || 0) / 10, 0, 1);
        const floorWeightNorm = clamp((floorWeights[typeKey] || 0) / 62, 0, 1);
        const accessScore = estimateAccessScore({
            roomTypeKey: typeKey,
            rewardTier,
            floorWeightNorm,
            detourNorm,
            sealedNorm
        });

        rooms.push({
            id: `hidden-room-${index + 1}-${candidate.c}-${candidate.r}`,
            typeKey,
            displayName: getHiddenRoomDisplayName(typeKey),
            rewardTier,
            rewardProfile: getHiddenRoomRewardTier(rewardTier),
            placementKey,
            gateKey,
            gateType: gateDef.type,
            gateThreshold: gateDef.thresholdBySize?.[floorPlan.sizeBand] || 0,
            anchor: { c: candidate.c, r: candidate.r },
            candidate,
            accessScore,
            cleared: false,
            entered: false,
            announced: false,
            unlocked: gateKey === 'none',
            eventSeed: typeKey === 'event' ? pickEventSeed(level, floorPlan.themeKey, random) : null,
            trialSeed: typeKey === 'trial' ? pickTrialSeed(level, floorPlan.themeKey, random) : null
        });
    }

    return rooms;
}
