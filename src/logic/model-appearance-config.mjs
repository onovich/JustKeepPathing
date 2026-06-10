import {
    MODEL_EDITOR_DEFAULT_CONFIG,
    MODEL_EDITOR_DEFAULT_FACE_PATTERN,
    MODEL_EDITOR_DEFAULT_LINE_STYLE,
    MODEL_EDITOR_FACE_PATTERN_KEYS
} from '../data/game-config.mjs';

export function normalizeColorHex(value, fallback = '#ffffff') {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return `#${value.toString(16).padStart(6, '0').slice(-6)}`;
    }
    if (value && typeof value.getHexString === 'function') {
        return `#${value.getHexString()}`;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toLowerCase();
        if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed.toLowerCase()}`;
    }
    return fallback.toLowerCase();
}

export function clampAppearanceValue(value, min, max, fallback) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.min(max, Math.max(min, numeric));
}

export function sanitizeAppearanceConfig(rawConfig) {
    const clean = { version: 1, assets: {} };
    if (!rawConfig || typeof rawConfig !== 'object' || !rawConfig.assets || typeof rawConfig.assets !== 'object') {
        return clean;
    }

    for (const [assetKey, parts] of Object.entries(rawConfig.assets)) {
        if (!parts || typeof parts !== 'object') continue;
        const cleanParts = {};

        for (const [partKey, partConfig] of Object.entries(parts)) {
            if (!partConfig || typeof partConfig !== 'object') continue;
            const faces = {};
            const lines = {};

            if (partConfig.faces && typeof partConfig.faces === 'object') {
                for (const [index, faceValue] of Object.entries(partConfig.faces)) {
                    if (Number.isNaN(Number(index))) continue;
                    if (typeof faceValue === 'string' || typeof faceValue === 'number') {
                        faces[index] = { color: normalizeColorHex(faceValue) };
                        continue;
                    }
                    if (!faceValue || typeof faceValue !== 'object') continue;
                    faces[index] = sanitizeFaceAppearanceEntry(faceValue);
                }
            }
            if (partConfig.lines && typeof partConfig.lines === 'object') {
                for (const [index, lineValue] of Object.entries(partConfig.lines)) {
                    if (Number.isNaN(Number(index))) continue;
                    if (typeof lineValue === 'string' || typeof lineValue === 'number') {
                        lines[index] = { color: normalizeColorHex(lineValue) };
                        continue;
                    }
                    if (!lineValue || typeof lineValue !== 'object') continue;
                    lines[index] = sanitizeLineAppearanceEntry(lineValue);
                }
            }

            if (Object.keys(faces).length > 0 || Object.keys(lines).length > 0) {
                cleanParts[partKey] = { faces, lines };
            }
        }

        if (Object.keys(cleanParts).length > 0) clean.assets[assetKey] = cleanParts;
    }

    return clean;
}

export function cloneAppearanceConfig(config = MODEL_EDITOR_DEFAULT_CONFIG) {
    return sanitizeAppearanceConfig(JSON.parse(JSON.stringify(config)));
}

export function getAppearancePart(config, assetKey, partKey, createIfMissing = false) {
    if (!config.assets[assetKey]) {
        if (!createIfMissing) return null;
        config.assets[assetKey] = {};
    }
    if (!config.assets[assetKey][partKey]) {
        if (!createIfMissing) return null;
        config.assets[assetKey][partKey] = { faces: {}, lines: {} };
    }
    return config.assets[assetKey][partKey];
}

export function sanitizeFaceAppearanceEntry(raw = {}, defaultColor = '#ffffff') {
    const patternScale = Number(raw.patternScale);
    return {
        color: normalizeColorHex(raw.color, defaultColor),
        pattern: MODEL_EDITOR_FACE_PATTERN_KEYS.includes(raw.pattern) ? raw.pattern : MODEL_EDITOR_DEFAULT_FACE_PATTERN.pattern,
        patternColor: normalizeColorHex(raw.patternColor, MODEL_EDITOR_DEFAULT_FACE_PATTERN.patternColor),
        patternScale: Number.isFinite(patternScale)
            ? clampAppearanceValue(patternScale, 2, 24, MODEL_EDITOR_DEFAULT_FACE_PATTERN.patternScale)
            : MODEL_EDITOR_DEFAULT_FACE_PATTERN.patternScale
    };
}

export function sanitizeLineAppearanceEntry(raw = {}, defaultColor = '#ffffff') {
    const width = Number(raw.width);
    return {
        color: normalizeColorHex(raw.color, defaultColor),
        style: raw.style === 'dashed' ? 'dashed' : MODEL_EDITOR_DEFAULT_LINE_STYLE.style,
        width: Number.isFinite(width)
            ? clampAppearanceValue(width, 1, 6, MODEL_EDITOR_DEFAULT_LINE_STYLE.width)
            : MODEL_EDITOR_DEFAULT_LINE_STYLE.width
    };
}

export function getFaceAppearanceEntry(part, faceIndex, defaultColor) {
    return sanitizeFaceAppearanceEntry(part?.faces?.[faceIndex] || {}, defaultColor);
}

export function getLineAppearanceEntry(part, lineIndex, defaultColor) {
    return sanitizeLineAppearanceEntry(part?.lines?.[lineIndex] || {}, defaultColor);
}

export function isDefaultFaceAppearance(entry = {}, defaultColor) {
    return entry.color === defaultColor
        && entry.pattern === MODEL_EDITOR_DEFAULT_FACE_PATTERN.pattern
        && entry.patternColor === MODEL_EDITOR_DEFAULT_FACE_PATTERN.patternColor
        && Math.abs(entry.patternScale - MODEL_EDITOR_DEFAULT_FACE_PATTERN.patternScale) < 0.001;
}

export function isDefaultLineAppearance(entry = {}, defaultColor) {
    return entry.color === defaultColor
        && entry.style === MODEL_EDITOR_DEFAULT_LINE_STYLE.style
        && Math.abs(entry.width - MODEL_EDITOR_DEFAULT_LINE_STYLE.width) < 0.001;
}

export function cleanupAppearancePart(config, assetKey, partKey) {
    const parts = config.assets[assetKey];
    const part = parts?.[partKey];
    if (!part) return;
    if (Object.keys(part.faces || {}).length === 0 && Object.keys(part.lines || {}).length === 0) delete parts[partKey];
    if (parts && Object.keys(parts).length === 0) delete config.assets[assetKey];
}

export function writeAppearanceSelectionEntry(config, item, nextEntry) {
    const part = getAppearancePart(config, item.assetKey, item.partKey, true);
    if (item.kind === 'mesh') {
        if (isDefaultFaceAppearance(nextEntry, item.defaultColor)) delete part.faces[item.index];
        else part.faces[item.index] = { ...nextEntry };
    } else {
        if (isDefaultLineAppearance(nextEntry, item.defaultColor)) delete part.lines[item.index];
        else part.lines[item.index] = { ...nextEntry };
    }
    cleanupAppearancePart(config, item.assetKey, item.partKey);
}
