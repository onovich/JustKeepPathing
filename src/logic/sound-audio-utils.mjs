export function clampAudioValue(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export const SOUND_PLAYBACK_SPEED_MIN = 0.55;
export const SOUND_PLAYBACK_SPEED_MAX = 2.4;

export function clampSoundPlaybackSpeed(speed) {
    return clampAudioValue(speed, SOUND_PLAYBACK_SPEED_MIN, SOUND_PLAYBACK_SPEED_MAX);
}

export function calculateEffectiveSoundVolume(volume, outputGainBoost = 3.8) {
    return clampAudioValue(Math.pow(volume, 0.72) * outputGainBoost, 0, 4.8);
}

export function calculateFootstepBaseInterval({
    tempo,
    stepBeats,
    stride,
    speed
}) {
    const speedFactor = clampSoundPlaybackSpeed(speed || 1);
    return (60 / tempo) * stepBeats / (stride * speedFactor);
}

export function calculateFootstepSwingOffset({
    stepIndex,
    baseInterval,
    swing
}) {
    return stepIndex % 2 === 0 ? 0 : baseInterval * swing * 0.5;
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
