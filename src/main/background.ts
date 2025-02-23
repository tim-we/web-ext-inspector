import * as zip from "@zip.js/zip.js";
import * as Comlink from "comlink";

import { Session } from "./Session";

zip.configure({
  useWebWorkers: false // this is already a worker
});

const sessions = new Map<Session["id"], Session>();

const exposedMethods = {
  async startSession(
    url: string,
    onStatusUpdate?: UpdateStatusCallback
  ): Promise<Session & Comlink.ProxyMarked> {
    onStatusUpdate?.("requesting");
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Download failed.");
    }

    onStatusUpdate?.("downloading");
    const blob = await response.blob();
    console.info("Download successful.");

    onStatusUpdate?.("unpacking");
    const session = await Session.create(blob);
    sessions.set(session.id, session);

    return Comlink.proxy(session);
  }
};

export type BackgroundWorkerApi = typeof exposedMethods;

Comlink.expose(exposedMethods);

type UpdateStatusCallback = (state: LoadingStatus) => unknown;

export type LoadingStatus = "worker-init" | "requesting" | "downloading" | "unpacking";
