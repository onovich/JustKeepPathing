import assert from 'node:assert/strict';
import { Easing, TweenManager } from '../src/view/tween-manager.mjs';

const near = (actual, expected, message) => {
    assert.equal(Math.abs(actual - expected) < 0.000001, true, message || `${actual} ~= ${expected}`);
};

assert.equal(Easing.linear(0.4), 0.4);
near(Easing.easeOutQuad(0.5), 0.75);
near(Easing.easeOutBack(1), 1);
near(Easing.easeOutBounce(0), 0);
near(Easing.easeOutBounce(1), 1);
assert.equal(Easing.easeOutElastic(0), 0);
assert.equal(Easing.easeOutElastic(1), 1);

{
    const target = { x: 0, y: 10 };
    const tweens = new TweenManager();
    tweens.add(target, { x: 10, y: 20 }, 2, Easing.linear);
    assert.equal(tweens.tweens.length, 1);
    tweens.update(1);
    assert.deepEqual(target, { x: 5, y: 15 });
    assert.equal(tweens.tweens.length, 1);
    tweens.update(1);
    assert.deepEqual(target, { x: 10, y: 20 });
    assert.equal(tweens.tweens.length, 0);
}

{
    const target = { scale: 1 };
    const tweens = new TweenManager();
    let completed = false;
    tweens.add(target, { scale: 3 }, 1, Easing.easeOutQuad, () => {
        completed = true;
    });
    tweens.update(2);
    assert.equal(target.scale, 3);
    assert.equal(completed, true);
    assert.equal(tweens.tweens.length, 0);
}

{
    const target = { x: 2 };
    const tweens = new TweenManager();
    tweens.add(target, { x: 8 }, 2);
    tweens.update(1);
    assert.equal(target.x, 5, 'default easing should be linear');
}

console.log('tween-manager checks passed');
