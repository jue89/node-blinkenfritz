jest.mock('spi-node');
const mockSpi = require('spi-node');

const Display = require('../Display.js');
const FritzWS2801 = require('../FritzWS2801.js');

const nextLoop = () => new Promise((resolve) => setImmediate(resolve));

const hOffsets = [
	[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0],
	[5, 1], [4, 1], [3, 1], [2, 1], [1, 1], [0, 1],
	[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
	[5, 3], [4, 3], [3, 3], [2, 3], [1, 3], [0, 3]
];

const vOffsets = [
	[0, 0], [0, -1], [0, -2], [0, -3], [0, -4], [0, -5],
	[1, -5], [1, -4], [1, -3], [1, -2], [1, -1], [1, 0],
	[2, 0], [2, -1], [2, -2], [2, -3], [2, -4], [2, -5],
	[3, -5], [3, -4], [3, -3], [3, -2], [3, -1], [3, 0]
];

test('Be instance of Display', () => {
	const d = new FritzWS2801();
	expect(d).toBeInstanceOf(Display);
});

test('Open SPI device', () => {
	const path = 'abc';
	const d = new FritzWS2801({path});
	expect(d.spi).toBeInstanceOf(mockSpi.SPI);
	expect(mockSpi.SPI.fromDevicePath.mock.calls[0][0]).toMatch(path);
	expect(mockSpi.SPI.mock.instances[0].setSpeed.mock.calls[0][0]).toBe(500000);
});

test('Add horizontal box', () => {
	const d = new FritzWS2801();
	expect(d.addPanel([0, 0], 'h')).toBe(d);
	expect(d.leds).toMatchObject(hOffsets);
});

test('Add horizontal box with offset', () => {
	const d = new FritzWS2801();
	d.addPanel([6, 4], 'h');
	expect(d.leds).toMatchObject(hOffsets.map((p) => [p[0] + 6, p[1] + 4]));
});

test('Add vertical box', () => {
	const d = new FritzWS2801();
	d.addPanel([0, 0], 'v');
	expect(d.leds).toMatchObject(vOffsets);
});

test('Add vertical box with offset', () => {
	const d = new FritzWS2801();
	d.addPanel([6, 4], 'v');
	expect(d.leds).toMatchObject(vOffsets.map((p) => [p[0] + 6, p[1] + 4]));
});

test('Draw pixel', () => {
	const d = new FritzWS2801();
	d.leds = [[0, 1], [2, 4], [8, 16]];
	const getPixel = jest.fn((p) => [p[0], p[1], p[0] + p[1]]);
	d.draw({getPixel});
	expect(getPixel.mock.calls[0][0]).toMatchObject([0, 1]);
	expect(getPixel.mock.calls[1][0]).toMatchObject([2, 4]);
	expect(getPixel.mock.calls[2][0]).toMatchObject([8, 16]);
	expect(mockSpi.SPI.mock.instances[0].write.mock.calls[0][0].toString('hex')).toMatch(Buffer.from([
		0, 1, 1,
		2, 4, 6,
		8, 16, 24
	]).toString('hex'));
});

test('Block SPI if another transfer is ongoing', async () => {
	const d = new FritzWS2801();
	d.leds = [[0, 1], [2, 4], [8, 16]];
	const getPixel = jest.fn((p) => [p[0], p[1], p[0] + p[1]]);
	d.draw({getPixel});
	expect(mockSpi.SPI.mock.instances[0].write.mock.calls.length).toBe(1);
	d.draw({getPixel});
	expect(mockSpi.SPI.mock.instances[0].write.mock.calls.length).toBe(1);
	await nextLoop();
	d.draw({getPixel});
	expect(mockSpi.SPI.mock.instances[0].write.mock.calls.length).toBe(2);
});
