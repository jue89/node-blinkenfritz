const Animation = require('./Animation.js');
const Canvas = require('../Canvas.js');

class Color extends Animation {
	constructor (defaultColor = [0, 0, 0]) {
		super();
		this.prio = 0;
		this.canvas = new Canvas({defaultColor});
	}

	getFrame () {
		return {
			canvas: this.canvas,
			duration: this.duration || 100,
			lastFrame: true
		};
	}

	setColor (color) {
		this.canvas.defaultColor = color;
	}
}

module.exports = Color;
