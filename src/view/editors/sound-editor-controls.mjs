export function getSoundControlId(group, field) {
    return `snd-${group}-${field}`;
}

export function formatSoundControlDisplay(value, step, unit = '') {
    const precision = step < 1 ? (step < 0.1 ? 2 : 1) : 0;
    return `${Number(value).toFixed(precision)}${unit}`;
}

export function formatSoundRangeControlValue(control) {
    const id = String(control?.id || '');
    const value = Number(control?.value);
    const hasStep = !!control?.step;
    const step = Number(control?.step);

    if (id.includes('tempo')) return `${Math.round(value)} BPM`;
    if (id.includes('startFreq') || id.includes('endFreq') || id.includes('filterCutoff')) return `${Math.round(value)}Hz`;
    if (id.includes('attack') || id.includes('hold') || id.includes('release') || id.includes('duration') || id.includes('humanize')) return `${value.toFixed(hasStep && step < 0.01 ? 3 : 2)}s`;
    if (id.includes('root')) return `${Math.round(value)} MIDI`;
    if (id.includes('stepBeats')) return `${value.toFixed(3)} \u62cd`;
    if (id.includes('stride') || id.includes('accent') || id.includes('noteLength')) return `${value.toFixed(2)}x`;
    if (id.includes('detune')) return `${Math.round(value)}c`;
    return value.toFixed(hasStep && step < 0.1 ? 2 : 1);
}

export function applySoundRangeControlDisplay({
    documentRef,
    control
} = {}) {
    const valueEl = documentRef?.getElementById?.(`${control?.id}-value`);
    if (!valueEl) return null;

    valueEl.innerText = formatSoundRangeControlValue(control);
    return valueEl;
}

export function renderSoundSliderControl({
    label,
    field,
    value,
    min,
    max,
    step,
    unit = '',
    group
}) {
    const id = getSoundControlId(group, field);
    const display = formatSoundControlDisplay(value, step, unit);
    return `
            <label for="${id}" class="block rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div class="mb-2 flex items-center justify-between text-xs font-bold text-slate-200">
                    <span>${label}</span>
                    <span class="text-cyan-300" id="${id}-value">${display}</span>
                </div>
                <input id="${id}" data-group="${group}" data-field="${field}" class="settings-slider w-full" type="range" min="${min}" max="${max}" step="${step}" value="${value}">
            </label>
        `;
}

export function renderSoundSelectControl({
    label,
    field,
    value,
    options,
    group
}) {
    const id = getSoundControlId(group, field);
    return `
            <label for="${id}" class="block rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div class="mb-2 text-xs font-bold text-slate-200">${label}</div>
                <select id="${id}" data-group="${group}" data-field="${field}" class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-slate-100 outline-none focus:border-cyan-500">
                    ${options.map((option) => `<option value="${option.value}" ${option.value === value ? 'selected' : ''}>${option.label}</option>`).join('')}
                </select>
            </label>
        `;
}

export function renderSoundCheckboxControl({
    label,
    field,
    checked,
    group
}) {
    const id = getSoundControlId(group, field);
    return `
            <label for="${id}" class="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm font-bold text-slate-100">
                <span>${label}</span>
                <input id="${id}" data-group="${group}" data-field="${field}" type="checkbox" class="h-4 w-4 accent-cyan-400" ${checked ? 'checked' : ''}>
            </label>
        `;
}

export function buildSoundWaveOptions(waveTypes = []) {
    return waveTypes.map((wave) => ({ value: wave, label: wave }));
}

export function buildSoundTrackOptions(tracks = []) {
    return tracks.map((_, index) => ({ value: String(index), label: `音轨 ${index + 1}` }));
}

export function buildBgmKernelOptions(bgmKernels = {}) {
    return Object.entries(bgmKernels).map(([key, info]) => ({
        value: key,
        label: info.label
    }));
}

