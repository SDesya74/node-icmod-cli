declare module "models" {
    export type ProjectResource = {
        path: string
        type: "resources" | "gui" | "resource_pack" | "behavior_pack"
    }
}