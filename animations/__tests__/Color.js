jest.mock('../../Canvas.js');
const mockCanvas = require('../../Canvas.js');

const Animation = require('../Animation.js');
const Color = require('../Color.js');

test('Be instance of Animation', () => {
	const c = new Color();
	expect(c).toBeInstanceOf(Animation);
});

test('Setup color', () => {
	const color = [1, 2, 3];
	const c = new Color(color);
	expect(c).toBeDefined();
	expect(mockCanvas.mock.calls[0][0].defaultColor).toBe(color);
});

test('Setup default color', () => {
	const c = new Color();
	expect(c).toBeDefined();
	expect(mockCanvas.mock.calls[0][0].defaultColor).toMatchObject([0, 0, 0]);
});

test('Set prio to 0 by default', () => {
	const c = new Color();
	expect(c.prio).toBe(0);
});

test('Return canvas', () => {
	const c = new Color();
	expect(c.getFrame()).toMatchObject({
		canvas: mockCanvas.mock.instances[0],
		duration: 100,
		lastFrame: true
	});
});

test('Set new color', () => {
	const color = [1, 2, 3];
	const c = new Color();
	c.setColor(color);
	expect(mockCanvas.mock.instances[0].defaultColor).toBe(color);
});
