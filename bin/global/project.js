#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

exports.createProject = async params => {
	return new Promise((resolve, reject) => {
		try {
			let cwd = process.cwd();
			let dir = path.join(cwd, params.directory);
	
			if (!fs.existsSync(dir)) fs.mkdirSync(dir);
			resolve();
		} catch (exception) {
			reject(exception);
		}
	});
}