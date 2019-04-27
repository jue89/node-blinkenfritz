
const Canvas = require('../canvas.js');

test('Test setPixel()', () => {
	const c = new Canvas();

	const myColor = [123, 154, 120];
	c.setPixel([0, 1], myColor);

	expect(c.getPixel([0, 1])).toEqual(myColor);

  // unset pixels should be RGB_BLACK
	expect(c.getPixel([100, 100])).toEqual([0, 0, 0]);
});

test('Test drawLine01()', () => {
	const c = new Canvas();

	const myColor = [123, 154, 120];
	const myColorInv = [1, 2, 3];
	c.color = myColor;
	c.color_inv = myColorInv;

	c.drawLine01('0011011');

	expect(c.getPixel([0, 0])).toEqual(myColorInv);
	expect(c.getPixel([1, 0])).toEqual(myColorInv);
	expect(c.getPixel([2, 0])).toEqual(myColor);
	expect(c.getPixel([3, 0])).toEqual(myColor);
	expect(c.getPixel([4, 0])).toEqual(myColorInv);
	expect(c.getPixel([5, 0])).toEqual(myColor);
	expect(c.getPixel([6, 0])).toEqual(myColor);
	expect(c.getPixel([7, 0])).toEqual([0, 0, 0]);

  // unset pixels should be RGB_BLACK
	expect(c.getPixel([100, 100])).toEqual([0, 0, 0]);
});

test('Test drawBox01()', () => {
	const c = new Canvas();

	const myColor = [123, 154, 120];
	const myColorInv = [1, 2, 3];
	c.color = myColor;
	c.color_inv = myColorInv;

	c.cursor = [0, 3];

	c.drawBox01('0011011\n0100010');

	expect(c.getPixel([0, 3])).toEqual(myColorInv);
	expect(c.getPixel([1, 3])).toEqual(myColorInv);
	expect(c.getPixel([2, 3])).toEqual(myColor);
	expect(c.getPixel([3, 3])).toEqual(myColor);
	expect(c.getPixel([4, 3])).toEqual(myColorInv);
	expect(c.getPixel([5, 3])).toEqual(myColor);
	expect(c.getPixel([6, 3])).toEqual(myColor);
	expect(c.getPixel([7, 3])).toEqual([0, 0, 0]);

	expect(c.getPixel([0, 4])).toEqual(myColorInv);
	expect(c.getPixel([1, 4])).toEqual(myColor);
	expect(c.getPixel([2, 4])).toEqual(myColorInv);
	expect(c.getPixel([3, 4])).toEqual(myColorInv);
	expect(c.getPixel([4, 4])).toEqual(myColorInv);
	expect(c.getPixel([5, 4])).toEqual(myColor);
	expect(c.getPixel([6, 4])).toEqual(myColorInv);
	expect(c.getPixel([7, 4])).toEqual([0, 0, 0]);

	expect(c.getPixel([0, 2])).toEqual([0, 0, 0]);

  // unset pixels should be RGB_BLACK
	expect(c.getPixel([100, 100])).toEqual([0, 0, 0]);
});
