import assert from 'node:assert/strict';
import {
    calculateEffectiveSoundVolume,
    clampAudioValue,
    createSoundDistortionCurve,
    midiToFrequency
} from '../src/logic/sound-audio-utils.mjs';

function expectClose(actual, expected, message) {
    assert.equal(Number(actual.toFixed(6)), Number(expected.toFixed(6)), message);
}

assert.equal(clampAudioValue(-2, 0, 1), 0, 'audio clamp should cap low values');
assert.equal(clampAudioValue(2, 0, 1), 1, 'audio clamp should cap high values');
assert.equal(clampAudioValue(0.42, 0, 1), 0.42, 'audio clamp should preserve in-range values');

expectClose(calculateEffectiveSoundVolume(0.9, 3.8), 3.522396, 'effective volume should preserve the previous gain curve');
assert.equal(calculateEffectiveSoundVolume(4, 3.8), 4.8, 'effective volume should clamp to the maximum output gain');
assert.equal(calculateEffectiveSoundVolume(0, 3.8), 0, 'zero master volume should stay silent');

assert.equal(midiToFrequency(69), 440, 'A4 should be 440Hz');
expectClose(midiToFrequency(57), 220, 'A3 should be 220Hz');
expectClose(midiToFrequency(81), 880, 'A5 should be 880Hz');

{
    const curve = createSoundDistortionCurve(0.1, 8);
    assert.equal(curve.length, 8, 'distortion curve should use the requested sample count');
    assert.ok(curve[0] < 0, 'distortion curve should start below zero');
    assert.ok(Math.abs(curve[4]) < 0.000001, 'distortion curve midpoint should be near zero');
    assert.ok(curve[7] > 0, 'distortion curve should end above zero');
}

{
    const neutral = createSoundDistortionCurve(-1, 4);
    assert.ok(neutral[0] < 0 && neutral[3] > 0, 'negative distortion amounts should be treated as neutral');
}

console.log('sound-audio-utils checks passed');
