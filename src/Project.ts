import { dirname, join } from "path"
import { existsSync }    from "fs"
import { merge } from "./util/merge"
import { ProjectConfig } from "models"

export class Project {
    static configFilename = "icmod.config.js"
    
    private constructor(public config: ProjectConfig) {
        this.config = merge({
            info: {
                version: {}
            },
            push: {},
            project: {
                resources: [],
                compile: []
            }
        }, this.config)
    }
    
    async find(dir: string) {
        let configFile
        do {
            configFile = join(dir, Project.configFilename)
            dir = dirname(dir)
            if (dirname(dir) === dir) {
                console.log("Trigger this command inside icmod project than contains icmod.config.js file!")
                return
            }
        } while (!existsSync(configFile))
        
        const configFunction = require(configFile)
        const loadedConfig = await configFunction()
    
        return new Project(loadedConfig)
    }
}