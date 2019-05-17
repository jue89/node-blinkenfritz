const EventEmitter = require('events').EventEmitter;

module.exports.createServer = jest.fn(() => {
	const srv = new EventEmitter();
	srv.listen = jest.fn();
	return srv;
});
