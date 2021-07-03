import { existsSync, lstatSync, readFileSync } from "fs"
import { basename, join }                      from "path"
import { mkdir, readdir, writeFile }           from "fs/promises"

async function copyFile(source, target) {
    let targetFile = target
    if (existsSync(target)) {
        if (lstatSync(target).isDirectory()) {
            targetFile = join(target, basename(source))
        }
    }
    
    await writeFile(targetFile, readFileSync(source))
}

export async function copyFolderRecursive(source, target, targetDirName = null) {
    let files = []
    
    const targetFolder = targetDirName ?? join(target, basename(source))
    if (!existsSync(targetFolder)) await mkdir(targetFolder, { recursive: true })
    
    if (lstatSync(source).isDirectory()) {
        files = await readdir(source)
        for (const file of files) {
            const curSource = join(source, file)
            if (lstatSync(curSource).isDirectory()) {
                await copyFolderRecursive(curSource, targetFolder)
            } else {
                await copyFile(curSource, targetFolder)
            }
        }
    }
}