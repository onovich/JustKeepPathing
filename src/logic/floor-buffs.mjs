export const FLOOR_SUPPLY_TYPES = Object.freeze(['assault', 'salvage', 'scout']);

export const FLOOR_SUPPLY_ROLLS = Object.freeze({
    cache: Object.freeze([
        Object.freeze({ key: 'salvage', weight: 0.5 }),
        Object.freeze({ key: 'scout', weight: 0.32 }),
        Object.freeze({ key: 'assault', weight: 0.18 })
    ]),
    chest: Object.freeze([
        Object.freeze({ key: 'salvage', weight: 0.48 }),
        Object.freeze({ key: 'assault', weight: 0.3 }),
        Object.freeze({ key: 'scout', weight: 0.22 })
    ])
});

const DEFAULT_FLOOR_BUFF = Object.freeze({
    supplyActive: false,
    supplyKey: null,
    supplyLabel: '',
    hiddenRoomBonus: 0,
    chestRewardMult: 1,
    attackMult: 1,
    supplyDropBonus: 0,
    diversionBonus: 0,
    moveSpeedMult: 1,
    monsterSpawnMult: 1,
    monsterRewardMult: 1,
    incomingDamageMult: 1,
    bossRewardMult: 1
});

export function createBaseFloorBuff(overrides = {}) {
    return {
        ...DEFAULT_FLOOR_BUFF,
        ...overrides
    };
}

export function pickRandomFloorSupplyType(source = 'chest', randomValue = Math.random()) {
    const rolls = source === 'cache' ? FLOOR_SUPPLY_ROLLS.cache : FLOOR_SUPPLY_ROLLS.chest;
    let roll = Number.isFinite(Number(randomValue)) ? Number(randomValue) : 1;
    for (const entry of rolls) {
        roll -= entry.weight;
        if (roll <= 0) return entry.key;
    }
    return rolls[rolls.length - 1].key;
}

export function buildSupplyFloorBuff(supplyType, supplyLabel = '') {
    if (supplyType === 'assault') {
        return createBaseFloorBuff({
            supplyActive: true,
            supplyKey: supplyType,
            supplyLabel,
            attackMult: 1.24,
            bossRewardMult: 1.08
        });
    }
    if (supplyType === 'salvage') {
        return createBaseFloorBuff({
            supplyActive: true,
            supplyKey: supplyType,
            supplyLabel,
            chestRewardMult: 1.42,
            supplyDropBonus: 0.14
        });
    }
    if (supplyType === 'scout') {
        return createBaseFloorBuff({
            supplyActive: true,
            supplyKey: supplyType,
            supplyLabel,
            hiddenRoomBonus: 0.1,
            supplyDropBonus: 0.04,
            diversionBonus: 0.08
        });
    }
    return createBaseFloorBuff();
}

export function buildFloorSupplyConsumption({
    priority = [],
    supplies = {},
    supplyDefs = {}
} = {}) {
    const supplyType = priority.find((type) => Math.max(0, supplies[type] || 0) > 0) || null;
    if (!supplyType) {
        return {
            consumed: false,
            supplyType: null,
            floorBuff: createBaseFloorBuff()
        };
    }
    return {
        consumed: true,
        supplyType,
        floorBuff: buildSupplyFloorBuff(supplyType, supplyDefs[supplyType]?.label || '')
    };
}

export function applyRunRelicsToFloorStart({
    floorBuff = createBaseFloorBuff(),
    meta = {},
    runRelics = [],
    archetypeKey = 'combat'
} = {}) {
    const nextBuff = createBaseFloorBuff(floorBuff);
    const nextMeta = { ...meta };
    const owned = new Set(runRelics);
    const floorRuntime = {
        reflexShieldReady: owned.has('reflex_shield')
    };

    if (owned.has('pathfinder_lens')) {
        nextBuff.hiddenRoomBonus += 0.08;
        nextBuff.diversionBonus += 0.06;
    }
    if (owned.has('salvage_thrusters')) {
        nextBuff.chestRewardMult *= 1.18;
        nextBuff.supplyDropBonus += 0.08;
        nextBuff.moveSpeedMult *= archetypeKey === 'treasure' ? 0.9 : 0.95;
    }
    if (owned.has('blood_compass')) {
        nextBuff.monsterSpawnMult *= 1.18;
        nextBuff.monsterRewardMult *= 1.18;
    }
    if (owned.has('echo_engine') && nextMeta.nextFloorAttackBonus > 0) {
        nextBuff.attackMult *= 1 + nextMeta.nextFloorAttackBonus;
        nextMeta.nextFloorAttackBonus = 0;
    }
    if (owned.has('boss_harvester')) {
        nextBuff.bossRewardMult *= 1.22;
    }

    return {
        floorBuff: nextBuff,
        floorRuntime,
        meta: nextMeta
    };
}

export function applyThemeDirectiveToFloorBuff({
    floorBuff = createBaseFloorBuff(),
    floorPlan = null
} = {}) {
    const nextBuff = createBaseFloorBuff(floorBuff);
    const directive = floorPlan?.theme?.directive || null;
    if (!directive) {
        return {
            floorBuff: nextBuff,
            floorDirective: null
        };
    }

    const scale = floorPlan?.isFinaleFloor ? 1.35 : 1;
    const floorDirective = {
        label: directive.label,
        summary: directive.summary
    };
    if (directive.attackBonus) nextBuff.attackMult *= 1 + directive.attackBonus * scale;
    if (directive.chestRewardBonus) nextBuff.chestRewardMult *= 1 + directive.chestRewardBonus * scale;
    if (directive.hiddenRoomBonus) nextBuff.hiddenRoomBonus += directive.hiddenRoomBonus * scale;
    if (directive.supplyDropBonus) nextBuff.supplyDropBonus += directive.supplyDropBonus * scale;
    if (directive.diversionBonus) nextBuff.diversionBonus += directive.diversionBonus * scale;
    if (directive.monsterRewardBonus) nextBuff.monsterRewardMult *= 1 + directive.monsterRewardBonus * scale;
    if (directive.bossRewardBonus) nextBuff.bossRewardMult *= 1 + directive.bossRewardBonus * scale;
    if (directive.incomingDamageReduction) {
        nextBuff.incomingDamageMult *= Math.max(0.2, 1 - directive.incomingDamageReduction * scale);
    }

    return {
        floorBuff: nextBuff,
        floorDirective
    };
}
