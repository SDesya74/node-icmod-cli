import { BuildConfig, IcmodConfig, IcmodInfo } from "models"
import { closeSync, existsSync, openSync }     from "fs"
import { basename, join }                      from "path"
import { copyFolderRecursive }                 from "./util/files"
import * as AdmZip                             from "adm-zip"
import { SpinnerProgress }                     from "./util/cli"
import { copyFile, mkdir, writeFile }          from "fs/promises"


export class Icmod {
    static resourceTranslator: { [key: string]: { path: string, resourceType?: string } } = {
        "gui": { path: "assets", resourceType: "gui" },
        "resources": { path: "assets", resourceType: "resource" },
        "resource_pack": { path: "assets/minecraft_packs/resource" },
        "behavior_pack": { path: "assets/minecraft_packs/behavior" }
    }
    root: string
    info: IcmodInfo
    iconFile: string
    buildConfig: BuildConfig
    config: IcmodConfig
    
    constructor(root: string) {
        this.root = root
        this.buildConfig = {
            defaultConfig: {
                api: "CoreEngine",
                buildType: "develop",
                libraryDir: "lib/",
                resourcePacksDir: "minecraft_packs/resource",
                behaviorPacksDir: "minecraft_packs/behavior"
            },
            compile: [],
            resources: [],
            nativeDirs: [],
            javaDirs: []
        }
    }
    
    async build() {
        if (!this.info) throw `mod info not defined`
        
        if (!existsSync(this.root)) await mkdir(this.root, { recursive: true })
        
        await writeFile(join(this.root, "mod.info"), JSON.stringify(this.info, null, 4))
        await writeFile(join(this.root, "build.config"), JSON.stringify(this.buildConfig, null, 4))
        await writeFile(join(this.root, "config.json"), JSON.stringify(this.config, null, 4))
        closeSync(openSync(join(this.root, ".nomedia"), "w"))
        
        if (this.iconFile) await copyFile(this.iconFile, join(this.root, "mod_icon.png"))
    }
    
    async zipTo(file: string) {
        const zip = new AdmZip()
        zip.addLocalFolder(this.root, basename(this.root))
        await writeFile(file, zip.toBuffer())
    }
    
    async addResourceDirectory(sourcePath: string, type: string, progress?: SpinnerProgress) {
        const { path, resourceType = null } = Icmod.resourceTranslator[type]
        const dirname = basename(sourcePath)
        
        const targetPath = join(this.root, path)
        progress?.setLabel(`Building ${ type } ${ dirname !== type ? `(${ dirname })` : "" }`)
        
        await copyFolderRecursive(sourcePath, targetPath)
        
        if (resourceType) this.buildConfig.resources.push({ path, resourceType })
    }
}