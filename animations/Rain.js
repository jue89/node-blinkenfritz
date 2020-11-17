const Animation = require('./Animation.js');
const Canvas = require('../Canvas.js');
const linterpol = require('linterpol');

function blend (c0, c1, f) {
	const g = 1 - f;
	return [
		Math.floor(c0[0] * f + c1[0] * g),
		Math.floor(c0[1] * f + c1[1] * g),
		Math.floor(c0[2] * f + c1[2] * g),
	];
}

const DROPLUT = [
	[1, 1],
	[2, 0.5],
	[3, 0.3],
	[4, 0.2],
	[5, 0.05],
	[6, 0]
];

class Color extends Animation {
	constructor (opts = {}) {
		super('Rain');
		this.prio = 0;
		this.color = opts.color || [0, 255, 0];
		this.duration = opts.duration || 40;
		this.defaultColor = opts.defaultColor || [0, 0, 0];
		this.width = opts.width || 20;
		this.height = opts.height || 20;

		this.drops = [];
	}

	newDrop () {
		const pos = [Math.round(Math.random() * this.width), 0];
		this.drops.push(pos);
	}

	getFrame () {
		// Insert drop sometimes ...
		if (Math.random() < 0.3) this.newDrop();

		// Move drops down
		this.drops = this.drops.filter((d) => {
			d[1] = d[1] + 0.3;
			if (d[1] > this.height + 7) return false;
			else return true;
		});

		// Draw canvas
		const canvas = new Canvas(this);
		this.drops.forEach(([x, y0]) => {
			const shift = y0 - Math.floor(y0);
			y0 = Math.floor(y0);
			for (let dy = 0; dy < 7; dy++) {
				const y = y0 - dy;

				canvas.setPixel([x, y], blend(
					this.color,
					canvas.getPixel([x, y]),
					linterpol(dy + shift, DROPLUT)
				));
			}
		});

		return {
			canvas: canvas,
			duration: this.duration,
			lastFrame: false
		};
	}
}

module.exports = Color;
