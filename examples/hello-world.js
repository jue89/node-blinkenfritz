const BlinkenFritz = require('../BlinkenFritz');
const DisplayNetcat = require('../displays/Netcat.js');
const AnimationColor = require('../animations/Color.js');

const port = 12345;

const bf = new BlinkenFritz();
bf.addDisplay(new DisplayNetcat({port}));

const color = new AnimationColor();
bf.addAnimation(color);

setInterval(() => {
	const c = (Math.floor(Date.now() / 500) % 2) * 255;
	color.setColor([c, 0, c]);
}, 100);

console.log(`Connect to Netcat server:\nnc ::1 ${port}`);
