import * as Comlink from "comlink";
import { StatusListener, WorkerAPI } from "./worker/worker";

export type Inspector = Comlink.Remote<WorkerAPI>;

export async function createInspector(
    extId: string,
    onStatusChange?: StatusListener
): Promise<Inspector> {
    const worker = Comlink.wrap<WorkerAPI>(
        new Worker("worker.bundle.js", { name: "ExtensionWorker" })
    );

    if (onStatusChange) {
        await worker.init(extId, Comlink.proxy(onStatusChange));
    } else {
        await worker.init(extId);
    }

    return worker;
}
