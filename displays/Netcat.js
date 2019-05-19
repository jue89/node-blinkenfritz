const net = require('net');
const Display = require('./Display.js');

class Netcat extends Display {
	constructor (opts = {}) {
		super(`Netcat: ${opts.port || 13337}`);

		// Store options
		Object.assign(this, {
			port: 13337,
			width: 20,
			height: 12
		}, opts);

		// Start server
		this.clients = [];
		net.createServer((client) => {
			// Keep track of connected clients
			this.clients.push(client);
			client.on('close', () => {
				this.clients = this.clients.filter((c) => !c.destroyed);
			});
		}).listen(this.port);
	}

	draw (canvas) {
		if (!this.clients.length) return;

		let frame = `\x1b[2J\n`;
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const [r, g, b] = canvas.getPixel([x, y]);
				if (r === 0 && g === 0 && b === 0) {
					frame += ` `;
				} else {
					frame += `\x1b[38;2;${r};${g};${b}m•\x1b[0m`;
				}
			}
			frame += `\n`;
		}

		this.clients.forEach((c) => c.write(frame));
	}
}

module.exports = Netcat;
