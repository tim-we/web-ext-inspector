import * as Comlink from "comlink";
import { Inspector } from "./inspector/Inspector";
import { getFile } from "./utils/paths";
import { FileViewerAPI } from "./viewer/viewer";

const windowFeatures = "menubar=no,location=no,scrollbars=yes";

export function openFileViewer(
    filePath: string,
    remote: Inspector
): void {
    const fileWnd = window.open("file.html", "ext-file-window", windowFeatures);

    if (fileWnd === null) {
        alert("Could not open file viewer popup.");
        return;
    }

    fileWnd.onload = async () => {
        const viewer = Comlink.wrap<FileViewerAPI>(
            Comlink.windowEndpoint(fileWnd)
        );

        if ((await viewer.ping()) !== "pong") {
            alert("Failed to communicate with popup window.");
            return;
        }

        const result = await remote.highlightCode(filePath);

        viewer.show(getFile(filePath), result.code, result.language);
    };
}
