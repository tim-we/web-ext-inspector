import { Manifest } from "../../../types/Manifest";
import { cleanPath } from "../../../utils/paths";
import { TreeFile, TreeFolder, TreeNode } from "../FileTree";

export function getBackgroundScripts(
    root: TreeFolder,
    manifest: Manifest
): TreeFile[] {
    //TODO: handle background page
    
    if (!manifest.background || !manifest.background.scripts) {
        return [];
    }

    const scriptNodes = manifest.background.scripts
        .map((path) => root.get(cleanPath(path)))
        .filter(
            (node) => node !== undefined && node instanceof TreeFile
        ) as TreeFile[];

    return scriptNodes;
}
