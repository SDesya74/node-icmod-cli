const commands = []

export function registerCommand(regex, action) {
    commands.push({ regex, action })
}

export function processCommand(args) {
    const command = args.join(" ")
    for (const { regex, action } of commands) {
        const match = command.match(regex)
        if (match) return action(match, args)
    }
    console.log("Command not found. Type \"icmod help\" to get list of commands.")
}
