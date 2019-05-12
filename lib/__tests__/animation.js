
jest.useFakeTimers();

const Animation = require('../animation.js');

test('Test setPixel()', () => {
	let frames = [
		{ duration: 100, frame: 'content1', what: 'ever' },
		{ duration: 200, frame: 'content2', what: 'ever' },
		{ duration: 100, frame: 'content3', what: 'ever' }
	];

	const renderFrameFun = jest.fn();
	const endFun = jest.fn();

	// useFakeTimers() does not mock the Date.now() fun, so we
	// build our own mock here
	let time = 1000000;
	const dateNowStub = jest.fn(() => time);
	global.Date.now = dateNowStub;
	function advance (t) {
		time += t;
		jest.advanceTimersByTime(t);
	}

	const a = new Animation(frames, renderFrameFun);

	expect(renderFrameFun.mock.calls.length).toBe(0);

	a.play(endFun);

	expect(renderFrameFun.mock.calls.length).toBe(1);
	expect(renderFrameFun.mock.calls[0].length).toBe(1);
	expect(renderFrameFun.mock.calls[0][0]).toEqual(frames[0]);
	expect(endFun.mock.calls.length).toBe(0);

	advance(90);

	expect(renderFrameFun.mock.calls.length).toBe(1);
	expect(endFun.mock.calls.length).toBe(0);

	advance(10);

	expect(renderFrameFun.mock.calls.length).toBe(2);
	expect(renderFrameFun.mock.calls[1].length).toBe(1);
	expect(renderFrameFun.mock.calls[1][0]).toEqual(frames[1]);
	expect(endFun.mock.calls.length).toBe(0);

	advance(200);

	expect(renderFrameFun.mock.calls.length).toBe(3);
	expect(renderFrameFun.mock.calls[2].length).toBe(1);
	expect(renderFrameFun.mock.calls[2][0]).toEqual(frames[2]);
	expect(endFun.mock.calls.length).toBe(0);

	advance(100);

	expect(endFun.mock.calls.length).toBe(1);
});
