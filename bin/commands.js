#!/usr/bin/env node

const { question, selector } = require("./cli");
const { createProject } = require("./global/project");

(async () => {
	let args = process.argv.slice(2);
	let command = args[0];
	switch (command) {
		case "create":
			let name = await question("Project name: ");
			let directory = await question("Project directory name: ", name.replace(/[\u{0080}-\u{FFFF}]/gu, "").replace(" ", "-"));
			let author = await question("Author: ");
			let modules = await selector("Check the features needed for your project:", {
				"Native C++": false,
				"Java": false,
				"TypeScript": true
			});

			await createProject({
				name: name,
				directory: directory,
				author: author,
				modules: modules
			}).then(() => {
				console.log("Project successfully created!");
				console.log("Use \x1b[33mcd " + directory + "\x1b[0m to start :)");
			}).catch(reason => console.log("Error: " + reason));

			break;
	}
})();

