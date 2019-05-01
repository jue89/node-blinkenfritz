
class Animation {
	constructor (frames, renderFrameFun) {
		this.frames = frames;
		this.renderFrameFun = renderFrameFun;
	}

	play (endFun) {
		let frameTimestamps = [];
		let now = Date.now();
		let time = now;
		for (let frame of this.frames) {
			frameTimestamps.push(time);
			time += frame.duration;
		}

		let data = {
			idx: 0,
			startTime: now,
			frameTimestamps: frameTimestamps,
			endTime: time,
			endFun: endFun,
			animation: this
		};

		this.dispatchFrame(data);
	}

	dispatchFrame (data) {
		let self = data.animation;
		let frame = self.frames[data.idx];

		self.renderFrameFun(frame);

		data.idx += 1;

		self.schedule(data);
	}

	schedule (data) {
		let self = data.animation;
		const idx = data.idx;
		const lastIdx = self.frames.length - 1;
		if (idx > lastIdx) {
			// last frame was already started, so we schedule
			// the end fun callback.
			self.callAt(data.endFun, data.endTime, self);
		}	else {
			self.callAt(self.dispatchFrame, data.frameTimestamps[idx], data);
		}
	}

	callAt (fun, timestamp, data) {
		let now = Date.now();
		if (now > timestamp) {
			fun(data);
		} else {
			setTimeout(fun, timestamp - now, data);
		}
	}
}

module.exports = Animation;
