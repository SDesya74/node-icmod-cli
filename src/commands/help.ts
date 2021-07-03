import { Project } from "../Project"

export default register => {
    register(/(help|h)/, async () => {
        try {
            await Project.find(process.cwd())
            console.log(`
Commands:
  help, -h   Displays this message
  build, b   Builds project to 'dist' directory
`)
        } catch {
            console.log(`
Commands:
  create, c   Create a project folder
  help, h     Displays this message
  
Trigger this inside Icmod project for more commands.
`)
        }
    })
}