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

    return manifest.background.scripts
        .map((path) => root.get(cleanPath(path)))
        .filter(isFile);
}

export function getContentScripts(
    root: TreeFolder,
    manifest: Manifest
): TreeFile[] {
    if (!manifest.content_scripts) {
        return [];
    }

    return manifest.content_scripts
        .flatMap((cs) => cs.js ?? [])
        .map((path) => root.get(cleanPath(path)))
        .filter(isFile);
}

export function getUserScriptAPI(
    root: TreeFolder,
    manifest: Manifest
): TreeFile | undefined {
    if (manifest.user_scripts && manifest.user_scripts.api_script) {
        const node = root.get(cleanPath(manifest.user_scripts.api_script));
        if (isFile(node)) {
            return node;
        }
    }
}

const isFile = function (node: TreeNode | undefined): node is TreeFile {
    return node !== undefined && node instanceof TreeFile;
};
