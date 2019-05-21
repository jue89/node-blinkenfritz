const path = require('path');
const BlinkenFritz = require('../BlinkenFritz');
const DisplayNetcat = require('../displays/Netcat.js');
const AnimationGameFrame = require('../animations/GameFrame.js');

const bf = new BlinkenFritz();
bf.addDisplay(new DisplayNetcat({
	port: 12345,
	width: 16,
	height: 16
}));

[
	path.join(__dirname, '../animations/__tests__/GameFrame.data.multiimg'),
	path.join(__dirname, '../animations/__tests__/GameFrame.data.moveimgy'),
	path.join(__dirname, '../animations/__tests__/GameFrame.data.moveimgx')
].forEach((dir) => bf.addAnimation(new AnimationGameFrame({dir})));

bf.on('animation', (a) => console.log(a.toString()));

console.log(`Connect to Netcat server:\nnc ::1 12345`);
