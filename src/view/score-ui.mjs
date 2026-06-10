export const SCORE_TEXT_COLOR = '#facc15';
export const SCORE_PULSE_COLOR = '#ffffff';
export const SCORE_TEXT_TRANSFORM = 'scale(1)';
export const SCORE_PULSE_TRANSFORM = 'scale(1.2)';

export function formatScoreText(score = 0) {
    return String(Math.floor(Number(score) || 0));
}

export function applyScoreText(documentRef, score = 0) {
    const el = documentRef?.getElementById?.('ui-score') || null;
    if (!el) return null;
    el.innerText = formatScoreText(score);
    return el;
}

export function pulseScoreDisplay(
    documentRef,
    {
        score = 0,
        resetDelay = 150,
        setTimeoutRef = setTimeout
    } = {}
) {
    const el = applyScoreText(documentRef, score);
    if (!el) return null;

    el.style.transform = SCORE_PULSE_TRANSFORM;
    el.style.color = SCORE_PULSE_COLOR;
    setTimeoutRef(() => {
        applyScoreText(documentRef, score);
        el.style.transform = SCORE_TEXT_TRANSFORM;
        el.style.color = SCORE_TEXT_COLOR;
    }, resetDelay);

    return el;
}
