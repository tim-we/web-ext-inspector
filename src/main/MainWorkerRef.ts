import * as Comlink from "comlink";
import type { BackgroundWorkerApi } from "./background";

const worker = new Worker(new URL("./background", import.meta.url), {
  name: "Background",
  type: "module"
});

const wrappedWorker = Comlink.wrap<BackgroundWorkerApi>(worker);

export default wrappedWorker;