export function renderSoundOneShotControls({
    sound,
    waveTypes = []
} = {}) {
    const waveOptions = buildSoundWaveOptions(waveTypes);
    return `
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                ${renderSoundSelectControl({ label: '波形', field: 'waveform', value: sound.waveform, options: waveOptions, group: 'oneshot' })}
                ${renderSoundSliderControl({ label: '音量', field: 'volume', value: sound.volume, min: 0, max: 0.4, step: 0.005, unit: '', group: 'oneshot' })}
                ${renderSoundSliderControl({ label: '起始频率', field: 'startFreq', value: sound.startFreq, min: 40, max: 2200, step: 1, unit: 'Hz', group: 'oneshot' })}
                ${renderSoundSliderControl({ label: '结束频率', field: 'endFreq', value: sound.endFreq, min: 40, max: 2200, step: 1, unit: 'Hz', group: 'oneshot' })}
                ${renderSoundSliderControl({ label: '时长', field: 'duration', value: sound.duration, min: 0.03, max: 1.2, step: 0.01, unit: 's', group: 'oneshot' })}
                ${renderSoundSliderControl({ label: '滤波截止', field: 'filterCutoff', value: sound.filterCutoff, min: 120, max: 8000, step: 10, unit: 'Hz', group: 'oneshot' })}
                ${renderSoundSliderControl({ label: '攻击', field: 'attack', value: sound.attack, min: 0.001, max: 0.25, step: 0.001, unit: 's', group: 'oneshot' })}
                ${renderSoundSliderControl({ label: '保持', field: 'hold', value: sound.hold, min: 0, max: 0.3, step: 0.005, unit: 's', group: 'oneshot' })}
                ${renderSoundSliderControl({ label: '释放', field: 'release', value: sound.release, min: 0.01, max: 0.9, step: 0.01, unit: 's', group: 'oneshot' })}
                ${renderSoundSliderControl({ label: '共振', field: 'resonance', value: sound.resonance, min: 0.1, max: 16, step: 0.1, unit: '', group: 'oneshot' })}
                ${renderSoundSliderControl({ label: '颤音速率', field: 'vibratoRate', value: sound.vibratoRate, min: 0, max: 24, step: 0.1, unit: 'Hz', group: 'oneshot' })}
                ${renderSoundSliderControl({ label: '颤音深度', field: 'vibratoDepth', value: sound.vibratoDepth, min: 0, max: 220, step: 1, unit: 'c', group: 'oneshot' })}
                ${renderSoundSliderControl({ label: '轻微失谐', field: 'detune', value: sound.detune, min: 0, max: 48, step: 1, unit: 'c', group: 'oneshot' })}
                ${renderSoundSliderControl({ label: '次低频混合', field: 'subMix', value: sound.subMix, min: 0, max: 0.75, step: 0.01, unit: '', group: 'oneshot' })}
                ${renderSoundSliderControl({ label: '失真', field: 'distortion', value: sound.distortion, min: 0, max: 1, step: 0.01, unit: '', group: 'oneshot' })}
                ${renderSoundSliderControl({ label: '延迟混合', field: 'delayMix', value: sound.delayMix, min: 0, max: 0.75, step: 0.01, unit: '', group: 'oneshot' })}
                ${renderSoundSliderControl({ label: '声像', field: 'pan', value: sound.pan, min: -1, max: 1, step: 0.01, unit: '', group: 'oneshot' })}
            </div>
        `;
}

