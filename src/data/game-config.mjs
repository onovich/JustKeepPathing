export const ENEMY_ARCHETYPES = Object.freeze([
    {
        id: 'scout',
        name: '棱镜侦察者',
        color: 0xf97316,
        accent: 0xfdba74,
        minLevel: 1,
        weight: 4,
        themeBias: { signal_warrens: 5, salvage_reaches: 2, quarantine_vault: -1 },
        baseHp: 28,
        baseAtk: 7,
        reward: 95,
        hoverAmplitude: 0.07,
        hoverSpeed: 2.8,
        scale: 0.9,
        intro: '棱镜侦察者切入视野，战斗开始！',
        attackVerb: '高速撞击'
    },
    {
        id: 'brute',
        name: '熔核冲锋兽',
        color: 0xef4444,
        accent: 0xfca5a5,
        minLevel: 1,
        weight: 3,
        themeBias: { ember_forge: 6, quarantine_vault: 2, salvage_reaches: -1 },
        baseHp: 44,
        baseAtk: 10,
        reward: 130,
        hoverAmplitude: 0.04,
        hoverSpeed: 1.9,
        scale: 1.05,
        intro: '熔核冲锋兽正面堵截，战斗开始！',
        attackVerb: '熔核突进'
    },
    {
        id: 'spine',
        name: '裂脊潜伏体',
        color: 0xa855f7,
        accent: 0xe9d5ff,
        minLevel: 2,
        weight: 2,
        themeBias: { signal_warrens: 3, quarantine_vault: 4, ember_forge: -1 },
        baseHp: 34,
        baseAtk: 12,
        reward: 145,
        hoverAmplitude: 0.09,
        hoverSpeed: 3.1,
        scale: 0.96,
        intro: '裂脊潜伏体从阴影跃出，战斗开始！',
        attackVerb: '脊刺穿刺'
    },
    {
        id: 'warden',
        name: '幽环守望者',
        color: 0x14b8a6,
        accent: 0x99f6e4,
        minLevel: 3,
        weight: 2,
        themeBias: { quarantine_vault: 5, salvage_reaches: 1, ember_forge: 1 },
        baseHp: 40,
        baseAtk: 11,
        reward: 165,
        hoverAmplitude: 0.08,
        hoverSpeed: 2.3,
        scale: 1.02,
        intro: '幽环守望者展开护环，战斗开始！',
        attackVerb: '环刃碾压'
    },
    {
        id: 'boss',
        name: '深渊主脑',
        color: 0xf59e0b,
        accent: 0xfef08a,
        minLevel: 4,
        weight: 0,
        baseHp: 135,
        baseAtk: 18,
        reward: 460,
        hoverAmplitude: 0.11,
        hoverSpeed: 1.8,
        scale: 1.55,
        intro: '警报：深渊主脑已被投放，Boss 战开始！',
        attackVerb: '核心湮灭脉冲',
        boss: true
    }
]);

export const MODEL_EDITOR_STORAGE_KEY = 'jkp-model-appearance-v1';
export const MODEL_EDITOR_DEFAULT_CONFIG = Object.freeze({ version: 1, assets: {} });
export const MODEL_EDITOR_DEFAULT_FACE_PATTERN = Object.freeze({
    pattern: 'none',
    patternColor: '#0f172a',
    patternScale: 8
});
export const MODEL_EDITOR_DEFAULT_LINE_STYLE = Object.freeze({
    style: 'solid',
    width: 2
});
export const MODEL_EDITOR_FACE_PATTERN_IDS = Object.freeze({
    none: 0,
    halftone: 1,
    dither: 2,
    hatch: 3
});
export const MODEL_EDITOR_FACE_PATTERN_KEYS = Object.freeze(['none', 'halftone', 'dither', 'hatch']);
export const MODEL_EDITOR_ASSET_LABELS = Object.freeze({
    player: '玩家飞碟',
    scout: '棱镜侦察者',
    brute: '熔核冲锋兽',
    spine: '裂脊潜伏体',
    warden: '幽环守望者',
    boss: '深渊主脑',
    chest: '数据宝藏',
    exit: '出口信标'
});

