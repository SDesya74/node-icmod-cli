#!/usr/bin/env node

const fs = require("fs");
const { join } = require("path");

const PROJECT_CONFIG_NAME = "project.json";

class Project {
	root;
	config;
	constructor(root) {
		this.root = root;
	}

	init() {
		let file = join(this.root, PROJECT_CONFIG_NAME);
		if(!fs.existsSync(file)) return false;

		let raw = fs.readFileSync(file);
		if(!raw) return false;

		config = JSON.parse(raw);
		return true;
	}

	static async create(directory, config) {
		return new Promise((resolve, reject) => {
			try {
				if (fs.existsSync(directory)) {
					reject("Project is already created");
					return;
				}
				fs.mkdirSync(directory);
				fs.writeFileSync(join(directory, PROJECT_CONFIG_NAME), JSON.stringify(config, null, "\t"));

				resolve();
			} catch (exception) {
				reject(exception);
			}
		});
	}

	static open(directory) {
		let project = new Project(directory);
		return project.init() ? project : null;
	}
}

exports.Project = Project;