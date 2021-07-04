import { join }                                                   from "path"
import { Project }                                                from "../Project"
import { exec, execSync }                                         from "child_process"
import { EOL }                                                    from "os"
import { error, info, selectOne, SpinnerProgress, success, warn } from "../util/cli"

type Device = {
    id: string
    remote: boolean
    product: string
    model: string
    device: string
    transport_id: string
}

export default register => {
    register(/(push|p)/, async () => {
        Project.find(process.cwd())
               .then(async project => {
                   const { ip, port } = project.config.push
            
                   try {
                       const connectedDevices = getConnectedDevices()
                
                       if (connectedDevices.length > 0) {
                           const device = await selectDevice()
                           push(project, device)
                           return
                       }
                
                       warn("You are not connected to ADB via USB")
                       const needConnect = await selectOne(`Connect via Wi-Fi? (${ ip }:${ port })`, [
                           { label: "Yes", value: true },
                           { label: "No", value: false }
                       ])
                       if (needConnect) {
                           try {
                               execSync(`adb connect ${ ip }:${ port } > nul`)
                               info("Connected!")
                               const device = await selectDevice()
                               push(project, device)
                           } catch {
                               error("Connection failed...")
                           }
                       } else {
                           error("Unable to push mod because device is not connected to ADB")
                           return
                       }
                   } catch (e) {
                       console.log(e)
                   }
            
               })
               .catch(() => console.error("Trigger this inside Icmod project"))
    })
}

function getConnectedDevices(): Device[] {
    const raw = execSync(`adb devices -l`).toString()
    const rawDevices = raw.split(EOL).slice(1, -2)
    const regex = /(\S+)/g
    return rawDevices.map(raw => {
        const match = raw.match(regex)
        const id = match.shift()
        const deviceParams = match.slice(1).reduce((map, e) => {
            const [ key, value ] = e.split(":")
            map[key] = value
            return map
        }, {})
        return { id, remote: id.includes(":"), ...deviceParams } as Device
    })
}

async function selectDevice(): Promise<Device> {
    const devices = getConnectedDevices()
    if (devices.length < 1) throw "Connect to ADB first"
    if (devices.length == 1) return devices.shift()
    return await selectOne("Select device to push:", devices.map(e => {
        return { label: `${ e.model } (${ e.remote ? "Wi-Fi" : "USB" })`, value: e }
    }))
}

function push(project: Project, device: Device) {
    info(`Pushing to ${ device.model } ${ device.remote ? "via Wi-Fi" : "via USB" }`)
    try {
        const sourcePath = project.icmodDir.replace(/\\/g, "/")
        let targetPath = join(project.config.push.modsDirectory).replace(/\\/g, "/")
        if (!targetPath.startsWith("/")) targetPath = `/${ targetPath }/`
        
        const spinner = new SpinnerProgress()
        spinner.setLabel("Pushing")
        spinner.show()
        exec(`adb -s ${ device.id } push ${ sourcePath }/ ${ targetPath }`, (e) => {
            spinner.stop()
            if (e) {
                error("Failed to push mod")
            } else {
                success("Mod successfully pushed!")
            }
        })
    } catch (e) {
        console.log(e.message)
    }
}