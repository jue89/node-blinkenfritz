jest.mock('fs');
const mockFs = require('fs');

const path = require('path');
const fs = jest.requireActual('fs');
const blmFile = fs.readFileSync(path.join(__dirname, 'BLM.data.blm'));

const Animation = require('../Animation.js');
const BLM = require('../BLM.js');

test('Be instance of Animation', () => {
	const c = new BLM();
	expect(c).toBeInstanceOf(Animation);
});

test('Set default color', () => {
	const c = new BLM();
	expect(c.color).toMatchObject([255, 0, 128]);
});

test('Load file', () => {
	const filePath = 'abc';
	const data = blmFile.toString();
	mockFs.readFile.mockImplementation(() => {});
	const c = new BLM({filePath});
	c._parse = c.parse;
	c.parse = jest.fn((data) => c._parse(data));
	expect(mockFs.readFile.mock.calls[0][0]).toEqual(filePath);
	expect(c.prio).toBe(-1);
	mockFs.readFile.mock.calls[0][1](null, blmFile);
	expect(c.prio).toBe(0);
	expect(c.parse.mock.calls[0][0]).toEqual(data);
});

test('Load data', () => {
	const data = blmFile.toString();
	const c = new BLM({data});
	expect(c.prio).toBe(0);
	expect(c.curFrame).toBe(0);
	expect(c.frames.length).toBe(74);
	expect(c.frames[72].duration).toBe(100);
	expect(c.frames[72].lastFrame).toBe(false);
	expect(c.frames[73].duration).toBe(2250);
	expect(c.frames[73].lastFrame).toBe(true);
});

test('Use stored color', () => {
	const color = [255, 0, 0];
	const data = blmFile.toString();
	const c = new BLM({color, data});
	expect(c.color).toBe(color);
	expect(c.frames[0].canvas.p[53]).toBe(color);
});

test('Set offset', () => {
	const data = blmFile.toString();
	const offsetX = 12;
	const offsetY = 34;
	const c = new BLM({data, offsetX, offsetY});
	expect(c.frames[0].canvas.offsetX).toBe(offsetX);
	expect(c.frames[0].canvas.offsetY).toBe(offsetY);
});

test('Return current frame', () => {
	const data = blmFile.toString();
	const c = new BLM({data});
	expect(c.getFrame()).toBe(c.frames[0]);
	expect(c.getFrame()).toBe(c.frames[1]);
});

test('Set curFrame back to 0', () => {
	const data = blmFile.toString();
	const c = new BLM({data});
	c.curFrame = 73;
	expect(c.getFrame()).toBe(c.frames[73]);
	expect(c.getFrame()).toBe(c.frames[0]);
});
