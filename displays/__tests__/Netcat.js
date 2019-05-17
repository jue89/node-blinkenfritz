const EventEmitter = require('events').EventEmitter;

jest.mock('net');
const mockNet = require('net');

const Display = require('../Display.js');
const Netcat = require('../Netcat.js');

test('Be instance of Display', () => {
	const d = new Netcat();
	expect(d).toBeInstanceOf(Display);
});

test('Set port', () => {
	const d = new Netcat({port: 1234});
	expect(d.port).toBe(1234);
});

test('Default port to 13337', () => {
	const d = new Netcat();
	expect(d.port).toBe(13337);
});

test('Default width to 20', () => {
	const d = new Netcat();
	expect(d.width).toBe(20);
});

test('Default height to 12', () => {
	const d = new Netcat();
	expect(d.height).toBe(12);
});

test('Listen on given port', () => {
	const d = new Netcat();
	expect(mockNet.createServer.mock.calls.length).toBe(1);
	const srv = mockNet.createServer.mock.results[0].value;
	expect(srv.listen.mock.calls[0][0]).toBe(d.port);
});

test('Add connected clients', () => {
	const d = new Netcat();
	const c = new EventEmitter();
	mockNet.createServer.mock.calls[0][0](c);
	expect(d.clients[0]).toBe(c);
});

test('Remove disconnected clients', () => {
	const d = new Netcat();
	const c = new EventEmitter();
	mockNet.createServer.mock.calls[0][0](c);
	expect(d.clients.length).toBe(1);
	c.destroyed = true;
	c.emit('close');
	expect(d.clients.length).toBe(0);
});

test('Noop draw if no one is connected', () => {
	const d = new Netcat();
	const c = {getPixel: jest.fn()};
	d.draw(c);
	expect(c.getPixel.mock.calls.length).toBe(0);
});

test('Draw frame', () => {
	const d = new Netcat();
	const [r, g, b] = [1, 2, 3]
	const canvas = {getPixel: jest.fn((p) => {
		if (p[0] === 0 && p[1] === 0) return [r, g, b];
		else return [0, 0, 0]
	})};
	const client = {write: jest.fn()};
	d.clients.push(client);
	d.width = 2;
	d.height = 2;
	d.draw(canvas);
	expect(canvas.getPixel.mock.calls.length).toBe(4);
	expect(canvas.getPixel.mock.calls[0][0]).toMatchObject([0, 0]);
	expect(canvas.getPixel.mock.calls[1][0]).toMatchObject([1, 0]);
	expect(canvas.getPixel.mock.calls[2][0]).toMatchObject([0, 1]);
	expect(canvas.getPixel.mock.calls[3][0]).toMatchObject([1, 1]);
	expect(client.write.mock.calls[0][0]).toMatch([
		`\x1b[2J\n`,
		`\x1b[38;2;${r};${g};${b}m•\x1b[0m`,
		` `,
		`\n`,
		` `,
		` `,
		`\n`
	].join(''));
});
