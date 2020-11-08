#!/usr/bin/env node

const { createInterface, emitKeypressEvents } = require("readline");
const { EOL } = require("os");

exports.question = (prompt, defaultValue) => {
	return new Promise(resolve => {
		const rl = createInterface({
			input: process.stdin,
			output: process.stdout
		});
		rl.question(`\x1b[32m?\x1b[0m ${prompt}${ defaultValue ? "(" + defaultValue + ")" : ""}`, (answer) => {
			if(answer.length < 1) resolve(defaultValue);
			else resolve(answer);
			rl.close();
		});
	});
}

exports.selector = (prompt, itemsMap) => {
	let selection = 0, length = Object.keys(itemsMap).length;
	console.log(`\x1b[32m?\x1b[0m ${prompt}`);

	const logState = () => console.log(
		Object.keys(itemsMap)
			.map((e, i) => {
				let isChecked = itemsMap[e];
				let isSelected = selection == i;
				let prefix = isSelected ? `\x1b[36m` + (isChecked ? "(•)" : "( )") : (isChecked ? "\x1b[32m(•)\x1b[0m" : "( )");
				return ` ${prefix} ${e}\x1b[0m`;
			})
			.join(EOL)
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
		while (true) {
			let name = (await readKey()).name;
			if (name == "return") break;

			if (name == "space") {
				let key = Object.keys(itemsMap)[selection];
				itemsMap[key] = !itemsMap[key];
			}

			selection += -(name == "up") + (name == "down");
			selection = selection < 0 ? length - 1 : selection % length;

			console.log("\033[" + (length + 1) + "A");
			logState();
		}
		rl.close();
		if (process.stdin.isTTY) process.stdin.setRawMode(false);
		resolve(itemsMap);
	});
}
