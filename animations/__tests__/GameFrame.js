const path = require('path');

const Animation = require('../Animation.js');
const GameFrame = require('../GameFrame.js');

test('Be instance of Animation', () => {
	const g = new GameFrame();
	expect(g).toBeInstanceOf(Animation);
});

test('Read single image', async () => {
	const loopDuration = 1234;
	Date.now = jest.fn(() => 0);
	const g = new GameFrame({
		dir: path.join(__dirname, 'GameFrame.data.simple'),
		loopDuration
	});
	expect(g.prio).toBe(-1);
	await new Promise((resolve) => g.once('prio', () => resolve()));
	expect(g.prio).toBe(0);
	Date.now.mockReturnValue(0);
	const frame = g.getFrame();
	expect(frame.duration).toBe(200);
	expect(frame.lastFrame).toBe(false);
	expect(frame.canvas.getPixel([10, 12])).toMatchObject([240, 90, 35]);
	expect(frame.canvas.getPixel([10, 2])).toMatchObject([113, 197, 207]);
	Date.now.mockReturnValue(loopDuration - 1);
	expect(g.getFrame().lastFrame).toBe(false);
	Date.now.mockReturnValue(loopDuration);
	expect(g.getFrame().lastFrame).toBe(true);
});

test('Emit error if 0.bmp cannot be read', async () => {
	const dir = path.join(__dirname, 'GameFrame.data.invalid');
	const g = new GameFrame({dir});
	const err = await new Promise((resolve) => g.once('error', resolve));
	expect(err.message).toEqual(`Missing file: ${dir}/0.bmp`);
});

test('Read multiple images', async () => {
	const g = new GameFrame({dir: path.join(__dirname, 'GameFrame.data.multiimg')});
	await new Promise((resolve) => g.once('prio', () => resolve()));
	const firstFrame = g.getFrame();
	expect(firstFrame.duration).toBe(150);
	expect(firstFrame.canvas.getPixel([5, 13])).toMatchObject([251, 186, 17]);
	expect(g.getFrame().canvas.getPixel([5, 13])).toMatchObject([0, 0, 0]);
	expect(g.getFrame().canvas.getPixel([5, 13])).toMatchObject([113, 197, 207]);
	expect(g.getFrame().canvas.getPixel([5, 13])).toMatchObject([113, 197, 207]);
	expect(g.getFrame().canvas.getPixel([5, 13])).toMatchObject([0, 0, 0]);
	expect(g.getFrame().canvas.getPixel([5, 13])).toMatchObject([251, 186, 17]);
	const lastFrame = g.getFrame();
	expect(lastFrame).toBe(firstFrame);
});

test('Read moving images y', async () => {
	const g = new GameFrame({dir: path.join(__dirname, 'GameFrame.data.moveimgy')});
	await new Promise((resolve) => g.once('prio', () => resolve()));
	expect(g.frames.length).toBe(4);
});

test('Read moving images x', async () => {
	Date.now = () => 0;
	const g = new GameFrame({dir: path.join(__dirname, 'GameFrame.data.moveimgx')});
	await new Promise((resolve) => g.once('prio', () => resolve()));
	expect(g.frames.length).toBe(28);
	for (let i = 0; i < 27; i++) expect(g.getFrame().lastFrame).toBe(false);
	expect(g.getFrame().lastFrame).toBe(true);
});
