const EventEmitter = require('events').EventEmitter;

const PRIOS = 3;

class BlinkenFritz extends EventEmitter {
	constructor () {
		super();
		this.animations = [];
		for (let i = 0; i < PRIOS; i++) this.animations.push([]);
		this.displays = [];
	}

	addDisplay (display) {
		this.displays.push(display);
		return this;
	}

	addAnimation (animation) {
		// Add animation to the right bucket
		const prio = animation.prio;
		if (this.animations[prio]) {
			this.animations[prio].push(animation);
			this._start();
		}

		// Keep track of prio changes
		animation.on('prio', (newPrio, oldPrio, interrupt) => {
			if (this.animations[oldPrio]) {
				this.animations[oldPrio] = this.animations[oldPrio].filter((a) => a.prio === oldPrio);
			}
			if (this.animations[newPrio]) {
				this.animations[newPrio].push(animation);
				this._start();
				if (interrupt && this.activeAnimation && this.activeAnimation.prio < newPrio) {
					this.activeAnimation = animation;
				}
			}
		});

		return this;
	}

	_prepareNextFrame () {
		// Find next animation to play if no animation is active
		if (!this.activeAnimation) {
			for (let b = PRIOS - 1; b >= 0; b--) {
				const len = this.animations[b].length;
				if (len === 0) continue;
				const a = Math.floor(Math.random() * len);
				this.activeAnimation = this.animations[b][a];
				break;
			}
			this.emit('animation', this.activeAnimation);
		}

		// Abort if no active animation can be found
		if (!this.activeAnimation || !this.activeAnimation.getFrame) return false;

		// Try to get next frame
		this.nextFrame = this.activeAnimation.getFrame();
		return true;
	}

	_displayFrame () {
		const {canvas, duration, lastFrame} = this.nextFrame;

		// Bring frame to all attached displays
		this.displays.forEach((d) => d.draw(canvas));

		// Already fetch next frame
		this.nextFrameAt += duration;
		if (lastFrame) delete this.activeAnimation;
		if (!this._prepareNextFrame()) {
			this.started = false;
			return;
		}

		// Wait until it is time to display the next frame
		let delay = this.nextFrameAt - Date.now();
		if (delay < 0) delay = 0;
		setTimeout(() => this._displayFrame(), delay);
	}

	_start () {
		if (this.started) return;
		if (!this._prepareNextFrame()) return;
		this.started = true;
		this.nextFrameAt = Date.now();
		this._displayFrame();
	}
}

module.exports = BlinkenFritz;
