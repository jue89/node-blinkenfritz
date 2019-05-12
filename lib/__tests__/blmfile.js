
const BLMFile = require('../blmfile.js');
const path = require('path');

test('Test constructor', () => {
	const f = new BLMFile(path.join(__dirname, '/blm_testdata.blm'));

	expect(f.frames.length).toBe(74);
	expect(f.frames[72].duration).toBe(100);
	expect(f.frames[73].duration).toBe(2250);
	expect(f.frames[72].lines[4]).toEqual('000111110000000111');
});
