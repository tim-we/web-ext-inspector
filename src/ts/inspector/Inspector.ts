import * as Comlink from "comlink";
import { WorkerAPI } from "./worker/worker";

export type InspectorReadyState = "loading-details" | "downloading" | "ready";

export type InspectorReadyStateChangeHandler = (
    newState: InspectorReadyState
) => void;

export type Inspector = Comlink.Remote<WorkerAPI>;

export function createInspector(extId: string): Inspector {
    const worker = Comlink.wrap<WorkerAPI>(
        new Worker("worker.bundle.js", { name: "ExtensionWorker" })
    );

    worker.load(extId);

    return worker;
}
