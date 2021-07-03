declare module "models" {
    export type BuildConfig = {
        defaultConfig: {
            api: string
            buildType: string
            "libraryDir": string
            "resourcePacksDir": string
            "behaviorPacksDir": string
        },
        compile: { path: string, sourceType: string }[]
        resources: { path: string, resourceType: string }[]
        nativeDirs: { path: string }[]
        javaDirs: { path: string }[]
    }
}