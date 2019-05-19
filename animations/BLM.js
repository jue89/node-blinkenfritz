const fs = require('fs');
const Animation = require('./Animation.js');
const Canvas = require('../Canvas.js');

class BLM extends Animation {
	constructor (opts = {}) {
		const name = opts.filePath ? `BLM: ${opts.filePath}` : `BLM`;
		super(name);

		// Store options
		this.color = opts.color || [255, 0, 128];
		this.offsetX = opts.offsetX || 0;
		this.offsetY = opts.offsetY || 0;
		this.colorCallback = opts.colorCallback;

		// Load data
		if (opts.filePath) {
			fs.readFile(opts.filePath, (err, data) => {
				if (err) throw err;
				this.parse(data.toString());
			});
		} else if (opts.data) {
			this.parse(opts.data);
		}
	}

	parse (data) {
		const lines = data.split(/[\r\n]{1,2}/)
			.filter((l) => l[0] === '0' || l[0] === '1' || l[0] === '@');

		// Convert the lines to frames
		this.frames = lines.reduce((frames, line) => {
			if (line[0] === '@') {
				// Add new frame
				frames.unshift({
					duration: parseInt(line.slice(1)),
					rows: []
				});
			} else {
				// Get the current frame
				const f = frames[0];
				if (!f) return;
				f.rows.push(line);
			}
			return frames;
		}, []).map((frame, n) => {
			// Convert the frame rows to canvases
			frame.canvas = new Canvas({
				width: 18,
				height: 8,
				offsetX: this.offsetX,
				offsetY: this.offsetY
			});
			frame.rows.forEach((row, y) => {
				row.split('').forEach((pixel, x) => {
					if (pixel === '1') frame.canvas.setPixel([x, y], this.color);
				});
			});
			delete frame.rows;

			// Mark the last frame (i.e. the first in the array)
			frame.lastFrame = (n === 0);

			return frame;
		}).reverse();

		this.curFrame = 0;
		this.setPrio(0);
	}

	getFrame () {
		if (this.curFrame >= this.frames.length) this.curFrame = 0;
		if (this.curFrame === 0 && typeof this.colorCallback === 'function') {
			const newColor = this.colorCallback();
			if (!Array.isArray(newColor)) return;
			newColor.forEach((c, n) => { this.color[n] = c; });
		}
		return this.frames[this.curFrame++];
	}
}

module.exports = BLM;
