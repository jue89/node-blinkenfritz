const spi = require('spi');
const Display = require('./Display.js');

const box = {
	'h': [
		[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0],
		[5, 1], [4, 1], [3, 1], [2, 1], [1, 1], [0, 1],
		[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
		[5, 3], [4, 3], [3, 3], [2, 3], [1, 3], [0, 3]
	],
	'v': [
		[0, 0], [0, -1], [0, -2], [0, -3], [0, -4], [0, -5],
		[1, -5], [1, -4], [1, -3], [1, -2], [1, -1], [1, 0],
		[2, 0], [2, -1], [2, -2], [2, -3], [2, -4], [2, -5],
		[3, -5], [3, -4], [3, -3], [3, -2], [3, -1], [3, 0]
	]
};

class FritzWS2801 extends Display {
	constructor (opts = {}) {
		super();
		this.spi = new spi.Spi(opts.path, {maxSpeed: 500000});
		this.spi.open();
		this.leds = [];
	}

	addPanel (offset, orientation) {
		box[orientation].forEach((p) => {
			this.leds.push([p[0] + offset[0], p[1] + offset[1]]);
		});
		return this;
	}

	draw (canvas) {
		// Reuse buffer to safe CPU
		const requiredLength = this.leds.length * 3;
		if (!this.buf || this.buf.length !== requiredLength) {
			this.buf = Buffer.allocUnsafe(requiredLength);
		}

		for (let i = 0, j = 0; j < this.buf.length; i += 1, j += 3) {
			const [r, g, b] = canvas.getPixel(this.leds[i]);
			this.buf[j + 0] = r;
			this.buf[j + 1] = g;
			this.buf[j + 2] = b;
		}

		this.spi.write(this.buf);
	}
}

module.exports = FritzWS2801;
