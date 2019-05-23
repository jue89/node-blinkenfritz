const Canvas = require('../Canvas.js');

test('Set defaults', () => {
	const c = new Canvas();
	expect(c.width).toBe(0);
	expect(c.height).toBe(0);
	expect(c.wrapX).toBe(false);
	expect(c.wrapY).toBe(false);
	expect(c.offsetX).toBe(0);
	expect(c.offsetY).toBe(0);
	expect(c.defaultColor).toMatchObject([0, 0, 0]);
});

test('Set opts', () => {
	const width = 123;
	const height = 456;
	const c = new Canvas({width, height});
	expect(c.width).toBe(width);
	expect(c.height).toBe(height);
});

test('Set pixel', () => {
	const width = 2;
	const height = 2;
	const c = new Canvas({width, height});
	const x = 1;
	const y = 1;
	const color = [1, 2, 3];
	c.setPixel([x, y], color);
	expect(c.p[x + y * width]).toBe(color);
});

test('Ignore pixels outside the canvas', () => {
	const width = 2;
	const height = 2;
	const c = new Canvas({width, height});
	c.setPixel([width, 0], [1, 2, 3]);
	c.setPixel([0, height], [1, 2, 3]);
	expect(c.p.length).toBe(0);
});

test('Get stored pixel', () => {
	const width = 2;
	const height = 2;
	const c = new Canvas({width, height});
	const x = 1;
	const y = 1;
	const color = [1, 2, 3];
	c.setPixel([x, y], color);
	expect(c.getPixel([x, y])).toBe(color);
});

test('Get default color for undefined pixel', () => {
	const width = 2;
	const height = 2;
	const defaultColor = [4, 5, 6];
	const c = new Canvas({width, height, defaultColor});
	const x = 1;
	const y = 1;
	expect(c.getPixel([x, y])).toBe(defaultColor);
});

test('Get default color for outside pixel', () => {
	const width = 2;
	const height = 2;
	const defaultColor = [4, 5, 6];
	const c = new Canvas({width, height, defaultColor});
	const color = [1, 2, 3];
	c.setPixel([0, 0], color);
	c.setPixel([0, 1], color);
	c.setPixel([1, 0], color);
	c.setPixel([1, 1], color);
	expect(c.getPixel([width, 0])).toBe(defaultColor);
	expect(c.getPixel([0, height])).toBe(defaultColor);
	expect(c.getPixel([-1, 1])).toBe(defaultColor);
	expect(c.getPixel([1, -1])).toBe(defaultColor);
});

test('Wrap around', () => {
	const width = 2;
	const height = 2;
	const c = new Canvas({width, height, wrapX: true, wrapY: true});
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			c.setPixel([x, y], [0, x, y]);
		}
	}
	expect(c.getPixel([width, 1])).toMatchObject([0, 0, 1]);
	expect(c.getPixel([1, height])).toMatchObject([0, 1, 0]);
});

test('Handle offset', () => {
	const width = 2;
	const height = 2;
	const c = new Canvas({width, height, offsetX: 1, offsetY: 1});
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			c.setPixel([x, y], [42, x, y]);
		}
	}
	expect(c.getPixel([1, 1])).toMatchObject([42, 0, 0]);
});
