declare module "models" {
    export type ProjectCompilingSource = {
        path: string
        type: "main" | "launcher" | "preloader" | "native" | "java"
    }
}