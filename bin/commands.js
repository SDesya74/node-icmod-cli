#!/usr/bin/env node

const { question, selectMany, selectOne } = require("./cli");
const { Project } = require("./project");
const { join } = require("path");

const commands = [];
function registerCommand(regex, action) {
	commands.push({ regex: regex, action: action });
}


function processCommand(args) {
	let command = args.join(" ");
	for (let { regex, action } of commands) {
		let match = command.match(regex);
		if (match) {
			action(match, args);
			break;
		}
	}
}

registerCommand(/create/, async match => {
	let name = await question("Project name: ");
	let directory = await question("Project directory name: ", name.replace(/[\u{0080}-\u{FFFF}]/gu, "").replace(" ", "-"));
	let author = await question("Author: ");
	let modules = await selectMany("Check the features needed for your project:", {
		"Native C++": false,
		"Java": false,
		"TypeScript": true
	});
	let ide = await selectOne("Select the IDE you prefer: ", ["VS Code", "PhpStorm"]);

	await Project.create(join(process.cwd(), directory), {
		name: name,
		author: author,
		modules: modules,
		ide: ide
	}).then(() => {
		console.log("Project successfully created!");
		console.log("Use \x1b[32mcd " + directory + "\x1b[0m to start :)");
	}).catch(reason => console.log("Error: " + reason));
});

registerCommand(/build/, async command => {
	let project = Project.open(process.cwd());
	if (!project) {
		console.log("THIS IS NOT ICMOD-PROJECT");
		return;
	}
	project.build();
});

processCommand(process.argv.slice(2));