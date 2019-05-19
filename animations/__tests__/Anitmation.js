const Animation = require('../Animation.js');

test('throw Error on getFrame', () => {
	const a = new Animation();
	expect(a.getFrame).toThrowError('This is just an interface. Please implement getFrame()!');
});

test('Set default name', () => {
	const a = new Animation();
	expect(a.name).toEqual('<Unnamed>');
});

test('Store name', () => {
	const name = 'abc';
	const a = new Animation(name);
	expect(a.name).toEqual(name);
});

test('Include name in toString', () => {
	const name = 'abc';
	const a = new Animation(name);
	expect(`${a}`).toEqual(`Animation: ${name}`);
});
