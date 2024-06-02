import type { SupportedLanguage } from "../code-renderer/CodeRenderer";
import type { FSNodeDTO } from "../extension/FileSystem";
import type { ExtensionData } from "../extension/types/ExtensionData";

import * as zip from "@zip.js/zip.js";
import * as Comlink from "comlink";

import Extension, { type PermissionsInfo } from "../extension/Extension";
import Runner from "../runner/Runner";

// TODO: consider dynamically importing this (code splitting)
import { renderCode } from "../code-renderer/CodeRenderer";
import { compareFSNodes } from "../utilities/fs-nodes";

zip.configure({
  useWebWorkers: false // this is already a worker
});

const sessions = new Map<string, InspectSession>();

const exposedMethods = {
  async loadExtension(url: string): Promise<ExtensionData> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Download failed.");
    }

    const blob = await response.blob();
    console.info("Download successful.");
    const extension = await Extension.create(blob);

    sessions.set(extension.id, { extension });
    return extension.getSummary();
  },

  async unloadExtension(sessionId: string): Promise<void> {
    const session = sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found.");
    }
    sessions.delete(sessionId);
    session.extension.free();
    if (session.runner) {
      session.runner.stop();
    }
  },

  async run(sessionId: string): Promise<void> {
    const session = sessions.get(sessionId)!;

    if (session.runner) {
      throw new Error("already running");
    }

    session.runner = await Runner.create(session.extension);
  },

  /**
   * Get a list of direct children of the specified folder.
   * Does not contain the entire subtree.
   * List will be sorted, folders come before files.
   */
  getDirectoryContents(sessionId: string, path: string): FSNodeDTO[] {
    const extension = sessions.get(sessionId)!.extension!;
    const folder = extension.files.getFolder(path)!;
    if (folder === undefined) {
      throw new Error(`Failed to get directory contents for "${path}"`);
    }
    const children = Array.from(folder.children.values())
      .map((node) => node.asJSON())
      .sort(compareFSNodes);

    return children;
  },

  async getPrettyCode(sessionId: string, path: string): Promise<HighlightedCode> {
    const extension = sessions.get(sessionId)!.extension!;
    const file = extension.files.getFile(path);
    const content = await file.text();

    let language: SupportedLanguage = "plaintext";

    if (/\.(htm|html|xml)$/i.test(file.name)) {
      language = "markup";
    } else if (/\.(js|mjs)$/i.test(file.name)) {
      language = "javascript";
    } else if (/\.json$/i.test(file.name)) {
      language = "json";
    } else if (/\.css$/i.test(file.name)) {
      language = "css";
    }

    const html = renderCode(content, language);

    return {
      language,
      code: html
    };
  },

  getPermissions(sessionId: string): PermissionsInfo {
    const { extension } = sessions.get(sessionId)!;

    return extension.getPermissions();
  },

  getFileDownloadUrl(sessionId: string, path: string): Promise<string> {
    const extension = sessions.get(sessionId)!.extension!;
    return extension.getFileURL(path);
  }
};

export type BackgroundWorkerApi = typeof exposedMethods;

export type HighlightedCode = {
  language: SupportedLanguage;
  code: string;
};

Comlink.expose(exposedMethods);

type InspectSession = {
  extension: Extension;
  runner?: Runner;
};
