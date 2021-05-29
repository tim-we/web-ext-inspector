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
        .filter(isFile) as TreeFile[];

    return scriptNodes;
}

export function getContentScripts(
    root: TreeFolder,
    manifest: Manifest
): TreeFile[] {
    if (!manifest.content_scripts) {
        return [];
    }

    const scriptNodes = manifest.content_scripts
        .flatMap((cs) => cs.js ?? [])
        .map((path) => root.get(cleanPath(path)))
        .filter(isFile) as TreeFile[];

    return scriptNodes;
}

const isFile = (node: TreeNode | undefined) =>
    node !== undefined && node instanceof TreeFile;
