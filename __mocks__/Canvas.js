module.exports = jest.fn(function () {
	this.pixel = {};
	this.setPixel = jest.fn((pos, pixel) => {
		this.pixel[pos] = pixel;
	});
	this.getPixel = jest.fn((pos) => {
		return this.pixel[pos];
	});
});
