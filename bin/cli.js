#!/usr/bin/env node

const { createInterface, emitKeypressEvents } = require("readline");
const { EOL } = require("os");

exports.question = (prompt, defaultValue) => {
	return new Promise(resolve => {
		const rl = createInterface({
			input: process.stdin,
			output: process.stdout
		});
		rl.question(`\x1b[32m?\x1b[0m ${prompt}${defaultValue ? "(" + defaultValue + ") " : ""}`, (answer) => {
			if (answer.length < 1) resolve(defaultValue);
			else resolve(answer);
			rl.close();
		});
	});
}

exports.selectMany = (prompt, itemsMap) => {
	let selection = 0, length = Object.keys(itemsMap).length;
	console.log(`\x1b[32m?\x1b[0m ${prompt}`);

	const logState = () => console.log(
		Object.keys(itemsMap)
			.map((e, i) => {
				let isChecked = itemsMap[e];
				let isSelected = selection == i;
				let prefix = isSelected ? `\x1b[36m` + (isChecked ? "(•)" : "( )") : (isChecked ? "\x1b[32m(•)\x1b[0m" : "( )");
				return ` ${prefix} ${e}\x1b[0m`;
			}).join(EOL)
	);

	logState();
	return new Promise(async resolve => {
		const readKey = async () => new Promise(resolve => process.stdin.once("keypress", (_, key) => resolve(key)));

		const rl = createInterface({
			input: process.stdin,
			output: process.stdout
		});
		emitKeypressEvents(process.stdin, rl);
		if (process.stdin.isTTY) process.stdin.setRawMode(true);

		let name;
		while ((name = (await readKey()).name) != "return") {
			if (name == "space") {
				let key = Object.keys(itemsMap)[selection];
				itemsMap[key] = !itemsMap[key];
			}

			selection += (name == "down") - (name == "up");
			selection = selection < 0 ? length - 1 : selection % length;

			console.log("\033[" + (length + 1) + "A");
			logState();
		}
		console.log("\033[2A");
		rl.close();
		if (process.stdin.isTTY) process.stdin.setRawMode(false);
		resolve(itemsMap);
	});
}

exports.selectOne = (prompt, items) => {
	let selection = 0, length = items.length;
	console.log(`\x1b[32m?\x1b[0m ${prompt}`);

	const logState = () => console.log(
		items.map((e, i) => ` ${selection == i ? "\x1b[36m" : ""} ${e}\x1b[0m`).join(EOL)
	);

	logState();
	return new Promise(async resolve => {
		const readKey = async () => new Promise(resolve => process.stdin.once("keypress", (_, key) => resolve(key)));
		const rl = createInterface({
			input: process.stdin,
			output: process.stdout
		});
		emitKeypressEvents(process.stdin, rl);
		if (process.stdin.isTTY) process.stdin.setRawMode(true);

		let name;
		while ((name = (await readKey()).name) != "return") {
			selection += (name == "down") - (name == "up");
			selection = selection < 0 ? length - 1 : selection % length;

			console.log("\033[" + (length + 1) + "A");
			logState();
		}
		rl.close();
		if (process.stdin.isTTY) process.stdin.setRawMode(false);
		resolve(items[selection]);
	});
}
