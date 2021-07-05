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
        
        const context = {
            name: await question("Project name: "),
            description: await question("Project description: "),
            author: await question("Author: "),
            version: "1.0.0"
        }
        
        const predictedDirName = context.name
                                        .replace(/[\u{0080}-\u{FFFF}]/gu, "")
                                        .replace(" ", "-")
        const dirName = await question("Project directory name: ", predictedDirName)
        
        const projectRoot = join(process.cwd(), dirName)
        const icmodRoot = dirname(dirname(__dirname))
        const templateDirectory = join(icmodRoot, "templates", "project", template)
        
        await copyFolderRecursive(templateDirectory, projectRoot, dirName)
        
        const configPath = join(projectRoot, "icmod.config.js")
        const raw = (await readFile(configPath)).toString()
        const rendered = raw.replace(
            /\s*<\|\s*([a-zA-Z_][a-zA-Z\d+_]*)\s*\|>\s*/g,
            (_, c) => typeof context[c] == "string" ? context[c] : JSON.stringify(context[c])
        )
        await writeFile(configPath, rendered)
        
        for (const feature of context.features) {
            const featurePath = join(icmodRoot, "templates", "features", feature)
            if (!existsSync(featurePath)) throw "Feature with name " + feature + " is not exists at " + featurePath
            
            await copyFolderRecursive(featurePath, projectRoot, basename(projectRoot))
        }
        
        const configPath = join(dir, "icmod.config.js")
        
        let config = readFileSync(configPath).toString()
        config = config.replace(/{%\s*([a-zA-Z_][a-zA-Z\d+_]*)\s*%}\s*/g, (_, c) => info[c])
        writeFileSync(configPath, config)
    })
}