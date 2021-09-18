import * as Comlink from "comlink";
import { Inspector } from "./inspector/Inspector";
import { getFile } from "./utils/paths";
import { FileViewerAPI } from "./viewer/viewer";
import * as config from "./config";
import { showModal } from "./modal";

const windowFeatures = "menubar=no,location=no,scrollbars=yes";

export function openFileViewer(filePath: string, remote: Inspector): void {
    const openIn = config.get("open-files-in");

    if (openIn === "popup" || openIn === "tab") {
        openFileViewerWindow(filePath, remote, openIn === "popup");
    } else if (openIn === "modal") {
        openFileViewerModal(filePath, remote);
    }
}

async function openFileViewerModal(filePath: string, remote: Inspector) {
    const result = await remote.getPrettyCode(filePath);

    const html = { __html: result.code };

    showModal(
        getFile(filePath),
        ["file-viewer"],
        <pre>
            <code
                class={"hljs language-" + result.language}
                dangerouslySetInnerHTML={html}
            ></code>
        </pre>
    );
}

function openFileViewerWindow(
    filePath: string,
    remote: Inspector,
    popup: boolean
): void {
    const fileWnd = window.open(
        "file.html?path=" + filePath,
        "ext-file-window",
        popup ? windowFeatures : ""
    );

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

        const result = await remote.getPrettyCode(filePath);

        viewer.show(getFile(filePath), result.code, result.language);
    };
}
