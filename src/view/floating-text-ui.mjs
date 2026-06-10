export const FLOATING_TEXT_CLASS = 'floating-text';
export const FLOATING_TEXT_CRITICAL_FONT_SIZE = '24px';

export function createFloatingTextElement(documentRef, {
    text = '',
    color = '',
    critical = false
} = {}) {
    if (!documentRef?.createElement) return null;

    const el = documentRef.createElement('div');
    el.className = FLOATING_TEXT_CLASS;
    el.innerText = `${text}`;
    if (color !== undefined) el.style.color = color;
    if (critical) el.style.fontSize = FLOATING_TEXT_CRITICAL_FONT_SIZE;
    return el;
}

export function appendFloatingTextElement(container, element) {
    if (!container || !element) return null;

    container.appendChild(element);
    return element;
}

export function removeFloatingTextElement(element) {
    if (!element) return null;

    element.remove();
    return element;
}

export function buildFloatingTextFrame({
    x = 0,
    y = 0,
    life = 1
} = {}) {
    const scale = life < 0.2 ? life * 5 : 1;
    return {
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
        opacity: life
    };
}

export function applyFloatingTextFrame(element, frame) {
    if (!element || !frame) return null;

    element.style.transform = frame.transform;
    element.style.opacity = frame.opacity;
    return element;
}
