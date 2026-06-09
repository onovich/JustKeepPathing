const STRATEGY_HINT_LABELS = Object.freeze({
    risk: Object.freeze({
        cautious: '\u4f1a\u66f4\u5c11\u7ed5\u9ad8\u98ce\u9669\u5bc6\u5ba4',
        balanced: '\u4f1a\u6309\u6b63\u5e38\u6536\u76ca\u5224\u65ad\u7ed5\u8def',
        greedy: '\u4f1a\u66f4\u613f\u610f\u4e3a\u4e86\u9ad8\u6536\u76ca\u7ed5\u8def'
    }),
    rest: Object.freeze({
        emergency: '\u4f11\u6574\u5bc6\u5ba4\u53ea\u5728\u5371\u9669\u65f6\u4f18\u5148',
        balanced: '\u4f11\u6574\u5bc6\u5ba4\u4fdd\u6301\u6b63\u5e38\u4f18\u5148\u7ea7',
        prefer: '\u4f11\u6574\u5bc6\u5ba4\u4f1a\u66f4\u79ef\u6781\u53bb\u8865\u72b6\u6001'
    }),
    merchant: Object.freeze({
        power: '\u5546\u8d29\u66f4\u504f\u5411\u4e70\u5347\u7ea7',
        supplies: '\u5546\u8d29\u66f4\u504f\u5411\u8865\u5c42\u8865\u7ed9',
        save: '\u5546\u8d29\u4f1a\u66f4\u514b\u5236\u5730\u82b1\u94b1'
    }),
    supply: Object.freeze({
        balanced: '\u6302\u673a\u503e\u5411\u4f1a\u81ea\u52a8\u4fdd\u6301\u5747\u8861',
        combat: '\u6302\u673a\u503e\u5411\u4f1a\u66f4\u504f\u5411\u6218\u6597\u63a8\u8fdb',
        loot: '\u6302\u673a\u503e\u5411\u4f1a\u66f4\u504f\u5411\u8d44\u6e90\u56de\u6536',
        explore: '\u6302\u673a\u503e\u5411\u4f1a\u66f4\u504f\u5411\u5bc6\u5ba4\u63a2\u7d22'
    })
});

export function buildAutoStrategyHint(autoStrategy = {}) {
    const riskLabel = STRATEGY_HINT_LABELS.risk[autoStrategy.risk] || STRATEGY_HINT_LABELS.risk.balanced;
    const restLabel = STRATEGY_HINT_LABELS.rest[autoStrategy.rest] || STRATEGY_HINT_LABELS.rest.balanced;
    const merchantLabel = STRATEGY_HINT_LABELS.merchant[autoStrategy.merchant] || STRATEGY_HINT_LABELS.merchant.power;
    const supplyLabel = STRATEGY_HINT_LABELS.supply[autoStrategy.supply] || STRATEGY_HINT_LABELS.supply.balanced;
    return `${riskLabel}\uff1b${restLabel}\uff1b${merchantLabel}\uff1b${supplyLabel}\u3002`;
}

function getRequiredElement(documentRef, id) {
    const element = documentRef.getElementById(id);
    if (!element) throw new Error(`Missing settings panel element: ${id}`);
    return element;
}

export function initializeSettingsPanel({
    gameState,
    soundEngine,
    documentRef = document
}) {
    const settingsButton = getRequiredElement(documentRef, 'btn-settings');
    const settingsPanel = getRequiredElement(documentRef, 'settings-panel');
    const volumeSlider = getRequiredElement(documentRef, 'slider-volume');
    const volumeValue = getRequiredElement(documentRef, 'val-volume');
    const riskSelect = getRequiredElement(documentRef, 'select-strategy-risk');
    const restSelect = getRequiredElement(documentRef, 'select-strategy-rest');
    const merchantSelect = getRequiredElement(documentRef, 'select-strategy-merchant');
    const supplySelect = getRequiredElement(documentRef, 'select-strategy-supply');
    const strategyHint = getRequiredElement(documentRef, 'settings-strategy-hint');

    const syncVolumeUI = () => {
        const percent = Math.round(soundEngine.volume * 100);
        volumeSlider.value = String(percent);
        volumeValue.innerText = `${percent}%`;
    };

    const syncStrategyUI = () => {
        riskSelect.value = gameState.autoStrategy.risk;
        restSelect.value = gameState.autoStrategy.rest;
        merchantSelect.value = gameState.autoStrategy.merchant;
        supplySelect.value = gameState.autoStrategy.supply;
        strategyHint.innerText = buildAutoStrategyHint(gameState.autoStrategy);
    };

    const updateStrategy = async (patch) => {
        await soundEngine.unlock();
        gameState.setAutoStrategy(patch);
        syncStrategyUI();
        soundEngine.beep({ freq: 420, slideTo: 560, duration: 0.07, volume: 0.03, type: 'triangle' });
    };

    settingsButton.addEventListener('click', async (event) => {
        event.stopPropagation();
        await soundEngine.unlock();
        settingsPanel.classList.toggle('hidden');
    });

    settingsPanel.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    documentRef.addEventListener('click', () => {
        settingsPanel.classList.add('hidden');
    });

    volumeSlider.addEventListener('input', async () => {
        await soundEngine.unlock();
        soundEngine.setVolume(Number(volumeSlider.value) / 100);
        syncVolumeUI();
        soundEngine.beep({ freq: 520, slideTo: 700, duration: 0.08, volume: 0.035, type: 'triangle' });
    });

    riskSelect.addEventListener('change', async () => updateStrategy({ risk: riskSelect.value }));
    restSelect.addEventListener('change', async () => updateStrategy({ rest: restSelect.value }));
    merchantSelect.addEventListener('change', async () => updateStrategy({ merchant: merchantSelect.value }));
    supplySelect.addEventListener('change', async () => updateStrategy({ supply: supplySelect.value }));

    syncVolumeUI();
    syncStrategyUI();

    return {
        syncVolumeUI,
        syncStrategyUI
    };
}
