import * as Comlink from "comlink";
import * as zip from "@zip.js/zip.js";
import * as AMOAPI from "./AMOAPI";
import { createFileTree, TreeFile, TreeFolder, TreeNodeDTO } from "./FileTree";
import { Manifest } from "../../types/Manifest";
import * as ManifestExtractor from "./helpers/ManifestExtractor";
import * as ScriptFinder from "./helpers/ScriptFinder";
import AsyncEvent from "../../utils/AsyncEvent";

zip.configure({
    useWebWorkers: false, // this is already a worker
});

export type StatusListener = (status: string) => void;

export class WorkerAPI {
    private statusListener: StatusListener = () => {};
    private root: TreeFolder = new TreeFolder("root");
    private details: AMOAPI.Details | undefined;
    private initialized: AsyncEvent = new AsyncEvent("WorkerInitialized");
    private manifest: Manifest | undefined;
    private backgroundScripts: TreeFile[] = [];
    private contentScripts: TreeFile[] = [];

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

        this.analyze();

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

        this.backgroundScripts = await ScriptFinder.getBackgroundScripts(
            root,
            manifest,
            true
        );

        this.contentScripts = ScriptFinder.getContentScripts(root, manifest);
        this.contentScripts.forEach((file) => file.addTag("content"));

        ScriptFinder.getUserScriptAPI(root, manifest)?.addTag(
            "user-script-api"
        );
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
            return Array.from(dir.children.values()).map((tn) => tn.toDTO());
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

        setTimeout(() => URL.revokeObjectURL(url), timeout * 1000);

        return url;
    }

    private setStatus(status: string) {
        this.statusListener(status);
    }
}

Comlink.expose(new WorkerAPI());
