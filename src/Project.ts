import { basename, dirname, join }        from "path"
import { existsSync }                     from "fs"
import { merge }                          from "./util/merge"
import { ProjectConfig }                  from "models"
import allFeatures                        from "./variants/features"
import { Icmod }                          from "./Icmod"
import { info, SpinnerProgress, success } from "./util/cli"
import { readdir }                        from "fs/promises"

export class Project {
    static configFilename = "icmod.config.js"
    config: ProjectConfig
    root: string
    configFile: string
    
    private constructor(root: string) {
        this.root = root
        this.configFile = join(root, Project.configFilename)
        if (!existsSync(this.configFile)) throw `Config file is not exist in ${ root }`
    }
    
    static async find(dir: string): Promise<Project> {
        return new Promise(async (resolve, reject) => {
            while (!existsSync(join(dir, Project.configFilename))) {
                if (dirname(dir) === dir) return reject()
                dir = dirname(dir)
            }
            
            const project = new Project(dir)
            await project.init()
            resolve(project)
        })
    }
    
    async init() {
        const configFunction = require(this.configFile)
        const loadedConfig = await configFunction()
        
        this.config = merge({
            info: {
                version: {}
            },
            push: {},
            project: {
                outDir: "dist",
                api: "CoreEngine",
                resources: [],
                compile: [],
                additional: [],
                features: []
            },
            config: {}
        }, loadedConfig)
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