export function renderSoundLoopControls({
    sound,
    currentTrackIndex = 0,
    waveTypes = []
} = {}) {
    const waveOptions = buildSoundWaveOptions(waveTypes);
    const track = sound.tracks[currentTrackIndex];
    return `
            <div class="space-y-4">
                <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                    <div class="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">整体节奏</div>
                    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                        ${renderSoundSliderControl({ label: '总音量', field: 'volume', value: sound.volume, min: 0, max: 0.65, step: 0.01, unit: '', group: 'loop' })}
                        ${renderSoundSliderControl({ label: '节奏速度', field: 'tempo', value: sound.tempo, min: 40, max: 220, step: 1, unit: ' BPM', group: 'loop' })}
                        ${renderSoundSliderControl({ label: '步频倍率', field: 'stride', value: sound.stride, min: 0.4, max: 2.5, step: 0.01, unit: 'x', group: 'loop' })}
                        ${renderSoundSliderControl({ label: '摇摆', field: 'swing', value: sound.swing, min: 0, max: 0.45, step: 0.01, unit: '', group: 'loop' })}
                        ${renderSoundSliderControl({ label: '每步拍值', field: 'stepBeats', value: sound.stepBeats, min: 0.125, max: 2, step: 0.125, unit: ' 拍', group: 'loop' })}
                        ${renderSoundSliderControl({ label: '重拍力度', field: 'accent', value: sound.accent, min: 0.5, max: 2.5, step: 0.01, unit: 'x', group: 'loop' })}
                    </div>
                </div>
                <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                    <div class="mb-3 flex items-center justify-between">
                        <div class="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">音轨</div>
                        <div class="text-xs font-bold text-slate-400">最多 5 条</div>
                    </div>
                    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                        ${renderSoundSelectControl({ label: '当前音轨', field: 'trackIndex', value: String(currentTrackIndex), options: buildSoundTrackOptions(sound.tracks), group: 'meta' })}
                        ${renderSoundCheckboxControl({ label: '启用这条音轨', field: 'enabled', checked: track.enabled, group: 'track' })}
                        ${renderSoundSelectControl({ label: '波形', field: 'waveform', value: track.waveform, options: waveOptions, group: 'track' })}
                        ${renderSoundSliderControl({ label: '音轨音量', field: 'volume', value: track.volume, min: 0, max: 0.4, step: 0.005, unit: '', group: 'track' })}
                        ${renderSoundSliderControl({ label: '起始频率', field: 'startFreq', value: track.startFreq, min: 40, max: 2400, step: 1, unit: 'Hz', group: 'track' })}
                        ${renderSoundSliderControl({ label: '结束频率', field: 'endFreq', value: track.endFreq, min: 40, max: 2400, step: 1, unit: 'Hz', group: 'track' })}
                        ${renderSoundSliderControl({ label: '时长', field: 'duration', value: track.duration, min: 0.02, max: 0.5, step: 0.005, unit: 's', group: 'track' })}
                        ${renderSoundSliderControl({ label: '攻击', field: 'attack', value: track.attack, min: 0.001, max: 0.1, step: 0.001, unit: 's', group: 'track' })}
                        ${renderSoundSliderControl({ label: '保持', field: 'hold', value: track.hold, min: 0, max: 0.08, step: 0.001, unit: 's', group: 'track' })}
                        ${renderSoundSliderControl({ label: '释放', field: 'release', value: track.release, min: 0.01, max: 0.25, step: 0.005, unit: 's', group: 'track' })}
                        ${renderSoundSliderControl({ label: '滤波截止', field: 'filterCutoff', value: track.filterCutoff, min: 120, max: 6000, step: 10, unit: 'Hz', group: 'track' })}
                        ${renderSoundSliderControl({ label: '共振', field: 'resonance', value: track.resonance, min: 0.1, max: 12, step: 0.1, unit: '', group: 'track' })}
                        ${renderSoundSliderControl({ label: '失谐', field: 'detune', value: track.detune, min: 0, max: 36, step: 1, unit: 'c', group: 'track' })}
                        ${renderSoundSliderControl({ label: '失真', field: 'distortion', value: track.distortion, min: 0, max: 1, step: 0.01, unit: '', group: 'track' })}
                        ${renderSoundSliderControl({ label: '声像', field: 'pan', value: track.pan, min: -1, max: 1, step: 0.01, unit: '', group: 'track' })}
                        ${renderSoundSliderControl({ label: '每隔几步触发', field: 'stepDiv', value: track.stepDiv, min: 1, max: 8, step: 1, unit: '', group: 'track' })}
                        ${renderSoundSliderControl({ label: '触发偏移', field: 'offset', value: track.offset, min: 0, max: 7, step: 1, unit: '', group: 'track' })}
                    </div>
                </div>
            </div>
        `;
}

