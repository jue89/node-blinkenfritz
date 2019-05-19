const EventEmitter = require('events').EventEmitter;

jest.useFakeTimers();
afterEach(() => jest.clearAllTimers());

const BlinkenFritz = require('../BlinkenFritz.js');

test('Add display', () => {
	const d = {};
	const b = new BlinkenFritz();
	b.addDisplay(d);
	expect(b.displays.length).toBe(1);
	expect(b.displays[0]).toBe(d);
});

test('Create 3 prio buckets', () => {
	const b = new BlinkenFritz();
	expect(b.animations.length).toBe(3);
	expect(b.animations);
});

test('Add animation to the right bucket', () => {
	const b = new BlinkenFritz();
	const prio = 1;
	const a = new EventEmitter();
	a.prio = prio;
	b.addAnimation(a);
	expect(b.animations[prio][0]).toBe(a);
});

test('Ignore animations with out of bound prio', () => {
	const b = new BlinkenFritz();
	const prio = -1;
	const a = new EventEmitter();
	a.prio = prio;
	b.addAnimation(a);
});

test('Move animation when prio changes', () => {
	const b = new BlinkenFritz();
	const oldPrio = 1;
	const newPrio = 2;
	const a = new EventEmitter();
	a.prio = oldPrio;
	b.addAnimation(a);
	expect(b.animations[oldPrio].length).toBe(1);
	expect(b.animations[newPrio].length).toBe(0);
	a.emit('prio', newPrio, oldPrio);
});

test('Do not interrupt running animation', () => {
	const b = new BlinkenFritz();
	const lowPrio = 1;
	const highPrio = 2;
	const a1 = new EventEmitter();
	a1.prio = lowPrio;
	b.addAnimation(a1);
	const a2 = new EventEmitter();
	a2.prio = lowPrio;
	b.addAnimation(a2);
	b.activeAnimation = a2;
	a1.emit('prio', highPrio, lowPrio, false);
	expect(b.activeAnimation).toBe(a2);
});

test('Interrupt running animation', () => {
	const b = new BlinkenFritz();
	const lowPrio = 1;
	const highPrio = 2;
	const a1 = new EventEmitter();
	a1.prio = lowPrio;
	b.addAnimation(a1);
	const a2 = new EventEmitter();
	a2.prio = lowPrio;
	b.addAnimation(a2);
	b.activeAnimation = a2;
	a1.emit('prio', highPrio, lowPrio, true);
	expect(b.activeAnimation).toBe(a1);
});

test('Do not interrupt running animation due to higher prio', () => {
	const b = new BlinkenFritz();
	const lowPrio = 1;
	const highPrio = 2;
	const a1 = new EventEmitter();
	a1.prio = lowPrio;
	b.addAnimation(a1);
	const a2 = new EventEmitter();
	a2.prio = highPrio;
	b.addAnimation(a2);
	b.activeAnimation = a2;
	a1.emit('prio', highPrio, lowPrio, true);
	expect(b.activeAnimation).toBe(a2);
});

test('Find next active animation by prio', () => {
	Math.random = jest.fn(() => 0.99);
	const b = new BlinkenFritz();
	const frame = {};
	const a1 = {getFrame: jest.fn(() => frame)};
	const a2 = {getFrame: jest.fn(() => frame)};
	b.animations[1].push(a1);
	b.animations[2].push(a2);
	const onAnimation = jest.fn();
	b.on('animation', onAnimation);
	expect(b._prepareNextFrame()).toBe(true);
	expect(b.activeAnimation).toBe(a2);
	expect(b.nextFrame).toBe(frame);
	expect(onAnimation.mock.calls[0][0]).toBe(a2);
});

test('Find next active animation by random', () => {
	Math.random = jest.fn(() => 0);
	const b = new BlinkenFritz();
	const frame = {};
	const a1 = {getFrame: jest.fn(() => frame)};
	const a2 = {getFrame: jest.fn(() => frame)};
	b.animations[2].push(a1);
	b.animations[2].push(a2);
	expect(b._prepareNextFrame()).toBe(true);
	expect(b.activeAnimation).toBe(a1);
	expect(b.nextFrame).toBe(frame);
});

