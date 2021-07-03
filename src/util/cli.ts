import { createInterface, emitKeypressEvents, Key } from "readline"
import { EOL }                                      from "os"

async function readKey(): Promise<Key> {
    return new Promise(async resolve => process.stdin.once("keypress", (_, key) => resolve(key)))
}

function ask(text) {
    console.log(` \x1b[32m?\x1b[0m ${ text }`)
}

function liftUpConsoleCursor(lineAmount) {
    console.log(`\x1b[${ lineAmount + 1 }A`)
}
// endregion

export function info(...data: any[]) {
    console.log(` \x1b[32mi\x1b[0m`, ...data)
}

export function warn(...data: any[]) {
    console.warn(` \x1b[32m!\x1b[33m`, ...data, `\x1b[0m`)
}

export function success(...data: any[]) {
    console.log(`\x1b[32m`, ...data, `\x1b[0m`)
}

export async function question(prompt, defaultValue = null): Promise<string> {
    return new Promise(async resolve => {
        
        async function readLine() {
            return new Promise(async resolve => {
                const reader = createInterface({
                    input: process.stdin,
                    output: process.stdout
                })
                
                reader.question(
                    ` \x1b[32m?\x1b[0m ${ prompt }${ defaultValue ? "(" + defaultValue + ") " : "" }`,
                    answer => {
                        resolve(answer)
                        reader.close()
                    }
                )
            })
        }
        
        while (true) {
            let response = await readLine() || defaultValue
            if (response == null) {
                liftUpConsoleCursor(1)
                continue
            }
            return resolve(response)
        }
    })
}

export async function selectMany(prompt, items): Promise<string[]> {
    let selection = 0
    const length = items.length
    const options = items.map(item => {
        return { label: item.label, value: item.value, checked: item.recommended }
    })
    
    function showCurrentState() {
        console.log(options.map((option, i) => {
            let checked = option.checked
            let selected = selection === i
            let prefix = selected ? `\x1b[36m` + (checked ? "(•)" : "( )") : (checked ? "\x1b[32m(•)\x1b[0m" : "( )")
            return `  ${ prefix } ${ option.label }\x1b[0m`
        }).join(EOL))
    }
    
    ask(prompt)
    showCurrentState()
    
    return new Promise(async (resolve) => {
        startKeyReader()
        
        let key
        while ((key = (await readKey()).name) !== "return") {
            if (key === "space") {
                let item = options[selection]
                item.checked = !item.checked
            } else {
                selection += +(key === "down") - +(key === "up")
                selection = selection < 0 ? length - 1 : selection % length
            }
            liftUpConsoleCursor(length)
            showCurrentState()
        }
        
        stopKeyReader()
        
        resolve(
            options
                .filter(e => e.checked)
                .map(e => e.value)
        )
    })
}

type SelectOneOption<T> = {
    label: string
    value: T
}

export async function selectOne<T>(prompt, items: SelectOneOption<T>[]): Promise<T> {
    let selection = 0
    const length = items.length
    
    function showCurrentState() {
        console.log(
            items
                .map((e, i) => `  ${ selection === i ? "\x1b[36m" : "" }• ${ e.label }\x1b[0m`)
                .join(EOL)
        )
    }
    
    ask(prompt)
    showCurrentState()
    
    return new Promise(async resolve => {
        startKeyReader()
        
        let key
        while ((key = (await readKey())?.name) !== "return") {
            selection += +(key === "down") - +(key === "up")
            selection = selection < 0 ? length - 1 : selection % length
            liftUpConsoleCursor(length)
            showCurrentState()
        }
        
        stopKeyReader()
        
        resolve(items[selection].value)
    })
}

export class SpinnerProgress {
    charList = "⠈⠐⠠⢀⡀⠄⠂⠁"
    private index: number = 0
    private timeout: Timeout
    private label: string
    
    show() {
        if (this.timeout) return
        this.timeout = setInterval(() => {
            this.index++
            this.showCurrentState()
        }, 60)
        this.showCurrentState()
    }
    
    setLabel(label: string) {
        this.label = label
    }
    
    stop() {
        clearInterval(this.timeout)
        console.log(" ".repeat(50))
    }
    
    private showCurrentState() {
        if (!this.timeout) throw "Call .show() before showing state"
        
        const char = this.charList[this.index % this.charList.length]
        console.log(` ${ char } ${ this.label }${ " ".repeat(50) }`)
        liftUpConsoleCursor(1)
    }
}

// region KeyReader
let keyReader

function startKeyReader() {
    if (keyReader) return
    
    keyReader = createInterface({
        input: process.stdin,
        output: process.stdout
    })
    emitKeypressEvents(process.stdin, keyReader)
    if (process.stdin.isTTY) process.stdin.setRawMode(true)
}

function stopKeyReader() {
    if (!keyReader) return
    
    liftUpConsoleCursor(1)
    keyReader.close()
    keyReader = null
    if (process.stdin.isTTY) process.stdin.setRawMode(false)
}
// endregion