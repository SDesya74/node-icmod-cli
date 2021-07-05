import { question, selectMany, selectOne } from "../util/cli"
import { basename, dirname, join }         from "path"
import { copyFolderRecursive }             from "../util/files"
import { existsSync }                      from "fs"
import projects                            from "../variants/projects"
import features                            from "../variants/features"
import { readFile, writeFile }             from "fs/promises"


export default register => {
    register(/(create|c)/, async () => {
        const { template } = await selectOne("Project type: ", projects)
        
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