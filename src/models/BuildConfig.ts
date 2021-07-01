declare module "models" {
    export type BuildConfig = {
        defaultConfig: {
            api: string
            buildType: string
            "libraryDir": string
            "resourcePacksDir": string
            "behaviorPacksDir": string
        },
        compile: { path: string, sourceType: "mod" | "launcher" | "preloader" | "library" }[]
        resources: { path: string, resourceType: "resource" | "gui " }[]
        nativeDirs: { path: string }[]
        javaDirs: { path: string }[]
    }
}