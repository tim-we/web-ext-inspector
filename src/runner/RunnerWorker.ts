/// <reference lib="webworker" />
import * as Comlink from "comlink";
import createBrowserApi from "./environment/ext-api";

const exposedMethods = {
  // TODO
};

export type RuntimeWorkerApi = typeof exposedMethods;

Comlink.expose(exposedMethods);
