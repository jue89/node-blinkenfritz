const BlinkenFritz = require('../BlinkenFritz');
const DisplayNetcat = require('../displays/Netcat.js');
const AnimationConway = require('../animations/Conway.js');

const width = 20;
const height = 20;

const bf = new BlinkenFritz();
bf.addDisplay(new DisplayNetcat({width, height}));

const conway = new AnimationConway({
	width,
	height
});
conway.addItem([0, 0], [
	[0, 1, 0],
	[0, 0, 1],
	[1, 1, 1]
]).addItem([13, 10], [
	[1, 1, 1],
	[1, 0, 1],
	[1, 0, 1],
	[0, 0, 0],
	[1, 0, 1],
	[1, 0, 1],
	[1, 1, 1]
]);
bf.addAnimation(conway);

console.log(`Connect to Netcat server:\nnc ::1 13337`);
