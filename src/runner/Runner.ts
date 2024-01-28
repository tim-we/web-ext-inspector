import type Extension from "../extension/Extension";
import Browser from "./browser/Browser";

const setupScriptPromise = (async () => {
  const response = await fetch("env-setup.js");
  if (!response.ok) {
    throw new Error("Failed to load setup script.");
  }
  const blob = await response.blob();
  return blob.slice(0, blob.size, "text/javascript");
})();

export default class Runner {
  readonly #browser = new Browser();
  readonly #extension: Extension;
  readonly #worker: Worker;

  private constructor(extension: Extension, worker: Worker) {
    this.#extension = extension;
    this.#worker = worker;
    worker.addEventListener("message", this.#handleWorkerMessage);
  }

  stop(): void {
    this.#worker.removeEventListener("message", this.#handleWorkerMessage);
    this.#worker.terminate();
  }

  static supports(extension: Extension): boolean {
    const manifest = extension.manifest;

    if (manifest.manifest_version !== 2) {
      return false;
    }

    if (manifest.background === undefined) {
      return false;
    }

    if (manifest.background.page !== undefined) {
      // FIXME
      return false;
    }

    if (manifest.background.scripts === undefined || manifest.background.scripts.length === 0) {
      return false;
    }

    return true;
  }

  static async create(extension: Extension): Promise<Runner> {
    if (!Runner.supports(extension)) {
      throw new Error("Runner does not support this extension.");
    }

    const manifest = extension.manifest;
    const setupScriptURL = URL.createObjectURL(await setupScriptPromise);
    const extensionScriptURLs = await Promise.all(
      manifest.background!.scripts.map((script) => extension.getFileURL(script, 0))
    );

    const workerScriptBlob = new Blob(
      [
        "const nativeImport = importScripts;\n",
        `nativeImport("${setupScriptURL}");\n`,
        "(function extensionCode(globalThis, self, indexedDB, location) {",
        ...extensionScriptURLs.map((url) => `nativeImport("${url}");\n`),
        "})({}, {}, null, null);\n",
        `self.postMessage("import:success");\n`
      ],
      { type: "text/javascript" }
    );

    const workerUrl = URL.createObjectURL(workerScriptBlob);
    const worker = new Worker(workerUrl, {
      name: "Extension",
      type: "classic" // FIXME: Bugzilla Bug 1247687 (Firefox 110?)
    });

    await new Promise<void>((resolve) => {
      worker.onmessage = (e) => {
        if (e.data === "setup:complete") {
          worker.onmessage = null;
          resolve();
        }
      };
    });

    return new Runner(extension, worker);
  }

  readonly #handleWorkerMessage = ({ data }: MessageEvent) => {
    if (typeof data === "string") {
      console.log(data);
      return;
    }

    console.log("api call detected", data);
  };
}