test('Read next frame of the active animation', () => {
	const b = new BlinkenFritz();
	const frame = {};
	const a1 = {getFrame: jest.fn(() => frame)};
	const a2 = {getFrame: jest.fn(() => frame)};
	b.animations[1].push(a1);
	b.animations[2].push(a2);
	b.activeAnimation = a1;
	expect(b._prepareNextFrame()).toBe(true);
	expect(b.activeAnimation).toBe(a1);
	expect(b.nextFrame).toBe(frame);
});

test('Stop everything if no active animation is found', () => {
	const b = new BlinkenFritz();
	expect(b._prepareNextFrame()).toBe(false);
});

test('Prepare first frame if an animation with valid prio is added', () => {
	const now = 1234;
	Date.now = jest.fn(() => now);
	const b = new BlinkenFritz();
	const a = new EventEmitter();
	a.prio = 0;
	const duration = 123;
	const frame = {duration};
	a.getFrame = jest.fn(() => frame);
	b.addAnimation(a);
	expect(b.nextFrame).toBe(frame);
	expect(b.nextFrameAt).toBe(now + duration);
});

test('Do not start if active animation is present', () => {
	const b = new BlinkenFritz();
	const a = new EventEmitter();
	a.prio = 0;
	a.getFrame = jest.fn(() => ({}));
	b.addAnimation(a);
	b.addAnimation(a);
	expect(a.getFrame.mock.calls.length).toBe(2);
});

test('Prepare first frame if an animation changed to valid prio', () => {
	const b = new BlinkenFritz();
	const a = new EventEmitter();
	a.prio = -1;
	const frame = {};
	a.getFrame = jest.fn(() => frame);
	b.addAnimation(a);
	expect(b.nextFrame).toBeUndefined();
	a.emit('prio', 0, a.prio);
	expect(b.nextFrame).toBe(frame);
});

test('Do not start if active animation is present', () => {
	const b = new BlinkenFritz();
	const a = new EventEmitter();
	a.prio = -1;
	a.getFrame = jest.fn(() => ({}));
	b.addAnimation(a);
	a.emit('prio', 0, a.prio);
	a.emit('prio', 1, a.prio);
	expect(a.getFrame.mock.calls.length).toBe(2);
});

test('Display frame', () => {
	const b = new BlinkenFritz();
	const display = {draw: jest.fn()};
	b.displays.push(display);
	const canvas = {};
	const duration = 123;
	const lastFrame = false;
	b.nextFrame = {canvas, duration, lastFrame};
	b.nextFrameAt = 0;
	b.activeAnimation = {};
	b._displayFrame();
	expect(display.draw.mock.calls[0][0]).toBe(canvas);
	expect(b.nextFrameAt).toBe(duration);
	expect(b.activeAnimation).toBeDefined();
});

test('Remove active animation on last frame', () => {
	const b = new BlinkenFritz();
	const canvas = {};
	const duration = 123;
	const lastFrame = true;
	b.nextFrame = {canvas, duration, lastFrame};
	b.activeAnimation = {};
	b._displayFrame();
	expect(b.activeAnimation).toBeUndefined();
});

test('Schedule next frame display', () => {
	const now = 1234;
	const drift = 20;
	Date.now = jest.fn(() => now + drift);
	const b = new BlinkenFritz();
	b.nextFrameAt = now;
	const canvas = {};
	const duration = 100;
	const lastFrame = false;
	b.nextFrame = {canvas, duration, lastFrame};
	b.activeAnimation = {getFrame: jest.fn()};
	b._displayFrame();
	b._displayFrame = jest.fn();
	jest.advanceTimersByTime(duration - drift - 1);
	expect(b._displayFrame.mock.calls.length).toBe(0);
	jest.advanceTimersByTime(1);
	expect(b._displayFrame.mock.calls.length).toBe(1);
});
