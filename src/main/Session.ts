import * as Comlink from "comlink";

import type { SupportedLanguage } from "../code-renderer/CodeRenderer";
import Extension, { type TranslationsInfo } from "../extension/Extension";
import * as FSCursor from "../extension/FSCursor";
import type { FSNodeDTO } from "../extension/FileSystem";
import Runner from "../runner/Runner";
import createUniqueId from "../utilities/unique-id";

// TODO: consider dynamically importing this (code splitting)
import { renderCode } from "../code-renderer/CodeRenderer";
import type { ExtensionSummary } from "../extension/types/ExtensionSummary";

export class Session {
  readonly id: string;
  readonly #extension: Extension;
  readonly #objectURLs = new Map<string, string>();
  #runner: Runner | null = null;

  private constructor(extension: Extension) {
    this.id = createUniqueId();
    this.#extension = extension;
  }

  static async create(zipData: Blob): Promise<Session> {
    const extension = await Extension.create(zipData);
    const iconPath = getIconPath(extension.manifest, extension.files);

    const session = new Session(extension);

    if (iconPath) {
      session.#objectURLs.set(
        "icon",
        URL.createObjectURL(await extension.files.getFile(iconPath).asBlob())
      );
    }

    session.#objectURLs.set("download", URL.createObjectURL(zipData));

    return session;
  }

  getExtension(): Readonly<Extension> & Comlink.ProxyMarked {
    return Comlink.proxy(this.#extension);
  }

  getSummary(): ExtensionSummary {
    const extension = this.#extension;
    const manifest = extension.manifest;

    const hostPermissions = [
      ...(manifest.permissions ?? []),
      ...(manifest.optional_permissions ?? [])
    ].filter(isHostPermission).length;

    const files = {
      javascript: extension.files.countFiles(/\.(js|mjs)$/),
      html: extension.files.countFiles(/\.(htm|html)$/),
      css: extension.files.countFiles(/\.css$/),
      json: extension.files.countFiles(/\.json$/)
    };

    const backgroundScripts = ((bg) => {
      if (bg === undefined) {
        return false;
      }
      if (bg.page !== undefined) {
        return true;
      }
      if (bg.scripts?.length > 0) {
        return true;
      }
      return false;
    })(manifest.background);

    return {
      meta: {
        ...extension.meta,
        icon: this.#objectURLs.get("icon")
      },
      permissions: {
        required: manifest.permissions?.length ?? 0,
        optional: manifest.optional_permissions?.length ?? 0,
        host: hostPermissions
      },
      files: {
        ...files,
        other: extension.files.numFiles - (files.javascript + files.html + files.css + files.json)
      },
      dynamicAnalysis: {
        supported: Runner.supports(this.#extension),
        background: backgroundScripts,
        jsType: Runner.supports(this.#extension) ? "classic" : undefined
      },
      translations: extension.translationInfo
    };
  }

  /**
   * Get a list of direct children of the specified folder.
   * Does not contain the entire subtree.
   * List will be sorted, folders come before files.
   */
  getDirectoryContents(path: string): FSNodeDTO[] {
    const folder = this.#extension.files.getFolder(path)!;
    if (folder === undefined) {
      throw new Error(`Failed to get directory contents for "${path}"`);
    }
    const children = Array.from(folder.children.values()).map((node) => node.asJSON());

    return children;
  }

  getTranslations(locale: string): TranslationsInfo | undefined {
    return this.#extension.getTranslations(locale);
  }

  changeFileSystemCursor(currentNode: string, key: KeyboardEvent["key"]): string {
    return FSCursor.move(this.#extension.files, currentNode, key).asJSON().path;
  }

  async getPrettyCode(path: string): Promise<HighlightedCode> {
    const file = this.#extension.files.getFile(path);
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
  }

  async run() {
    this.#runner = await Runner.create(this.#extension);
  }

  free() {
    this.#objectURLs.forEach((url) => URL.revokeObjectURL(url));
  }
}

function getIconPath(
  manifest: Extension["manifest"],
  root: Extension["files"]
): string | undefined {
  if (!manifest.icons) {
    return;
  }

  const sizes = Object.entries(manifest.icons).map(([size, path]) => ({
    size: Number.parseInt(size, 10),
    path
  }));

  if (sizes.length === 0) {
    return;
  }

  // sort sizes descending
  sizes.sort((a, b) => b.size - a.size);

  const optimalSizes = sizes
    .filter(({ path }) => root.getFile(path, true))
    .filter(({ size }) => size >= 48 && size <= 96);

  const { path } = optimalSizes[0] ?? sizes[0];

  return path;
}

function isHostPermission(permission: string): boolean {
  if (permission === "<all_urls>") {
    return true;
  }

  return /\:\/\//.test(permission);
}

export type HighlightedCode = {
  language: SupportedLanguage;
  code: string;
};
