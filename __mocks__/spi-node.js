module.exports.SPI = jest.fn(function () {
	this.setSpeed = jest.fn(() => this);
	this.write = jest.fn(() => Promise.resolve());
});
module.exports.SPI.fromDevicePath = jest.fn(() => new module.exports.SPI());
