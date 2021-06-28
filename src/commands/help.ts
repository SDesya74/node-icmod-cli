export default register => {
    register(/help/, async () => {
        console.log(`
Commands:
  create   Create a project folder
  help     Displays this message
  
Trigger this inside Icmod project (and npm/yarn install) for more commands.
`)
    })
}