import * as Comlink from "comlink";
import {
    InspectorReadyState,
    InspectorReadyStateChangeHandler,
} from "../Inspector";
import * as zip from "@zip.js/zip.js";
import * as AMOAPI from "./AMOAPI";
import { createFileTree, TreeFile, TreeFolder, TreeNodeDTO } from "./FileTree";
import { Manifest } from "../../types/Manifest";

zip.configure({
    useWebWorkers: false, // this is already a worker
});

export class WorkerAPI {
    private readyStateHandlers: Set<InspectorReadyStateChangeHandler> =
        new Set();
    private root: TreeFolder = new TreeFolder("root");
    private details: AMOAPI.Details | undefined;
    private readyState: InspectorReadyState = "loading-details";
    private manifest: Manifest | undefined;

    public onReadyStateChange(callback: InspectorReadyStateChangeHandler) {
        this.readyStateHandlers.add(callback);
    }

    public async load(extId: string): Promise<void> {
        this.setReadyState("loading-details");
        const details = (this.details = await AMOAPI.getInfo(extId));

        const webExts = details.current_version.files.filter(
            (file) => file.is_webextension
        );

        if (webExts.length === 0) {
            throw new Error("No web extension files.");
        }

        this.setReadyState("downloading");
        //@ts-ignore
        const httpReader = new zip.HttpReader(webExts[0].url);

        const reader = new zip.ZipReader(httpReader);
        this.root = createFileTree(await reader.getEntries());

        this.loadManifest();

        await reader.close();
        this.setReadyState("ready");
    }

    private async loadManifest() {
        const manifestNode = this.root.get("manifest.json") as TreeFile;
        if (!(manifestNode instanceof TreeFile)) {
            throw new Error("Could not find manifest.json.");
        }
        const entry = manifestNode.entry;

        if (entry.getData === undefined) {
            throw new Error("Unknown error.");
        }

        const text: string = await entry.getData(new zip.TextWriter());
        this.manifest = JSON.parse(text);
    }

    public async getDetails(): Promise<AMOAPI.Details> {
        if (this.readyState === "loading-details") {
            let resolver: InspectorReadyStateChangeHandler;
            await new Promise((resolve) => {
                resolver = resolve;
                this.onReadyStateChange(resolve);
            });
            this.readyStateHandlers.delete(resolver!);
        }
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

    private setReadyState(newState: InspectorReadyState) {
        this.readyState = newState;
        this.readyStateHandlers.forEach((cb) => cb(newState));
    }
}

Comlink.expose(new WorkerAPI());
