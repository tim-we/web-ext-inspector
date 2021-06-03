import { Manifest } from "../../../types/Manifest";
import { cleanPath } from "../../../utils/paths";
import { TreeFile, TreeFolder } from "../FileTree";

export function identifyWebAccessibleResources(
    root: TreeFolder,
    manifest: Manifest
): void {
    if (!manifest.web_accessible_resources) {
        return;
    }

    manifest.web_accessible_resources
        .flatMap((path) => root.getAll(cleanPath(path)))
        .forEach((node) => {
            if (node instanceof TreeFile) {
                node.addTag("web");
            }
        });
}
