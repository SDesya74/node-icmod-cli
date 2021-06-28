import { question, selectOne }     from "../util/cli"
import { dirname, join }           from "path"
import { copyFolderRecursiveSync }     from "../util/files"
import { readFileSync, writeFileSync } from "fs"

const ProjectTypes = [
    {
        label: "Mod",
        value: {
            template: "mod"
        }
    }
]

export default register => {
    register(/create/, async () => {
        const { template } = await selectOne("Project type: ", ProjectTypes)
        
        const info = {
            name: await question("Project name: "),
            description: await question("Project description: "),
            author: await question("Author: "),
            version: "1.0.0"
        }
        
        const predictedDirName = info.name
                                     .replace(/[\u{0080}-\u{FFFF}]/gu, "")
                                     .replace(" ", "-")
        const dirName = await question("Project directory name: ", predictedDirName)
        
        const dir = join(process.cwd(), dirName)
        const root = dirname(dirname(__dirname))
        const templateDirectory = join(root, "templates", "project", template)
        
        copyFolderRecursiveSync(templateDirectory, dir, dirName)
        
        const configPath = join(dir, "icmod.config.js")
        
        let config = readFileSync(configPath).toString()
        config = config.replace(/{%\s*([a-zA-Z_][a-zA-Z\d+_]*)\s*%}\s*/g, (_, c) => info[c])
        writeFileSync(configPath, config)
    })
}