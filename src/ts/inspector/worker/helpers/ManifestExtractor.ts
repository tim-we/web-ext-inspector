import { Manifest } from "../../../types/Manifest";
import * as zip from "@zip.js/zip.js";
import { TreeFile, TreeFolder } from "../FileTree";

export async function getManifest(root: TreeFolder): Promise<Manifest> {
    const manifestNode = root.get("manifest.json") as TreeFile;
    if (!(manifestNode instanceof TreeFile)) {
        throw new Error("Could not find manifest.json.");
    }

    const text: string = await manifestNode.entry.getData!(
        new zip.TextWriter()
    );
    return JSON.parse(text);
}
