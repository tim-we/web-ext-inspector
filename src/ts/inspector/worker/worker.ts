import * as Comlink from "comlink";
import * as zip from "@zip.js/zip.js";
import { TreeFile, TreeFolder, TreeNodeDTO } from "./FileTree";
import { Manifest } from "../../types/Manifest";
import * as ScriptFinder from "./helpers/ScriptFinder";
import AsyncEvent from "../../utils/AsyncEvent";
import { renderCode, SupportedLanguage } from "./CodeRenderer";
import { ExtensionDetails } from "../../types/ExtensionDetails";
import Extension from "./Extension";
import { getExtension } from "./ExtensionProvider";
import { ExtensionId } from "../../types/ExtensionId";

zip.configure({
    useWebWorkers: false, // this is already a worker
});

export type StatusListener = (status: string) => void;

export class WorkerAPI {
    private statusListener: StatusListener = () => {};
    private initialized: AsyncEvent = new AsyncEvent("WorkerInitialized");
    private extension: Extension;

    public async init(
        ext: ExtensionId,
        statusListener?: StatusListener
    ): Promise<void> {
        this.statusListener = statusListener ?? this.statusListener;

        this.setStatus("downloading...");
        this.extension = await getExtension(ext);
        this.setStatus("");

        this.initialized.fire();
    }

    public async getDetails(): Promise<ExtensionDetails> {
        await this.initialized.waitFor();
        return this.extension.details;
    }

    public async listDirectoryContents(path: string): Promise<TreeNodeDTO[]> {
        const dir = await this.extension.getFileOrFolder(path);

        if (dir instanceof TreeFolder) {
            const contents = Array.from(dir.children.values(), (tn) =>
                tn.toDTO()
            );
            contents.sort((a, b) => {
                if (a.type === b.type) {
                    return a.name.localeCompare(b.name);
                } else {
                    return a.type === "folder" ? -1 : 1;
                }
            });
            return contents;
        } else {
            throw new Error(`${path} is not a directory.`);
        }
    }

    public async getManifest(): Promise<Manifest> {
        await this.initialized.waitFor();
        return this.extension.manifest;
    }

    public async analyzeHTML(path: string) {
        const scripts = await ScriptFinder.findScriptNodes(
            path,
            this.extension.rootDir
        );

        return {
            scripts: scripts.map((s) => ({
                path: s.path,
                node: s.toDTO(),
            })),
        };
    }

    public async getPrettyCode(path: string): Promise<HighlightedCode> {
        const file = (await this.extension.getFileOrFolder(path)) as TreeFile;

        if (!file || file instanceof TreeFolder) {
            throw new Error(`File ${path} not found.`);
        }

        let content: string = await file.entry.getData!(new zip.TextWriter());
        let language: SupportedLanguage = "plaintext";

        if (/\.(htm|html|xml)$/i.test(file.name)) {
            language = "markup";
        } else if (/\.(js|mjs)$/i.test(file.name)) {
            language = "javascript";
        } else if (/\.json$/i.test(file.name)) {
            language = "json";
        } else if (/\.css$/i.test(file.name)) {
            language = "css";
        }

        const html = renderCode(content, language);

        return {
            language,
            code: html,
        };
    }

    public async getFileDownloadURL(
        path: string,
        timeout: number = 10.0
    ): Promise<string> {
        await this.initialized.waitFor();
        const fileNode = await this.extension.getFileOrFolder(path);

        if (!(fileNode instanceof TreeFile)) {
            throw new Error(`"${path}" is not a file.`);
        }

        let blob: Blob = await fileNode.entry.getData!(new zip.BlobWriter());
        if (path.endsWith(".svg")) {
            blob = blob.slice(0, blob.size, "image/svg+xml");
        }

        const url = URL.createObjectURL(blob);

        if (timeout > 0.0) {
            setTimeout(() => URL.revokeObjectURL(url), timeout * 1000);
        }

        return url;
    }

    private setStatus(status: string) {
        this.statusListener(status);
    }
}

Comlink.expose(new WorkerAPI());

type HighlightedCode = {
    language: SupportedLanguage;
    code: string;
};
