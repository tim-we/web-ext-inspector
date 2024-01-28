import type { BackgroundWorkerApi } from "./background";

import * as Comlink from "comlink";

const worker = new Worker("js/worker/background.js", { name: "Background" });

const wrappedWorker = Comlink.wrap<BackgroundWorkerApi>(worker);

export default wrappedWorker;
