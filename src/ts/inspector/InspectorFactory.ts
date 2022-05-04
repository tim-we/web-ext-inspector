import * as Comlink from "comlink";
import { ExtensionId } from "../types/ExtensionId";
import { StatusListener, WorkerAPI } from "./worker/worker";

export type Inspector = Comlink.Remote<WorkerAPI>;

const basePath = (() => {
    if (window.location.pathname.startsWith("/web-ext-inspector/")) {
        return "/web-ext-inspector";
    }
    return "";
})();

export async function createInspector(
    ext: ExtensionId,
    onStatusChange?: StatusListener
): Promise<Inspector> {
    if (onStatusChange) {
        onStatusChange("initializing worker...");
    }

    const worker = Comlink.wrap<WorkerAPI>(
        new Worker(basePath + "/worker.bundle.js", { name: "ExtensionWorker" })
    );

    if (onStatusChange) {
        await worker.init(ext, Comlink.proxy(onStatusChange));
    } else {
        await worker.init(ext);
    }

    return worker;
}
