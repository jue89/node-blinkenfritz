const Display = require('../Display.js');

test('throw Error on draw', () => {
	const d = new Display();
	expect(d.draw).toThrowError('This is just an interface. Please implement draw()!');
});

test('Set default name', () => {
	const d = new Display();
	expect(d.name).toEqual('<Unnamed>');
});

test('Store name', () => {
	const name = 'abc';
	const d = new Display(name);
	expect(d.name).toEqual(name);
});

test('Include name in toString', () => {
	const name = 'abc';
	const d = new Display(name);
	expect(`${d}`).toEqual(`Display: ${name}`);
});
