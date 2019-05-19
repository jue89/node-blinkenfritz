const EventEmitter = require('events').EventEmitter;

class Animation extends EventEmitter {
	constructor (name) {
		super();
		this.name = name || '<Unnamed>';
		this.prio = -1;
	}

	toString () {
		return `Animation: ${this.name}`;
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
