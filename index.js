
const DisplayCLI = require('./lib/displaycli.js');
const Canvas = require('./lib/canvas.js');
const Animation = require('./lib/animation.js');
const BLMFile = require('./lib/blmfile.js');

const fs = require('fs');
const path = require('path');

const COLORS = [
	[255, 0, 0],
	[255, 153, 0],
	[255, 255, 0],
	[0, 255, 34],
	[0, 255, 238],
	[0, 42, 255],
	[140, 0, 255],
	[255, 0, 217],
	[255, 255, 255]
];

function walkDir (dir, callback) {
	fs.readdirSync(dir).forEach(f => {
		let dirPath = path.join(dir, f);
		let isDirectory = fs.statSync(dirPath).isDirectory();
		isDirectory
			? walkDir(dirPath, callback) : callback(path.join(dir, f));
	});
};

class Main {
	constructor (dev) {
		if (dev !== null) {
			// we load it here, so spi lib does not have to be
			// installed in case there is no spi needed
			const Display = require('./lib/display.js');
			this.display = new Display(dev);
		} else {
			this.display = null;
		}

		this.displaycli = new DisplayCLI();

		this.allAnimations = [];
		this.color = this.choose(COLORS);
	}

	addPanel (offset, orientation) {
		if (this.display !== null) {
			this.display.addPanel(offset, orientation);
		}
	}

	loadFile (file) {
		let f = new BLMFile(file);
		let frames = f.frames;

		let self = this;

		function render (f) {
			let frameStr = f.lines.join('\n');

			let canvas = new Canvas();
			canvas.color = self.color;
			canvas.drawBox01(frameStr);

			if (self.display !== null) {
				self.display.draw(canvas);
			}
			self.displaycli.draw(canvas);
		}

		let a = new Animation(frames, render);
		a.file = f.file;

		this.allAnimations.push(a);
	}

	test (anim) {
		for (let frame of anim.frames) {
			if (frame.lines === undefined) {
				return false;
			}
		}

		return true;
	}

	play () {
		let self = this;

		function next (animation) {
			let newAnimation = self.choose(self.allAnimations);
			console.log('playing', newAnimation.file);

			let oldColor = self.color;
			self.color = self.choose(COLORS);
			while (self.color === oldColor) {
				self.color = self.choose(COLORS);
			}
			newAnimation.play(next);
		}

		next(null);
	}

	choose (choices) {
		var index = Math.floor(Math.random() * choices.length);
		return choices[index];
	}
}

let x, y, m;

let spiDev = '/dev/spidev0.0';
if (!fs.existsSync(spiDev)) {
	spiDev = null;
}

m = new Main(spiDev);
x = -1; y = 5;
m.addPanel([x, y], 'v');
x += 4;
m.addPanel([x, y], 'v');
x += 4;
m.addPanel([x, y], 'v');
x += 4;
m.addPanel([x, y], 'v');
x += 4;
m.addPanel([x, y], 'v');

// upper row
y += 6;
m.addPanel([x, y], 'v');
x -= 4;
m.addPanel([x, y], 'v');
x -= 4;
m.addPanel([x, y], 'v');
x -= 4;
m.addPanel([x, y], 'v');
x -= 4;
m.addPanel([x, y], 'v');

if (process.argv.length < 3) {
	console.log('USAGE: node . BLMFILEDIR');
	process.exit(1);
}

walkDir(process.argv[2], (f) => {
	if (!f.endsWith('.blm')) {
		return;
	}

	try {
		m.loadFile(f);
		console.log('loaded ' + f);
	} catch (e) {
		console.log('ignored ' + f);

		console.log(e);
	}
});
// m.loadFile('lib/__tests__/blm_testdata.blm');

m.play();
