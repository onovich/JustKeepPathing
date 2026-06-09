export const DEFAULT_LOADING_PROGRESS = 0.04;
export const GENERATION_LOADING_DELAY_MS = 3000;

export function clampLoadingProgress(progress, minimum = DEFAULT_LOADING_PROGRESS) {
    return Math.max(minimum, Math.min(1, Number.isFinite(progress) ? progress : minimum));
}

export function buildLoadingOverlaySnapshot({
    title,
    detail,
    progress = DEFAULT_LOADING_PROGRESS,
    stage
} = {}) {
    return {
        title,
        detail,
        progress: clampLoadingProgress(progress),
        stage
    };
}

export function shouldRevealGenerationLoading({ phase, selfTestActive = false } = {}) {
    return phase === 'GENERATING' && !selfTestActive;
}

export class LoadingOverlay {
    constructor() {
        this.root = document.getElementById('app-loading-overlay');
        this.titleEl = document.getElementById('app-loading-title');
        this.detailEl = document.getElementById('app-loading-detail');
        this.barEl = document.getElementById('app-loading-bar');
        this.percentEl = document.getElementById('app-loading-percent');
        this.stageEl = document.getElementById('app-loading-stage');
        this.hideTimer = null;
    }

    show({
        title = '正在生成迷宫',
        detail = '请稍等，正在准备本层布局与事件。',
        progress = 0.04,
        stage = '准备中'
    } = {}) {
        if (!this.root) return;
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
        const clamped = clampLoadingProgress(progress);
        this.root.classList.remove('hidden-overlay');
        if (this.titleEl) this.titleEl.innerText = title;
        if (this.detailEl) this.detailEl.innerText = detail;
        if (this.stageEl) this.stageEl.innerText = stage;
        if (this.barEl) this.barEl.style.width = `${Math.round(clamped * 100)}%`;
        if (this.percentEl) this.percentEl.innerText = `${Math.round(clamped * 100)}%`;
    }

    hide(delayMs = 180) {
        if (!this.root) return;
        if (this.hideTimer) clearTimeout(this.hideTimer);
        this.hideTimer = setTimeout(() => {
            this.root.classList.add('hidden-overlay');
            this.hideTimer = null;
        }, Math.max(0, delayMs));
    }
}