export const SOUND_EDITOR_STORAGE_KEY = 'jkp-sound-config-v1';
export const SOUND_EDITOR_MAX_TRACKS = 5;
export const SOUND_WAVE_TYPES = Object.freeze(['sine', 'triangle', 'square', 'sawtooth']);
export const SOUND_EVENT_DEFS = Object.freeze({
    upgrade: { label: '升级成功', type: 'oneshot', usage: '购买任意升级后立刻播放', description: '偏明亮上扬的提示音，让升级反馈更明显。' },
    chest: { label: '打开宝箱', type: 'oneshot', usage: '玩家拾取宝箱奖励时播放', description: '清脆一点，突出奖励到手的瞬间。' },
    levelClear: { label: '突破出口', type: 'oneshot', usage: '成功到达出口并进入下一层时播放', description: '会自动补一层和声音色，让通关更像阶段胜利。' },
    enemyHit: { label: '命中敌人', type: 'oneshot', usage: '玩家在战斗里打到敌人时播放', description: '偏短促、带攻击感的打击音。' },
    playerHit: { label: '玩家受击', type: 'oneshot', usage: '敌人在战斗里命中玩家时播放', description: '整体更沉、更硬，突出受伤压力。' },
    enemyDefeat: { label: '击败敌人', type: 'oneshot', usage: '战斗胜利时播放', description: '带一点下坠感，像把敌人彻底收掉。' },
    bossIntro: { label: 'Boss 登场', type: 'oneshot', usage: 'Boss 战刚开始时播放', description: '低频更厚、滤波更重，用来拉开压迫感。' },
    defeat: { label: '玩家倒下', type: 'oneshot', usage: '玩家战败后播放', description: '会自动加一点低八度尾音，做出失速感。' },
    footsteps: { label: '移动脚步', type: 'loop', usage: '玩家在探索阶段持续移动时循环播放', description: '这是连续音效，可调节整体节奏，并最多叠加 5 条音轨。' },
    bgm: { label: '背景音乐', type: 'bgm', usage: '游戏运行时作为背景音乐持续播放', description: '使用和弦卷积核生成偏舒服的 MIDI 风格织体，试听时会播放一小段。' }
});

export function createOneShotSoundConfig(overrides = {}) {
    return {
        waveform: 'triangle',
        volume: 0.11,
        startFreq: 440,
        endFreq: 660,
        duration: 0.18,
        attack: 0.005,
        hold: 0.02,
        release: 0.14,
        filterCutoff: 2600,
        resonance: 3,
        vibratoRate: 0,
        vibratoDepth: 0,
        detune: 8,
        subMix: 0.18,
        distortion: 0.02,
        delayMix: 0.08,
        pan: 0,
        ...overrides
    };
}

export function createFootstepTrack(overrides = {}) {
    return {
        enabled: true,
        waveform: 'square',
        volume: 0.12,
        startFreq: 170,
        endFreq: 92,
        duration: 0.07,
        attack: 0.002,
        hold: 0.01,
        release: 0.06,
        filterCutoff: 960,
        resonance: 2.4,
        vibratoRate: 0,
        vibratoDepth: 0,
        detune: 0,
        subMix: 0.1,
        distortion: 0.03,
        delayMix: 0.02,
        pan: 0,
        stepDiv: 1,
        offset: 0,
        ...overrides
    };
}

