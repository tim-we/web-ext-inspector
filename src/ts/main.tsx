import * as Preact from "preact";
import * as AMOAPI from "./AMOAPI";
import * as zip from "@zip.js/zip.js";
import { createFileTree, TreeFolder } from "./FileTree";
import FileTreeView from "./components/FileTreeView";
import ExtensionDetails from "./components/ExtensionDetails";

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);

(async () => {
    const extension = "tabs-aside";

    const info = await AMOAPI.getInfo(extension);

    const data = info.current_version.files.filter(
        (file) => file.is_webextension
    )[0];

    //@ts-ignore
    const reader = new zip.ZipReader(new zip.HttpReader(data.url));

    const fileTree = createFileTree(await reader.getEntries());

    Preact.render(
        <>
            <ExtensionDetails details={info} />
            <FileTreeView data={fileTree} />
        </>,
        root
    );

    // close the ZipReader
    await reader.close();
})();
