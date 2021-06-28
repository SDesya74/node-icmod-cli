import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs"
import { basename, join }                                                             from "path"

function copyFileSync(source, target) {
    let targetFile = target
    if (existsSync(target)) {
        if (lstatSync(target).isDirectory()) {
            targetFile = join(target, basename(source))
        }
    }
    
    writeFileSync(targetFile, readFileSync(source))
}

export function copyFolderRecursiveSync(source, target, targetDirName = null) {
    let files = []
    
    const targetFolder = targetDirName ?? join(target, basename(source))
    if (!existsSync(targetFolder)) mkdirSync(targetFolder)
    
    if (lstatSync(source).isDirectory()) {
        files = readdirSync(source)
        files.forEach(function (file) {
            const curSource = join(source, file)
            if (lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder)
            } else {
                copyFileSync(curSource, targetFolder)
            }
        })
    }
}