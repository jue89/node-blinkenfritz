const Spi = jest.fn(function () {
	this.open = jest.fn();
	this.write = jest.fn();
});

module.exports = { Spi };
