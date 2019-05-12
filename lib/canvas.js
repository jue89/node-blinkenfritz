
const RGB_BLACK = [0, 0, 0];
const RGB_WHITE = [255, 255, 255];

class Canvas {
	constructor () {
		this.data = {};
		this.cursor = [0, 0];
		this.color = RGB_WHITE;
		this.color_inv = RGB_BLACK;
	}

	drawLine01 (line, position) {
		var cursorTmp = position ? position.slice(0) : this.cursor.slice(0);

		for (let char of line) {
			if (char === '0') {
				this.setPixel(cursorTmp, this.color_inv);
			} else {
				this.setPixel(cursorTmp, this.color);
			}

			cursorTmp[0] += 1;
		}
	}

	drawBox01 (str, position) {
		var cursorTmp = position ? position.slice(0) : this.cursor.slice(0);

		for (let line of str.split('\n')) {
			this.drawLine01(line, cursorTmp);

			cursorTmp[1] += 1;
		}
	}

	setPixel (position, rgb) {
		this.data[position] = rgb;
	}

	getPixel (position) {
		var rgb = this.data[position];

		if (rgb === undefined) { return RGB_BLACK; }

		return rgb;
	}
}

module.exports = Canvas;
