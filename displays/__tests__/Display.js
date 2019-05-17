const Display = require('../Display.js');

test('throw Error on draw', () => {
	const d = new Display();
	expect(d.draw).toThrowError('This is just an interface. Please implement draw()!');
});
