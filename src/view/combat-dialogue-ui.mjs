export const COMBAT_DIALOGUE_ELEMENT_ID = 'rpg-dialogue';
export const COMBAT_DIALOGUE_TYPE_DELAY_MS = 24;

function defaultSleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function typeCombatDialogue(documentRef, text = '', {
    sleep = defaultSleep,
    delayMs = COMBAT_DIALOGUE_TYPE_DELAY_MS
} = {}) {
    const el = documentRef?.getElementById(COMBAT_DIALOGUE_ELEMENT_ID);
    if (!el) return null;

    const content = `${text}`;
    el.innerText = '';
    for (let i = 0; i < content.length; i++) {
        el.innerText += content[i];
        await sleep(delayMs);
    }
    return el;
}
