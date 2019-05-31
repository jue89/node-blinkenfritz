const Animation = require('./Animation.js');
const Canvas = require('../Canvas.js');

class Cell {
	constructor (world) {
		this.world = world;
		this.alive = false;
	}

	handleDeath () {
		const livingNeighs = this.neighs.reduce((acc, n) => acc + (n.alive ? 1 : 0), 0);
		if (this.alive) {
			this.nextAlive = this.world.survive[livingNeighs];
		} else {
			this.nextAlive = this.world.spawn[livingNeighs];
		}
	}

	handleSpawn () {
		this.alive = this.nextAlive;
	}
}

class World {
	constructor (opts) {
		// Parse rules
		const rule = opts.rule || '23/3';
		const [survive, spawn] = rule.split('/');
		this.survive = [];
		this.spawn = [];
		for (let i = 0; i < 9; i++) {
			this.survive.push(survive.indexOf(i.toString()) !== -1);
			this.spawn.push(spawn.indexOf(i.toString()) !== -1);
		}

		// Create world
		this.width = opts.width;
		this.height = opts.height;
		this.c = [];
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				this.c.push(new Cell(this));
			}
		}
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const neighs = [];
				[[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]].forEach(([dx, dy]) => {
					const n = this.getCell([x + dx, y + dy]);
					if (n) neighs.push(n);
				});
				this.getCell([x, y]).neighs = neighs;
			}
		}

		this.generation = 0;
	}

	getCell ([x, y]) {
		if (x >= this.width) return;
		if (y >= this.height) return;
		if (x < 0) return;
		if (y < 0) return;
		return this.c[y * this.width + x];
	}

	setCell ([x, y], alive = true) {
		this.getCell([x, y]).alive = alive;
	}

	nextGeneration () {
		this.c.forEach((c) => c.handleDeath());
		this.c.forEach((c) => c.handleSpawn());
		this.generation++;
	}
}

class Conway extends Animation {
	constructor (opts = {}) {
		super('Conway');
		if (!opts.generations) opts.generations = 100;
		if (!opts.duration) opts.duration = 200;
		if (!opts.width) opts.width = 30;
		if (!opts.height) opts.height = 30;
		if (!opts.margin) opts.margin = 2;
		this.opts = opts;
		this.items = [];
		this.prio = 0;
	}

	addItem ([x, y], cells) {
		this.items.push([x, y, cells]);
		return this;
	}

	getFrame () {
		if (this.world === undefined) {
			this.world = new World({
				width: this.opts.width + 2 * this.opts.margin,
				height: this.opts.height + 2 * this.opts.margin
			});
			this.items.forEach(([dx, dy, rows]) => {
				rows.forEach((row, y) => row.forEach((cellAlive, x) => {
					this.world.getCell([x + dx, y + dy]).alive = !!cellAlive;
				}));
			});
		}

		const canvas = new Canvas(this.opts);

		for (let y = this.opts.margin; y < this.world.height - this.opts.margin; y++) {
			for (let x = this.opts.margin; x < this.world.width - this.opts.margin; x++) {
				if (this.world.getCell([x, y]).alive) {
					canvas.setPixel([x - this.opts.margin, y - this.opts.margin], [255, 0, 128]);
				}
			}
		}

		const duration = this.opts.duration;
		const lastFrame = this.world.generation >= this.opts.generations;
		if (lastFrame) {
			delete this.world;
		} else {
			this.world.nextGeneration();
		}

		return {canvas, duration, lastFrame};
	}
}

module.exports = Conway;