export function renderSoundBgmControls({
    bgm,
    bgmKernels = {}
} = {}) {
    return `
            <div class="space-y-4">
                <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                    <div class="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">背景音乐合成</div>
                    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                        ${renderSoundCheckboxControl({ label: '启用 BGM', field: 'enabled', checked: bgm.enabled, group: 'bgm' })}
                        ${renderSoundSelectControl({ label: '和弦卷积核', field: 'kernel', value: bgm.kernel, options: buildBgmKernelOptions(bgmKernels), group: 'bgm' })}
                        ${renderSoundSliderControl({ label: '音量', field: 'volume', value: bgm.volume, min: 0, max: 0.5, step: 0.01, unit: '', group: 'bgm' })}
                        ${renderSoundSliderControl({ label: '速度', field: 'tempo', value: bgm.tempo, min: 50, max: 180, step: 1, unit: ' BPM', group: 'bgm' })}
                        ${renderSoundSliderControl({ label: '根音', field: 'root', value: bgm.root, min: 30, max: 72, step: 1, unit: ' MIDI', group: 'bgm' })}
                        ${renderSoundSliderControl({ label: '亮度', field: 'brightness', value: bgm.brightness, min: 0.15, max: 1, step: 0.01, unit: '', group: 'bgm' })}
                        ${renderSoundSliderControl({ label: '摇摆', field: 'swing', value: bgm.swing, min: 0, max: 0.45, step: 0.01, unit: '', group: 'bgm' })}
                        ${renderSoundSliderControl({ label: '音符长度', field: 'noteLength', value: bgm.noteLength, min: 0.2, max: 1.4, step: 0.01, unit: 'x', group: 'bgm' })}
                        ${renderSoundSliderControl({ label: '起音', field: 'attack', value: bgm.attack, min: 0.001, max: 0.2, step: 0.001, unit: 's', group: 'bgm' })}
                        ${renderSoundSliderControl({ label: '尾音', field: 'release', value: bgm.release, min: 0.05, max: 1.2, step: 0.01, unit: 's', group: 'bgm' })}
                        ${renderSoundSliderControl({ label: '立体声扩散', field: 'stereoSpread', value: bgm.stereoSpread, min: 0, max: 1, step: 0.01, unit: '', group: 'bgm' })}
                        ${renderSoundSliderControl({ label: '人味抖动', field: 'humanize', value: bgm.humanize, min: 0, max: 0.12, step: 0.001, unit: 's', group: 'bgm' })}
                        ${renderSoundSliderControl({ label: 'MIDI 失谐', field: 'detune', value: bgm.detune, min: 0, max: 36, step: 1, unit: 'c', group: 'bgm' })}
                    </div>
                </div>
            </div>
        `;
}

export function renderSoundControlsForDefinition({
    def,
    sound,
    currentTrackIndex = 0,
    waveTypes = [],
    bgmKernels = {}
} = {}) {
    if (def?.type === 'oneshot') {
        return renderSoundOneShotControls({ sound, waveTypes });
    }
    if (def?.type === 'loop') {
        return renderSoundLoopControls({ sound, currentTrackIndex, waveTypes });
    }
    return renderSoundBgmControls({ bgm: sound, bgmKernels });
}

export function applySoundEditorControls({
    controlsEl,
    def,
    sound,
    currentTrackIndex = 0,
    waveTypes = [],
    bgmKernels = {}
} = {}) {
    if (!controlsEl) return '';

    const markup = renderSoundControlsForDefinition({
        def,
        sound,
        currentTrackIndex,
        waveTypes,
        bgmKernels
    });
    controlsEl.innerHTML = markup;
    return markup;
}
