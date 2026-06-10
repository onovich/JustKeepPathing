export const Easing = {
    linear: (t) => t,
    easeOutQuad: (t) => t * (2 - t),
    easeOutBack: (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    easeOutBounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        if (t < 2 / d1) { t -= 1.5 / d1; return n1 * t * t + 0.75; }
        if (t < 2.5 / d1) { t -= 2.25 / d1; return n1 * t * t + 0.9375; }
        t -= 2.625 / d1;
        return n1 * t * t + 0.984375;
    },
    easeOutElastic: (t) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }
};

export class TweenManager {
    constructor() {
        this.tweens = [];
    }

    add(obj, props, duration, easing = Easing.linear, onComplete = null) {
        const startProps = {};
        for (const key in props) startProps[key] = obj[key];
        this.tweens.push({ obj, startProps, targetProps: props, duration, time: 0, easing, onComplete });
    }

    update(dt) {
        for (let i = this.tweens.length - 1; i >= 0; i--) {
            const tween = this.tweens[i];
            tween.time += dt;
            const progress = Math.min(tween.time / tween.duration, 1);
            const eased = tween.easing(progress);
            for (const key in tween.targetProps) {
                tween.obj[key] = tween.startProps[key] + (tween.targetProps[key] - tween.startProps[key]) * eased;
            }
            if (progress === 1) {
                if (tween.onComplete) tween.onComplete();
                this.tweens.splice(i, 1);
            }
        }
    }
}
