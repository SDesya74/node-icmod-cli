import { BuildConfig, IcmodInfo }                                    from "models"
import { closeSync, existsSync, mkdirSync, openSync, writeFileSync } from "fs"
import { join }                                                      from "path"
import { copyFolderRecursiveSync }                                   from "./util/files"

export class Icmod {
    static resourceTranslator: { [key: string]: { path: string, resourceType?: string } } = {
        "gui": { path: "assets/gui", resourceType: "gui" },
        "resources": { path: "assets/resources", resourceType: "resource" },
        "resource_pack": { path: "assets/minecraft_packs/resource" },
        "behavior_pack": { path: "assets/minecraft_packs/behavior" }
    }
    root: string
    info: IcmodInfo
    config: BuildConfig
    
    constructor(root: string) {
        this.root = root
        this.config = {
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
        writeFileSync(join(this.root, "build.config"), JSON.stringify(this.config, null, 4))
        closeSync(openSync(join(this.root, ".nomedia"), "w"))
    }
    
    addResourceDirectory(sourcePath: string, type: "gui" | "resources" | "resource_pack" | "behavior_pack") {
        const { path, resourceType = null } = Icmod.resourceTranslator[type]
        
        copyFolderRecursiveSync(sourcePath, join(this.root, path))
        
        if (resourceType) this.config.resources.push({ path, resourceType })
    }
}