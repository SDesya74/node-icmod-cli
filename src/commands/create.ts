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
        
        console.log(`
 \x1b[32m[*]\x1b[0m Icmod Project initialization finished!

To get started:

  \x1b[33mcd ${ dirName }\x1b[0m
  \x1b[33micmod dev\x1b[0m

Icmod is relying on donations to evolve so you can buy me a coffee: https://ko-fi.com/sdesya74
Any amount is very welcomed.

Please give me a star on Github if you appreciate my work:
https://github.com/SDesya74/node-icmod-cli

Enjoy!
`)
    })
}