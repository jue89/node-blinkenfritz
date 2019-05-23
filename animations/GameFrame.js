const fs = require('fs');
const path = require('path');
const util = require('util');
const ini = require('ini');
const Animation = require('./Animation.js');
const Canvas = require('../Canvas.js');

// Helper functions
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

class LEField {
	constructor (data, name) {
		this.data = data;
		this.name = name;
	}

	getInt () {
		return this.data.readIntLE(0, this.data.length);
	}

	getUInt () {
		return this.data.readUIntLE(0, this.data.length);
	}

	assert (data) {
		data = Buffer.from(data);
		if (Buffer.compare(this.data, data) !== 0) {
			throw new Error(`${this.name}: ${this.data.toString('hex')} !== ${data.toString('hex')}`);
		}
	}
}

class LEFile {
	constructor (data) {
		this.data = data;
	}

	slice (from, to) {
		return new LEFile(this.data.slice(from, to));
	}

	field (addr, length, name) {
		return new LEField(this.data.slice(addr, addr + length), name);
	}

	toArray (bytes) {
		const data = [];
		for (let i = 0; i < this.data.length; i += bytes) {
			const element = this.data.slice(i, i + bytes);
			if (element.length !== bytes) throw new Error(`Not dividable by ${bytes}`);
			data.push(element);
		}
		return data;
	}
}

class BMPFile {
	constructor (data) {
		const file = new LEFile(data);
		file.field(0x00, 2, 'bfType').assert('BM');
		file.field(0x1c, 2, 'biBitCount').assert([24, 0]);
		file.field(0x1e, 4, 'biCompression').assert([0, 0, 0, 0]);
		const imgOffset = file.field(0x0a, 4, 'bfOffBits').getUInt();
		this.img = file.slice(imgOffset);
		this.w = file.field(0x12, 4, 'biWidth').getInt();
		this.wBytes = Math.ceil(Math.ceil(this.w * 3) / 4) * 4;
		this.h = file.field(0x16, 4, 'biHeight').getInt();
		if (this.h < 0) {
			this.h *= -1;
			this.flip = false;
		} else {
			this.flip = true;
		}
	}

	getPixel ([x, y]) {
		// Flip image if this is required
		if (this.flip) y = this.h - 1 - y;
		const idx = this.wBytes * y + x * 3;
		return [
			this.img.data[idx + 2] || 0, // R
			this.img.data[idx + 1] || 0, // G
			this.img.data[idx + 0] || 0  // B
		];
	}
}

class GameFrame extends Animation {
	constructor (opts = {}) {
		super(`GameFrame: ${opts.dir}`);
		this.framePtr = 0;
		this.loopPtr = 0;
		this.loopDuration = opts.loopDuration || 8000;
		this.offsetX = opts.offsetX || 0;
		this.offsetY = opts.offsetY || 0;
		if (opts.dir) this.parse(opts.dir).catch((e) => this.emit('error', e));
	}

	async parse (dir) {
		const files = await readdir(dir);

		// Make sure necessary files are present
		if (!files.includes('0.bmp')) {
			throw new Error(`Missing file: ${dir}/0.bmp`);
		}

		// Read config
		const config = {
			animation: {
				hold: 200,
				loop: true
			},
			translate: {
				moveX: 0,
				moveY: 0,
				loop: true,
				panoff: false
			}
		};
		if (files.includes('config.ini')) {
			const data = await readFile(path.join(dir, 'config.ini'));
			const lines = data.toString().split(/[\r\n]{1,2}/).map((line) => line.trim());
			const c = ini.parse(lines.join('\n'));
			if (c.animation) {
				if (c.animation.hold !== undefined) {
					config.animation.hold = parseInt(c.animation.hold);
				}
				if (c.animation.loop !== undefined) {
					config.animation.loop = c.animation.loop;
				}
			}
			if (c.translate) {
				if (c.translate.moveX !== undefined) {
					config.translate.moveX = parseInt(c.translate.moveX);
				}
				if (c.translate.moveY !== undefined) {
					config.translate.moveY = parseInt(c.translate.moveY);
				}
				if (c.translate.loop !== undefined) {
					config.translate.loop = c.translate.loop;
				}
				if (c.translate.panoff !== undefined) {
					config.translate.panoff = c.translate.panoff;
				}
			}
		}

		// Read images
		this.frames = [];
		const width = 16;
		const height = 16;
		const duration = config.animation.hold;
		const lastFrame = false;
		for (let i = 0; files.includes(`${i}.bmp`); i++) {
			// Read BMP file
			const data = await readFile(path.join(dir, `${i}.bmp`));
			const bmp = new BMPFile(data);

			// Calc translation stuff
			const moveX = config.translate.moveX;
			const moveY = config.translate.moveY;
			const panoff = config.translate.panoff;
			let anchorX, anchorY;
			let stopX, stopY;
			if (moveX < 0) {
				anchorX = (panoff) ? bmp.w : bmp.w - 16;
				stopX = (panoff) ? -16 : 0;
			} else if (moveX > 0) {
				anchorX = (panoff) ? -16 : 0;
				stopX = (panoff) ? bmp.w : bmp.w - 16;
			} else {
				anchorX = 0;
				stopX = 0;
			}
			if (moveY < 0) {
				anchorY = (panoff) ? bmp.h : bmp.h - 16;
				stopY = (panoff) ? -16 : 0;
			} else if (moveY > 0) {
				anchorY = (panoff) ? -16 : 0;
				stopY = (panoff) ? bmp.h : bmp.h - 16;
			} else {
				anchorY = 0;
				stopY = 0;
			}

			// Convert BMP to canvas(es)
			while (true) {
				const canvas = new Canvas({
					width,
					height,
					offsetX: this.offsetX,
					offsetY: this.offsetY
				});
				for (let y = 0; y < height; y++) {
					for (let x = 0; x < width; x++) {
						canvas.setPixel(
							[x, y],
							bmp.getPixel([x + anchorX, y + anchorY])
						);
					}
				}
				this.frames.push({canvas, duration, lastFrame});
				let moved = false;
				if (moveX > 0 && anchorX < stopX || moveX < 0 && anchorX > stopX) {
					anchorX += moveX;
					moved = true;
				}
				if (moveY > 0 && anchorY < stopY || moveY < 0 && anchorY > stopY) {
					anchorY += moveY;
					moved = true;
				}
				if (!moved) break;
			}
		}

		// If config tells us not to loop, just set the loop duration to 0.
		// This will always set the last frame's lastFrame flag to true.
		if (config.animation.loop === false || config.translate.loop === false) {
			this.loopDuration = 0;
		}

		this.setPrio(0);
	}

	getFrame () {
		// If we entred the loop, we track the starting point in time
		if (this.loopStartedAt === undefined) this.loopStartedAt = Date.now();

		const frame = this.frames[this.framePtr++];

		// Last frame?
		if (this.framePtr === this.frames.length) {
			this.framePtr = 0;

			// Is it time to break the endless loop?
			if (Date.now() >= this.loopStartedAt + this.loopDuration) {
				frame.lastFrame = true;
				delete this.loopStartedAt;
			} else {
				frame.lastFrame = false;
			}
		}
		return frame;
	}
}

module.exports = GameFrame;
