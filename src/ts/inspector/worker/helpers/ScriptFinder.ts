import { Manifest } from "../../../types/Manifest";
import { cleanPath, getFolder, joinPaths } from "../../../utils/paths";
import { TreeFile, TreeFolder, TreeNode } from "../FileTree";
import * as zip from "@zip.js/zip.js";
import { extractScripts } from "../../../utils/html";

export async function identifyBackgroundScripts(
    root: TreeFolder,
    manifest: Manifest
): Promise<void> {
    if (!manifest.background) {
        return;
    }

    if (manifest.background.scripts) {
        manifest.background.scripts
            .map((path) => root.get(cleanPath(path)))
            .filter(isFile)
            .forEach((file) => file.addTag("background"));
    } else if (manifest.background.page) {
        findScriptNodes(manifest.background.page, root, "background");
    } else {
        throw new Error("Unsupported background scripts.");
    }
}

export function identifyContentScripts(
    root: TreeFolder,
    manifest: Manifest
): void {
    if (!manifest.content_scripts) {
        return;
    }

    const scripts = manifest.content_scripts
        .flatMap((cs) => cs.js ?? [])
        .map((path) => root.get(cleanPath(path)))
        .filter(isFile);

    scripts.forEach((script) => script.addTag("content"));
}

export function identifyUserScriptAPI(
    root: TreeFolder,
    manifest: Manifest
): void {
    if (manifest.user_scripts && manifest.user_scripts.api_script) {
        const node = root.get(cleanPath(manifest.user_scripts.api_script));
        if (!isFile(node)) {
            return;
        }

        node.addTag("user-script-api");
    }
}

export async function identifySidebarScripts(
    root: TreeFolder,
    manifest: Manifest
): Promise<void> {
    if (!manifest.sidebar_action) {
        return;
    }

    await findScriptNodes(
        manifest.sidebar_action.default_panel,
        root,
        "sidebar"
    );
}

export async function identifyActionScripts(
    root: TreeFolder,
    manifest: Manifest
): Promise<void> {
    if (manifest.browser_action && manifest.browser_action.default_popup) {
        await findScriptNodes(
            manifest.browser_action.default_popup,
            root,
            "browser-action"
        );
    }

    if (manifest.page_action && manifest.page_action.default_popup) {
        await findScriptNodes(
            manifest.page_action.default_popup,
            root,
            "page-action"
        );
    }
}

export async function findScriptNodes(
    pagePath: string,
    root: TreeFolder,
    tag?: string
): Promise<TreeFile[]> {
    const path = cleanPath(pagePath);
    const basePath = getFolder(path);
    const htmlNode = root.get(path);
    if (!isFile(htmlNode) || !htmlNode.hasTag("html")) {
        return [];
    }

    if (tag) {
        htmlNode.addTag(tag);
    }

    const html = await htmlNode.entry.getData!(new zip.TextWriter());
    const scripts = extractScripts(html);
    let results = [];

    for (const script of scripts) {
        const node = root.get(joinPaths(basePath, script.src));

        if (!isFile(node)) {
            continue;
        }

        if (tag) {
            node.addTag(tag);
            if (script.type === "module") {
                node.addTag("module");
            }
        }

        results.push(node);
    }

    return results;
}

const isFile = function (node: TreeNode | undefined): node is TreeFile {
    return node !== undefined && node instanceof TreeFile;
};
