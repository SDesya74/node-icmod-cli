import { BuildConfig, IcmodConfig, IcmodInfo }                                     from "models"
import { closeSync, copyFileSync, existsSync, mkdirSync, openSync, writeFileSync } from "fs"
import { basename, join }                                                          from "path"
import { copyFolderRecursive }                                                     from "./util/files"
import * as AdmZip                                                                 from "adm-zip"
import { SpinnerProgress }                                                         from "./util/cli"
import { writeFile }                                                               from "fs/promises"


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
    
    build() {
        if (!this.info) throw `mod info not defined`
        
        if (!existsSync(this.root)) mkdirSync(this.root, { recursive: true })
        
        writeFileSync(join(this.root, "mod.info"), JSON.stringify(this.info, null, 4))
        writeFileSync(join(this.root, "build.config"), JSON.stringify(this.buildConfig, null, 4))
        writeFileSync(join(this.root, "config.json"), JSON.stringify(this.config, null, 4))
        closeSync(openSync(join(this.root, ".nomedia"), "w"))
        
        if (this.iconFile) copyFileSync(this.iconFile, join(this.root, "mod_icon.png"))
    }
    
    addResourceDirectory(sourcePath: string, type: "gui" | "resources" | "resource_pack" | "behavior_pack") {
        const { path, resourceType = null } = Icmod.resourceTranslator[type]
        
        copyFolderRecursiveSync(sourcePath, join(this.root, path))
        
        if (resourceType) this.config.resources.push({ path, resourceType })
    }
}