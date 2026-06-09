import assert from 'node:assert/strict';
import {
    DEFAULT_LOADING_PROGRESS,
    GENERATION_LOADING_DELAY_MS,
    buildLoadingOverlaySnapshot,
    clampLoadingProgress,
    shouldRevealGenerationLoading
} from '../src/view/loading-overlay.mjs';

assert.equal(
    DEFAULT_LOADING_PROGRESS,
    0.04,
    'loading overlay should keep the existing minimum visible progress'
);

assert.equal(
    GENERATION_LOADING_DELAY_MS,
    3000,
    'generation overlay should keep the existing delayed reveal timing'
);

assert.equal(
    clampLoadingProgress(-1),
    0.04,
    'loading progress should clamp below the default minimum'
);

assert.equal(
    clampLoadingProgress(0.72),
    0.72,
    'loading progress should preserve in-range values'
);

assert.equal(
    clampLoadingProgress(4),
    1,
    'loading progress should clamp values above one'
);

assert.equal(
    clampLoadingProgress(Number.NaN),
    0.04,
    'loading progress should fall back for invalid numeric values'
);

assert.deepEqual(
    buildLoadingOverlaySnapshot({
        title: 'Generating',
        detail: 'Carving paths',
        progress: 0.5,
        stage: 'Maze'
    }),
    {
        title: 'Generating',
        detail: 'Carving paths',
        progress: 0.5,
        stage: 'Maze'
    },
    'loading overlay snapshot should preserve caller text and progress'
);

assert.deepEqual(
    buildLoadingOverlaySnapshot({ progress: -0.2 }),
    {
        title: undefined,
        detail: undefined,
        progress: 0.04,
        stage: undefined
    },
    'loading overlay snapshot should clamp progress without inventing text'
);

assert.equal(
    shouldRevealGenerationLoading({ phase: 'GENERATING', selfTestActive: false }),
    true,
    'generation overlay should reveal only while generation is active'
);

assert.equal(
    shouldRevealGenerationLoading({ phase: 'EXPLORING', selfTestActive: false }),
    false,
    'generation overlay should stay hidden outside generation'
);

assert.equal(
    shouldRevealGenerationLoading({ phase: 'GENERATING', selfTestActive: true }),
    false,
    'generation overlay should stay hidden during self-test mode'
);

console.log('loading-overlay checks passed');
