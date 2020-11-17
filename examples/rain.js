const BlinkenFritz = require('../BlinkenFritz');
const DisplayNetcat = require('../displays/Netcat.js');
const AnimationRain = require('../animations/Rain.js');

const port = 12345;

const bf = new BlinkenFritz();
bf.addDisplay(new DisplayNetcat({port}));

const color = new AnimationRain({
	defaultColor: [0, 0, 32],
	color: [128, 0, 128]
});
bf.addAnimation(color);

console.log(`Connect to Netcat server:\nnc ::1 ${port}`);
