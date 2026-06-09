import assert from 'node:assert/strict';
import {
    buildBgmStepPlan,
    calculateBgmHumanizeOffset,
    calculateBgmNoteDuration,
    calculateBgmStepDuration,
    calculateBgmSwingOffset,
    calculateEffectiveSoundVolume,
    calculateFootstepBaseInterval,
    calculateFootstepSwingOffset,
    clampAudioValue,
    clampSoundPlaybackSpeed,
    createSoundDistortionCurve,
    midiToFrequency
} from '../src/logic/sound-audio-utils.mjs';

function expectClose(actual, expected, message) {
    assert.equal(Number(actual.toFixed(6)), Number(expected.toFixed(6)), message);
}

assert.equal(clampAudioValue(-2, 0, 1), 0, 'audio clamp should cap low values');
assert.equal(clampAudioValue(2, 0, 1), 1, 'audio clamp should cap high values');
assert.equal(clampAudioValue(0.42, 0, 1), 0.42, 'audio clamp should preserve in-range values');

assert.equal(clampSoundPlaybackSpeed(0.2), 0.55, 'playback speed should keep the previous minimum');
assert.equal(clampSoundPlaybackSpeed(3), 2.4, 'playback speed should keep the previous maximum');
assert.equal(clampSoundPlaybackSpeed(1.25), 1.25, 'playback speed should preserve in-range values');

expectClose(calculateEffectiveSoundVolume(0.9, 3.8), 3.522396, 'effective volume should preserve the previous gain curve');
assert.equal(calculateEffectiveSoundVolume(4, 3.8), 4.8, 'effective volume should clamp to the maximum output gain');
assert.equal(calculateEffectiveSoundVolume(0, 3.8), 0, 'zero master volume should stay silent');

expectClose(
    calculateFootstepBaseInterval({ tempo: 120, stepBeats: 0.5, stride: 1, speed: 1 }),
    0.25,
    'footstep base interval should preserve the tempo and step beat formula'
);
expectClose(
    calculateFootstepBaseInterval({ tempo: 120, stepBeats: 0.5, stride: 1, speed: 2 }),
    0.125,
    'footstep base interval should scale with playback speed'
);
expectClose(
    calculateFootstepBaseInterval({ tempo: 120, stepBeats: 0.5, stride: 1, speed: 0 }),
    0.25,
    'missing footstep speed should fall back to neutral speed'
);
assert.equal(
    calculateFootstepSwingOffset({ stepIndex: 2, baseInterval: 0.25, swing: 0.4 }),
    0,
    'even footstep indices should not add swing'
);
expectClose(
    calculateFootstepSwingOffset({ stepIndex: 3, baseInterval: 0.25, swing: 0.4 }),
    0.05,
    'odd footstep indices should add the previous swing offset'
);

expectClose(calculateBgmStepDuration(120), 0.25, 'BGM step duration should preserve the eighth-note timing formula');
expectClose(
    calculateBgmNoteDuration({ stepDuration: 0.25, noteLength: 0.8 }),
    0.2,
    'BGM note duration should scale by note length'
);
assert.equal(
    calculateBgmNoteDuration({ stepDuration: 0.25, noteLength: 0.1 }),
    0.08,
    'BGM note duration should keep the minimum voice length'
);
assert.equal(
    calculateBgmSwingOffset({ stepIndex: 2, stepDuration: 0.25, swing: 0.4 }),
    0,
    'even BGM step indices should not add swing'
);
expectClose(
    calculateBgmSwingOffset({ stepIndex: 3, stepDuration: 0.25, swing: 0.4 }),
    0.045,
    'odd BGM step indices should add the previous swing offset'
);
expectClose(calculateBgmHumanizeOffset(0, 0.12), -0.12, 'minimum random value should humanize early');
expectClose(calculateBgmHumanizeOffset(0.5, 0.12), 0, 'center random value should not humanize');
expectClose(calculateBgmHumanizeOffset(1, 0.12), 0.12, 'maximum random value should humanize late');

{
    const kernel = {
        progression: [
            [0, 4, 7],
            [5, 9, 12]
        ],
        melody: [0, 2, 4]
    };
    const firstStep = buildBgmStepPlan({
        kernel,
        root: 48,
        stepIndex: 0,
        stepDuration: 0.25,
        noteLength: 0.8,
        brightness: 0.5,
        stereoSpread: 0.75
    });
    assert.equal(firstStep.chordIndex, 0, 'first BGM step should use the first chord');
    assert.equal(firstStep.melodyNote, 48, 'BGM melody note should add the root');
    assert.equal(firstStep.chordNote, 60, 'BGM downbeat chord note should keep the octave lift');
    expectClose(firstStep.duration, 0.2, 'BGM step plan should include the note duration');
    assert.equal(firstStep.brightnessCutoff, 2900, 'BGM step plan should include brightness cutoff');
    assert.equal(firstStep.pan, 0, 'BGM first step should be centered');

    const secondChordStep = buildBgmStepPlan({
        kernel,
        root: 48,
        stepIndex: 9,
        stepDuration: 0.25,
        noteLength: 0.8,
        brightness: 0.5,
        stereoSpread: 0.75
    });
    assert.equal(secondChordStep.chordIndex, 1, 'BGM step plan should advance chords every eight steps');
    assert.equal(secondChordStep.melodyNote, 48, 'BGM melody should wrap through the kernel melody');
    assert.equal(secondChordStep.chordNote, 53, 'BGM chord note should wrap through the current chord');
    expectClose(secondChordStep.pan, Math.sin(9 * 0.8) * 0.75, 'BGM pan should preserve the previous sine spread');
}

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
