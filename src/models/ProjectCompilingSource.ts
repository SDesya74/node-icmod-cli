declare module "models" {
    export type ProjectCompilingSource = {
        path: "thaumcraft/source"
        "type": "main" | "launcher" | "preloader" | "native" | "java"
    }
}