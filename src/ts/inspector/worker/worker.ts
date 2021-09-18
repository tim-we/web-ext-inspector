import * as Comlink from "comlink";
import * as zip from "@zip.js/zip.js";
import * as AMOAPI from "./AMOAPI";
import { createFileTree, TreeFile, TreeFolder, TreeNodeDTO } from "./FileTree";
import { Manifest } from "../../types/Manifest";
import * as ManifestExtractor from "./helpers/ManifestExtractor";
import * as ScriptFinder from "./helpers/ScriptFinder";
import * as ResourceLocator from "./helpers/ResourceLocator";
import AsyncEvent from "../../utils/AsyncEvent";
import { format, highlight, SupportedLanguage } from "./Preprocessor";
import { ExtensionDetails } from "../../types/ExtensionDetails";

zip.configure({
    useWebWorkers: false, // this is already a worker
});

export type ExtensionSourceInfo =
    | {
          type: "amo";
          id: string;
      }
    | { type: "url"; url: string };

export type StatusListener = (status: string) => void;

export class WorkerAPI {
    private statusListener: StatusListener = () => {};
    private root: TreeFolder = new TreeFolder("root");
    private details: ExtensionDetails | undefined;
    private initialized: AsyncEvent = new AsyncEvent("WorkerInitialized");
    private manifest: Manifest | undefined;

    public async init(
        ext: ExtensionSourceInfo,
        statusListener?: StatusListener
    ): Promise<void> {
        this.statusListener = statusListener ?? this.statusListener;

        let reader: zip.HttpReader | zip.BlobReader;
        let size = 0;

        if (ext.type === "amo") {
            await this.loadFromAMO(ext.id);
            const url = this.details!.download_url;

            this.setStatus("downloading & extracting");
            reader = new zip.HttpReader(url);
        } else {
            const response = await fetch(ext.url);
            const blob = await response.blob();
            size = blob.size;
            reader = new zip.BlobReader(blob);
        }

        const zipReader = new zip.ZipReader(reader);
        this.root = createFileTree(await zipReader.getEntries());
        this.manifest = await ManifestExtractor.getManifest(this.root);

        if (this.details === undefined) {
            const url = ext.type === "url" ? ext.url : "";
            this.details = await this.createDetailsFromZip(url, size);
        }

        await this.analyze();

        this.setStatus("");
        await zipReader.close();
        this.initialized.fire();
    }

    private async loadFromAMO(extId: string): Promise<void> {
        this.setStatus("loading meta data");
        const details = await AMOAPI.getInfo(extId);

        const webExts = details.current_version.files.filter(
            (file) => file.is_webextension
        );

        if (webExts.length === 0) {
            throw new Error("No web extension files.");
        }

        this.details = {
            source: "AMO",
            authors: details.authors.map((a) => a.name || a.username),
            name: details.name["en-US"],
            last_updated: details.last_updated,
            created: details.created,
            version: details.current_version.version,
            size: webExts[0].size,
            download_url: webExts[0].url,
            icon_url: details.icon_url,
        };
    }

    private async createDetailsFromZip(
        url: string,
        size: number
    ): Promise<ExtensionDetails> {
        const manifest = this.manifest;

        if (manifest === undefined) {
            throw new Error("Manifest undefined.");
        }

        let iconUrl: string | undefined = undefined;

        if (manifest.icons && manifest.icons["48"]) {
            iconUrl = await this.getFileDownloadURL(manifest.icons["48"]);
        }

        return {
            source: "url",
            authors: [manifest.author ?? "undefined"],
            name: manifest.name,
            version: manifest.version,
            icon_url: iconUrl,
            size,
            download_url: url,
        };
    }

    private async analyze() {
        this.setStatus("analyzing");
        const root = this.root;
        const manifest = this.manifest;

        if (manifest === undefined) {
            throw new Error("Manifest undefined.");
        }

        await ScriptFinder.identifyBackgroundScripts(root, manifest);

        ScriptFinder.identifyContentScripts(root, manifest);
        ScriptFinder.identifySidebarScripts(root, manifest);
        ScriptFinder.identifyUserScriptAPI(root, manifest);
        ScriptFinder.identifyActionScripts(root, manifest);

        ResourceLocator.identifyWebAccessibleResources(root, manifest);
    }

    public async getDetails(): Promise<ExtensionDetails> {
        await this.initialized.waitFor();

        if (this.details === undefined) {
            throw new Error("Details not available.");
        }
        return this.details;
    }

    public listDirectoryContents(path: string): TreeNodeDTO[] {
        const dir = this.root.get(path);

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

    public async getPrettyCode(path: string): Promise<HighlightedCode> {
        const file = this.root.get(path) as TreeFile;

        if (!file || file instanceof TreeFolder) {
            throw new Error(`File ${path} not found.`);
        }

        let content: string = await file.entry.getData!(new zip.TextWriter());
        let language: SupportedLanguage = "plaintext";

        if (/\.(htm|html|xml)$/i.test(file.name)) {
            language = "xml";
        } else if (/\.(js|mjs|json)$/i.test(file.name)) {
            language = "javascript";
        } else if (/\.css$/i.test(file.name)) {
            language = "css";
        }

        content = format(content, language);

        const html = highlight(content, language);

        return {
            language,
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
