class Display {
	constructor (name) {
		this.name = name || '<Unnamed>';
	}

	toString () {
		return `Display: ${this.name}`;
	}

	draw () {
		throw new Error('This is just an interface. Please implement draw()!');
	}
}

module.exports = Display;
