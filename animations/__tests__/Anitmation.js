const Animation = require('../Animation.js');

test('throw Error on getFrame', () => {
	const a = new Animation();
	expect(a.getFrame).toThrowError('This is just an interface. Please implement getFrame()!');
});
