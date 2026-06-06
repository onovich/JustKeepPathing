export const RUN_RELIC_SLOTS = 3;

export const RELIC_DEFS = Object.freeze([
    Object.freeze({
        id: 'pathfinder_lens',
        label: '侧路雷达',
        shortLabel: '密室更容易出现，也更愿意绕路进去。',
        summary: '+密室率 / +绕路意愿',
        description: '让隐藏房间更容易刷出来，自动寻路也会更积极地往里拐。',
        minLevel: 1,
        weight: 18,
        sourceBias: Object.freeze({ elite: 4, boss: 1 }),
        themeBias: Object.freeze({ signal_warrens: 6, salvage_reaches: 2 })
    }),
    Object.freeze({
        id: 'salvage_thrusters',
        label: '回收推进器',
        shortLabel: '宝箱收益更高，补给也更容易掉。',
        summary: '+宝箱收益 / +补给掉率',
        description: '把一整局的宝箱与补给路线都往更肥的方向推。',
        minLevel: 1,
        weight: 18,
        sourceBias: Object.freeze({ elite: 3, boss: 2 }),
        themeBias: Object.freeze({ salvage_reaches: 7, signal_warrens: 1 })
    }),
    Object.freeze({
        id: 'blood_compass',
        label: '猎潮罗盘',
        shortLabel: '怪会更多，但每只怪给的收益也更高。',
        summary: '+怪物数量 / +击杀收益',
        description: '把这一局往高压高收益方向推，更适合喜欢刷怪的路线。',
        minLevel: 2,
        weight: 15,
        sourceBias: Object.freeze({ elite: 2, boss: 4 }),
        themeBias: Object.freeze({ ember_forge: 7, quarantine_vault: 2 })
    }),
    Object.freeze({
        id: 'reflex_shield',
        label: '反射护盾',
        shortLabel: '每层第一次挨打会被护盾硬吃下来。',
        summary: '首击大减伤',
        description: '每层的第一次受击会大幅减伤，适合高压楼层与 Boss。',
        minLevel: 2,
        weight: 14,
        sourceBias: Object.freeze({ elite: 1, boss: 5 }),
        themeBias: Object.freeze({ quarantine_vault: 8, signal_warrens: 1 })
    }),
    Object.freeze({
        id: 'echo_engine',
        label: '回响引擎',
        shortLabel: '清空异常密室后，下层火力会被抬高。',
        summary: '异常后下层更能打',
        description: '让事件房不只给一次性奖励，还会把下一层的输出一起抬起来。',
        minLevel: 2,
        weight: 15,
        sourceBias: Object.freeze({ elite: 2, boss: 2 }),
        themeBias: Object.freeze({ signal_warrens: 7, ember_forge: 1 })
    }),
    Object.freeze({
        id: 'boss_harvester',
        label: '首领收割模组',
        shortLabel: 'Boss 结算更肥，越适合连着刷首领。',
        summary: '+Boss 奖励',
        description: '专门抬 Boss 和终局击破收益，让章节高潮更值钱。',
        minLevel: 3,
        weight: 11,
        sourceBias: Object.freeze({ elite: 0, boss: 7 }),
        themeBias: Object.freeze({ ember_forge: 2, quarantine_vault: 3 })
    })
]);

export function getRelicDef(id) {
    return RELIC_DEFS.find((relic) => relic.id === id) || null;
}

function getAdjustedWeight(relic, source = 'elite', themeKey = null) {
    return Math.max(
        0,
        (relic.weight || 0)
        + (relic.sourceBias?.[source] || 0)
        + (themeKey ? (relic.themeBias?.[themeKey] || 0) : 0)
    );
}

export function pickRelicReward({
    level = 1,
    source = 'elite',
    themeKey = null,
    ownedIds = [],
    random = Math.random
} = {}) {
    const pool = RELIC_DEFS
        .filter((relic) => level >= (relic.minLevel || 1) && !ownedIds.includes(relic.id))
        .map((relic) => ({ relic, weight: getAdjustedWeight(relic, source, themeKey) }))
        .filter((entry) => entry.weight > 0);

    if (!pool.length) return null;

    const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = random() * totalWeight;
    for (const entry of pool) {
        roll -= entry.weight;
        if (roll <= 0) return entry.relic;
    }
    return pool[pool.length - 1].relic;
}
