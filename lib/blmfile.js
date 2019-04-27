
const fs = require('fs');

class BLMFile {
	constructor (file) {
		var content = fs.readFileSync(file, 'utf8');

		this.frames = [];

		var f = null;

		for (let line of content.split('\n')) {
			if (line.length === 0) {
				// end of frame
				this.addFrame(f);
				f = null;
			} else if (line[0] === '@') {
				f = {
					duration: parseInt(line.slice(1)),
					lines: []
				};
			} else if (line[0] === '#') {
				// skip meta information as of now
			} else {
				f.lines.push(line);
			}
		}

    // if there was no newline at end of file
    // we still want to consider the frame.
		this.addFrame(f);
	}

	addFrame (f) {
		if (f !== null) { this.frames.push(f); }
	}
}

module.exports = BLMFile;
