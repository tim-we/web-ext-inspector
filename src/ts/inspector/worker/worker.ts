import * as Comlink from "comlink";
import {
    InspectorReadyState,
    InspectorReadyStateChangeHandler,
} from "../Inspector";
import * as zip from "@zip.js/zip.js";
import * as AMOAPI from "./AMOAPI";
import { createFileTree, TreeFolder, TreeNodeDTO } from "./FileTree";

zip.configure({
    useWebWorkers: false, // this is already a worker
});

export class WorkerAPI {
    private readyStateHandlers: Set<InspectorReadyStateChangeHandler> =
        new Set();
    private root: TreeFolder = new TreeFolder("root");
    private details: AMOAPI.Details | undefined;
    private readyState: InspectorReadyState = "loading-details";

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
        await reader.close();
        this.setReadyState("ready");
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

    private setReadyState(newState: InspectorReadyState) {
        this.readyState = newState;
        this.readyStateHandlers.forEach((cb) => cb(newState));
    }
}

Comlink.expose(new WorkerAPI());
