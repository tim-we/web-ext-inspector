// @ts-nocheck
/// <reference lib="webworker" />
declare const self: WorkerGlobalScope["self"];

import createBrowserApi from "./ext-api";

globalThis.browser = createBrowserApi(self);

globalThis.createBrowserApi = undefined;

// @ts-ignore
globalThis.window = {
  name: "",
  document: {
    title: "",
    // @ts-ignore
    body: {},
    defaultView: globalThis.window,
    querySelector: () => null,
    // @ts-ignore
    querySelectorAll: () => []
  }
};
globalThis.window.self = globalThis.window;

globalThis.importScripts = (...args) => {
  throw new Error(`Attempt to import scripts ${args.join(", ")}`);
};

globalThis.opener = null;
// @ts-ignore
globalThis.parent = globalThis;
globalThis.close = () => {
  throw new Error("Attempt to close.");
};
globalThis.eval = (code: string) => console.error("eval", code);

self.postMessage("setup:complete");

// TODOs:
// - report errors
// - replace importScripts with no-op (not possible?!)
// - implement fetch and XMLHttpRequest
// - implement local storage/session storage
// - indexedDB
// - prototype pollution ?
// - console
