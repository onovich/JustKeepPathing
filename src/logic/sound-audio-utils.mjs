export function clampAudioValue(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function calculateEffectiveSoundVolume(volume, outputGainBoost = 3.8) {
    return clampAudioValue(Math.pow(volume, 0.72) * outputGainBoost, 0, 4.8);
}

export function midiToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
}

export function createSoundDistortionCurve(amount = 0, sampleCount = 44100) {
    const k = Math.max(0, amount) * 220;
    const curve = new Float32Array(sampleCount);
    const deg = Math.PI / 180;
    for (let i = 0; i < sampleCount; i++) {
        const x = i * 2 / sampleCount - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
}
