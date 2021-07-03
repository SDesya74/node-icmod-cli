declare module "models" {
    export type ProjectConfig = {
        info: {
            name: string
            description: string
            author: string
            icon: string
            version: {
                name: string
                code: number
            }
        }
        
        push: {
            ip: string
            port: number
            modsDirectory: string
        }
        
        project: {
            resources: ProjectResource[]
            features: string[]
            compile: ProjectCompilingSource[]
            additional: ProjectAdditionalComponent[]
        }
        
        config: {
            [key: string]: any
        }
    }
}