declare module "models" {
     export type ProjectConfig = {
         info: {
             name: string
             description: string
             author: string
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
             compile: ProjectCompilingSource[]
             additional: ProjectAdditionalComponent[]
         }
     }
}