export function createDefaultSoundConfig() {
    return {
        version: 1,
        sounds: {
            upgrade: createOneShotSoundConfig({ waveform: 'triangle', volume: 0.12, startFreq: 420, endFreq: 760, duration: 0.18, filterCutoff: 3200, delayMix: 0.12, subMix: 0.12 }),
            chest: createOneShotSoundConfig({ waveform: 'triangle', volume: 0.115, startFreq: 620, endFreq: 980, duration: 0.13, filterCutoff: 3600, delayMix: 0.09, subMix: 0.08 }),
            levelClear: createOneShotSoundConfig({ waveform: 'sine', volume: 0.12, startFreq: 392, endFreq: 588, duration: 0.24, filterCutoff: 3000, delayMix: 0.14, detune: 11, subMix: 0.22 }),
            enemyHit: createOneShotSoundConfig({ waveform: 'sawtooth', volume: 0.105, startFreq: 310, endFreq: 156, duration: 0.11, filterCutoff: 1800, resonance: 4.8, distortion: 0.1, detune: 5 }),
            playerHit: createOneShotSoundConfig({ waveform: 'square', volume: 0.115, startFreq: 220, endFreq: 88, duration: 0.18, filterCutoff: 1400, resonance: 6.2, distortion: 0.08, subMix: 0.28 }),
            enemyDefeat: createOneShotSoundConfig({ waveform: 'sawtooth', volume: 0.12, startFreq: 250, endFreq: 88, duration: 0.24, filterCutoff: 1700, resonance: 4.4, delayMix: 0.06, subMix: 0.2 }),
            bossIntro: createOneShotSoundConfig({ waveform: 'sawtooth', volume: 0.16, startFreq: 130, endFreq: 98, duration: 0.42, filterCutoff: 1100, resonance: 8.5, distortion: 0.14, subMix: 0.32 }),
            defeat: createOneShotSoundConfig({ waveform: 'square', volume: 0.145, startFreq: 240, endFreq: 72, duration: 0.34, filterCutoff: 1200, resonance: 5.2, distortion: 0.06, delayMix: 0.04, subMix: 0.26 }),
            footsteps: {
                volume: 0.28,
                tempo: 132,
                stride: 1,
                swing: 0.06,
                stepBeats: 0.5,
                accent: 1.16,
                tracks: [
                    createFootstepTrack({ waveform: 'square', volume: 0.12, startFreq: 168, endFreq: 84, filterCutoff: 900, pan: -0.14 }),
                    createFootstepTrack({ waveform: 'triangle', volume: 0.09, startFreq: 410, endFreq: 220, duration: 0.05, filterCutoff: 2100, stepDiv: 2, offset: 1, pan: 0.16 }),
                    createFootstepTrack({ waveform: 'sawtooth', volume: 0.05, startFreq: 680, endFreq: 240, duration: 0.045, filterCutoff: 2600, stepDiv: 4, offset: 2, distortion: 0.12, pan: 0.04 }),
                    createFootstepTrack({ enabled: false, waveform: 'triangle', volume: 0.05, startFreq: 1200, endFreq: 620, duration: 0.035, filterCutoff: 3600, stepDiv: 2, offset: 0, pan: -0.24 }),
                    createFootstepTrack({ enabled: false, waveform: 'square', volume: 0.08, startFreq: 96, endFreq: 62, duration: 0.09, filterCutoff: 720, stepDiv: 3, offset: 1, pan: 0.24 })
                ]
            },
            bgm: {
                enabled: true,
                volume: 0.15,
                tempo: 92,
                root: 45,
                kernel: 'warmPop',
                brightness: 0.58,
                swing: 0.08,
                noteLength: 0.8,
                attack: 0.012,
                release: 0.28,
                stereoSpread: 0.34,
                humanize: 0.02,
                detune: 9
            }
        }
    };
}

export const SOUND_EDITOR_DEFAULT_CONFIG = Object.freeze(createDefaultSoundConfig());
export const BGM_KERNELS = Object.freeze({
    warmPop: {
        label: '温暖流行',
        progression: [[0, 4, 7, 11], [7, 11, 14, 18], [9, 12, 16, 19], [5, 9, 12, 16]],
        melody: [0, 7, 4, 11, 14, 11, 7, 4]
    },
    dreamGlass: {
        label: '玻璃梦境',
        progression: [[0, 7, 11, 14], [4, 9, 12, 16], [5, 12, 16, 19], [2, 9, 14, 17]],
        melody: [0, 11, 7, 14, 12, 16, 9, 7]
    },
    nightCruise: {
        label: '夜行巡航',
        progression: [[0, 3, 7, 10], [5, 8, 12, 15], [7, 10, 14, 17], [3, 7, 10, 14]],
        melody: [0, 7, 10, 7, 12, 10, 7, 3]
    }
});
