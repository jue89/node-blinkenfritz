const EventEmitter = require('events').EventEmitter;

class Animation extends EventEmitter {
	constructor () {
		super();
		this.prio = -1;
	}

	setPrio (newPrio, interrupt) {
		if (newPrio > 2) newPrio = 2;
		const oldPrio = this.prio;
		if (oldPrio === newPrio) return;
		this.prio = newPrio;
		this.emit('prio', newPrio, oldPrio, interrupt);
	}

	getFrame () {
		throw new Error('This is just an interface. Please implement getFrame()!');
		// return {canvas, duration, lastFrame};
	}
}

module.exports = Animation;
