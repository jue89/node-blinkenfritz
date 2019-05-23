class Canvas {
	constructor (opts = {}) {
		// Store options
		Object.assign(this, {
			width: 0,
			height: 0,
			wrapX: false,
			wrapY: false,
			offsetX: 0,
			offsetY: 0,
			defaultColor: [0, 0, 0]
		}, opts);

		// Pixel store
		this.p = [];
	}

	setPixel ([x, y], color) {
		if (x >= this.width) return;
		if (y >= this.height) return;
		const idx = y * this.width + x;
		this.p[idx] = color;
	}

	getPixel ([x, y]) {
		// Shift canvas
		x -= this.offsetX;
		y -= this.offsetY;

		// Handle borders
		if ((x >= this.width || x < 0) && !this.wrapX) return this.defaultColor;
		if ((y >= this.height || y < 0) && !this.wrapY) return this.defaultColor;
		x = x % this.width;
		y = y % this.height;

		// Get pixel from pixel store
		const idx = y * this.width + x;
		const color = this.p[idx];

		// Return default color if pixel hasn't been set
		if (color === undefined) return this.defaultColor;
		return color;
	}
}

module.exports = Canvas;
