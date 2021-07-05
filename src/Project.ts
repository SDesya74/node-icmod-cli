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
    
    get icmodDir() {
        return join(this.root, this.config.project.outDir, basename(this.root))
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
    
    createIcmod() {
        const icmod = new Icmod(this.icmodDir)
        
        const { config, info: { name, description, version, author } } = this.config
        
        icmod.info = { name, description, author, version: version.name }
        icmod.iconFile = this.config.info.icon ? join(this.root, this.config.info.icon) : null
        
        // add default value for "enabled" (user can override it)
        icmod.config = { enabled: true, ...config }
        
        return icmod
    }
    
    async build() {
        const progress = new SpinnerProgress()
        progress.setLabel("Preparing...")
        progress.show()
        
        const { project: { resources, features } } = this.config
        
        const icmod = this.createIcmod()
        
        progress.setLabel("Building resources...")
        for (const { path, type } of resources) {
            if (!path.endsWith("*")) {
                await icmod.addResourceDirectory(join(this.root, path), type, progress)
                continue
            }
            
            const folder = path.substring(0, path.length - 1)
            const paths = await readdir(join(this.root, folder))
            for (const p of paths) {
                await icmod.addResourceDirectory(join(this.root, folder, p), type, progress)
            }
        }
        
        progress.setLabel("Building features...")
        
        const done = []
        const fail = []
        async function handleFeatures() {
            return new Promise<void>(resolve => {
                const interval = setInterval(() => {
                    progress.setLabel(`Building features (${ features.join(", ") })`)
                    if (done.length + fail.length >= features.length) {
                        clearInterval(interval)
                        resolve()
                    }
                }, 50)
            })
        }
        
        const context = { project: this, icmod, progress }
        const featureMap = allFeatures.reduce((m, e) => {
            (m[e.value] = e)
            return m
        }, {})
        
        const featureFunctions = features
            .map(name => featureMap[name])
            .filter(feature => feature?.use != null)
            .map(feature => feature.use(context)
                       .then(() => {
                           const i = features.indexOf(feature.value)
                           features[i] = `\x1b[32m${ features[i] }\x1b[0m`
                           done.push(feature)
                       })
                       .catch(() => {
                           const i = features.indexOf(feature.value)
                           features[i] = `\x1B[31m${ features[i] }\x1b[0m`
                           fail.push(feature)
                       }))
        
        await Promise.all([ handleFeatures(), ...featureFunctions ])
        
        progress.setLabel("Building InnerCore requirements...")
        await icmod.build()
        
        progress.setLabel("Archiving...")
        const artifactPath = `${ this.icmodDir }.icmod`
        await icmod.zipTo(artifactPath)
        
        progress.stop()
        
        success("Build finished!")
        info("You can find .icmod file in " + `\x1b[33m${ artifactPath }\x1b[0m`)
    }
}