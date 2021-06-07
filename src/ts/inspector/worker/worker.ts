import * as Comlink from "comlink";
import * as zip from "@zip.js/zip.js";
import * as AMOAPI from "./AMOAPI";
import { createFileTree, TreeFile, TreeFolder, TreeNodeDTO } from "./FileTree";
import { Manifest } from "../../types/Manifest";
import * as ManifestExtractor from "./helpers/ManifestExtractor";
import * as ScriptFinder from "./helpers/ScriptFinder";
import * as ResourceLocator from "./helpers/ResourceLocator";
import AsyncEvent from "../../utils/AsyncEvent";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";

zip.configure({
    useWebWorkers: false, // this is already a worker
});

hljs.registerLanguage("javascript", javascript);

export type StatusListener = (status: string) => void;

export class WorkerAPI {
    private statusListener: StatusListener = () => {};
    private root: TreeFolder = new TreeFolder("root");
    private details: AMOAPI.Details | undefined;
    private initialized: AsyncEvent = new AsyncEvent("WorkerInitialized");
    private manifest: Manifest | undefined;

    public async init(
        extId: string,
        statusListener?: StatusListener
    ): Promise<void> {
        this.statusListener = statusListener ?? this.statusListener;
        this.setStatus("loading meta data");
        const details = (this.details = await AMOAPI.getInfo(extId));

        const webExts = details.current_version.files.filter(
            (file) => file.is_webextension
        );

        if (webExts.length === 0) {
            throw new Error("No web extension files.");
        }

        this.setStatus("downloading & extracting");
        //@ts-ignore
        const httpReader = new zip.HttpReader(webExts[0].url);

        const reader = new zip.ZipReader(httpReader);
        this.root = createFileTree(await reader.getEntries());

        await this.analyze();

        this.setStatus("");
        await reader.close();
        this.initialized.fire();
    }

    private async analyze() {
        this.setStatus("analyzing");
        const root = this.root;

        const manifest = (this.manifest = await ManifestExtractor.getManifest(
            root
        ));

        await ScriptFinder.identifyBackgroundScripts(root, manifest);

        ScriptFinder.identifyContentScripts(root, manifest);
        ScriptFinder.identifySidebarScripts(root, manifest);
        ScriptFinder.identifyUserScriptAPI(root, manifest);
        ScriptFinder.identifyActionScripts(root, manifest);

        ResourceLocator.identifyWebAccessibleResources(root, manifest);
    }

    public async getDetails(): Promise<AMOAPI.Details> {
        await this.initialized.waitFor();

        if (this.details === undefined) {
            throw new Error("Details not available.");
        }
        return this.details;
    }

    public listDirectoryContents(path: string): TreeNodeDTO[] {
        const dir = this.root.get(path);

        if (dir instanceof TreeFolder) {
            const contents = Array.from(dir.children.values()).map((tn) =>
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

    public getManifest(): Manifest {
        if (this.manifest === undefined) {
            throw new Error("Manifest not available.");
        }
        return this.manifest;
    }

    public async analyzeHTML(path: string) {
        const scripts = await ScriptFinder.findScriptNodes(path, this.root);

        return {
            scripts: scripts.map((s) => ({
                path: s.path,
                node: s.toDTO(),
            })),
        };
    }

    public async highlightCode(path: string): Promise<HighlightedCode> {
        const file = this.root.get(path) as TreeFile;

        if (!file || file instanceof TreeFolder) {
            throw new Error("Not a file.");
        }

        if (!file.hasTag("code")) {
            throw new Error(`No syntax highlighting support for ${file.name}.`);
        }

        const content: string = await file.entry.getData!(new zip.TextWriter());

        const html = hljs.highlight(content, {
            language: "javascript",
        }).value;

        return {
            language: "javascript",
            code: html,
        };
    }

    public async getFileDownloadURL(
        path: string,
        timeout: number = 10.0
    ): Promise<string> {
        const fileNode = this.root.get(path);

        if (!(fileNode instanceof TreeFile)) {
            throw new Error(`"${path}" is not a file.`);
        }

        const blob: Blob = await fileNode.entry.getData!(new zip.BlobWriter());
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
    language: "javascript";
    code: string;
};
