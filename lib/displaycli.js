var dgram = require('dgram');

class DisplayCLI {
	constructor () {
		this.client = dgram.createSocket('udp6');

		// Use
		//
		// $ nc -ul ::1 33333
		//
		// to see the display on CLI.
	}

	draw (canvas) {
		var client = this.client;

		var PORT = 33333;
		var HOST = '::1';
		var message = '';

		message += String.fromCharCode(parseInt('33', 8)) + '[2J\n';

		for (var y = 0; y < 12; y++) {
			for (var x = 0; x < 20; x++) {
				let pixel = canvas.getPixel([x, y]);
				if (pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0) {
					message += ' ';
				} else {
					message += '█';
				}
			}
			message += '\n';
		}

		message = Buffer.from(message);

		client.send(message, 0, message.length, PORT, HOST, (err, bytes) => {
			if (err) throw err;
		});
	}
}

module.exports = DisplayCLI;
