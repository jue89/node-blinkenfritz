const fs = require('fs');
const path = require('path');
const util = require('util');
const childProcess = require('child_process');
const BlinkenFritz = require('../../BlinkenFritz.js');
const Netcat = require('../../displays/Netcat.js');
const FritzWS2801 = require('../../displays/FritzWS2801.js');
const BLM = require('../../animations/BLM.js');

const SPIDEV = '/dev/spidev0.0';
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

const exec = util.promisify(childProcess.exec);
const walkDir = (dir, callback) => fs.readdir(dir, (err, files) => {
	if (err) return;
	files.forEach((file) => {
		const filePath = path.join(dir, file);
		fs.stat(filePath, (err, stat) => {
			if (err) return;
			if (stat.isDirectory()) walkDir(filePath, callback);
			else callback(filePath);
		});
	});
});

const bf = new BlinkenFritz();

// Setup displays
bf.addDisplay(new Netcat({port: 13337}));
if (fs.existsSync(SPIDEV)) {
	const fritz = new FritzWS2801({path: SPIDEV})
		.addPanel([16, 5], 'v')
		.addPanel([12, 5], 'v')
		.addPanel([8, 5], 'v')
		.addPanel([4, 5], 'v')
		.addPanel([0, 5], 'v')
		.addPanel([0, 11], 'v')
		.addPanel([4, 11], 'v')
		.addPanel([8, 11], 'v')
		.addPanel([12, 11], 'v')
		.addPanel([16, 11], 'v');
	bf.addDisplay(fritz);
}

// Setup animations
const blRepoUrl = 'https://github.com/blinkenlights/blinkenlights/archive/a6b4991126a6afa6ca17ed53f0a83ec52399ad1c.zip';
const blRepoDir = path.join(__dirname, 'blinkenlights-a6b4991126a6afa6ca17ed53f0a83ec52399ad1c');
const download = (fs.existsSync(blRepoDir))
	? Promise.resolve()
	: exec(`wget ${blRepoUrl} -q -O bl.zip && unzip -q bl.zip && rm bl.zip`, { cwd: __dirname });
download.then(() => {
	const colorCallback = () => {
		const idx = Math.floor(COLORS.length * Math.random());
		return COLORS[idx];
	};
	const offsetX = -1;
	const offsetY = -1;
	const blAnimationsRoot = path.join(blRepoDir, 'movies/blmarchive');
	walkDir(blAnimationsRoot, (filePath) => {
		if (!filePath.endsWith('.blm')) return;
		if (filePath.indexOf('on-demand') !== -1) return;
		if (filePath.indexOf('loveletter') !== -1) return;
		try {
			const blm = new BLM({filePath, colorCallback, offsetX, offsetY});
			bf.addAnimation(blm);
			console.log('Added', filePath);
		} catch (err) {
			console.log('Ignored', filePath, err.message);
		}
	});
}).catch(console.error);
