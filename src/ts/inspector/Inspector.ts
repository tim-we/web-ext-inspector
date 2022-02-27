import * as Comlink from "comlink";
import {
    ExtensionSourceInfo,
    StatusListener,
    WorkerAPI,
} from "./worker/worker";

export type Inspector = Comlink.Remote<WorkerAPI>;

export async function createInspector(
    ext: ExtensionSourceInfo,
    onStatusChange?: StatusListener
): Promise<Inspector> {
    const worker = Comlink.wrap<WorkerAPI>(
        new Worker("/worker.bundle.js", { name: "ExtensionWorker" })
    );

    if (onStatusChange) {
        await worker.init(ext, Comlink.proxy(onStatusChange));
    } else {
        await worker.init(ext);
    }

    return worker;
}
