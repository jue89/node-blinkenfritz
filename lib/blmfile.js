
const fs = require('fs');

class BLMFile {
	constructor (file) {
		this.file = file;
		this.frames = [];

		var content = fs.readFileSync(file, 'utf8');
		var f = null;

		// some files contain \r INSTEAD of \n or \r\n
		if (content.indexOf('\n') === -1 && content.indexOf('\r') !== -1) {
			content = content.replace(/\r/g, '\n');
		}

		for (let line of content.split('\n')) {
			line = line.replace('\r', '');

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
				if (f !== null) { f.lines.push(line); }
			}
		}

    // if there was no newline at end of file
    // we still want to consider the frame.
		this.addFrame(f);
	}

	addFrame (f) {
		if (f !== null && f !== undefined) { this.frames.push(f); }
	}
}

module.exports = BLMFile;
