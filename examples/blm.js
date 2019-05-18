const path = require('path');
const BlinkenFritz = require('../BlinkenFritz');
const DisplayNetcat = require('../displays/Netcat.js');
const AnimationBLM = require('../animations/BLM.js');

const port = 12345;

const bf = new BlinkenFritz();
bf.addDisplay(new DisplayNetcat({port}));

const bl = new AnimationBLM({filePath: path.join(__dirname, '../animations/__tests__/BLM.data.blm')});
bf.addAnimation(bl);

console.log(`Connect to Netcat server:\nnc ::1 ${port}`);
