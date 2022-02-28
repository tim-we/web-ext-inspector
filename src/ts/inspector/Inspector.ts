import * as Comlink from "comlink";
import {
    ExtensionSourceInfo,
    StatusListener,
    WorkerAPI,
} from "./worker/worker";

export type Inspector = Comlink.Remote<WorkerAPI>;

const basePath = (() => {
    if (window.location.pathname.startsWith("/web-ext-inspector/")) {
        return "/web-ext-inspector";
    }
    return "";
})();

export async function createInspector(
    ext: ExtensionSourceInfo,
    onStatusChange?: StatusListener
): Promise<Inspector> {
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
