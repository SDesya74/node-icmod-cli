import { existsSync, lstatSync, readFileSync } from "fs"
import { basename, join }                      from "path"
import { mkdir, readdir, writeFile }           from "fs/promises"

async function copyFile(source, target) {
    const targetFile = existsSync(target) && lstatSync(target).isDirectory() ? join(target, basename(source)) : target
    await writeFile(targetFile, readFileSync(source))
}

export async function copyFolderRecursive(source, target, targetDirName = null) {
    const targetFolder = targetDirName ?? join(target, basename(source))
    if (!existsSync(targetFolder)) await mkdir(targetFolder, { recursive: true })
    
    if (lstatSync(source).isDirectory()) {
        const files = await readdir(source)
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