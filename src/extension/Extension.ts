import * as zip from "@zip.js/zip.js";
import prettyBytes from "pretty-bytes";
import Runner from "../runner/Runner";
import createUniqueId from "../utilities/unique-id";
import { createFileSystem } from "./FileSystem";
import type { FSFolder } from "./FileSystem";
import type { ExtensionData } from "./types/ExtensionData";
import type { Manifest } from "./types/Manifest";
import type { Translations } from "./types/Translations";

export default class Extension {
  readonly id: string;
  readonly manifest: Readonly<Manifest>;
  readonly files: FSFolder;
  readonly #objectURLs = new Map<string, string>();
  #translations: Translations | undefined;

  private constructor(
    blob: Blob,
    root: FSFolder,
    manifest: Manifest,
    translations?: Translations,
    icon?: string
  ) {
    this.id = createUniqueId();
    this.files = root;
    this.manifest = Object.freeze(manifest);
    this.#translations = translations;
    this.#objectURLs.set("download", URL.createObjectURL(blob));
    if (icon) {
      this.#objectURLs.set("icon", icon);
    }
  }

  static async create(zipData: Blob): Promise<Extension> {
    const zipReader = new zip.ZipReader(new zip.BlobReader(zipData));
    const files = await createFileSystem(zipReader.getEntriesGenerator());

    // Manifest
    const rawManifest = await files.getFile("manifest.json").text();
    const manifest = JSON.parse(rawManifest.replace(/^\/\/.+$/gm, "")) as Manifest;

    // Translations
    let translations: Translations | undefined;
    if (manifest.default_locale !== undefined) {
      const messagesFile = files.getFile(`_locales/${manifest.default_locale}/messages.json`);
      translations = JSON.parse(await messagesFile.text());
    }

    // Icon
    const iconPath = getIconPath(manifest, files);
    const iconURL = iconPath
      ? URL.createObjectURL(await files.getFile(iconPath).asBlob())
      : undefined;

    return new Extension(zipData, files, manifest, translations, iconURL);
  }

  getSummary(): ExtensionData {
    const manifest = this.manifest;

    const hostPermissions = [
      ...(manifest.permissions ?? []),
      ...(manifest.optional_permissions ?? [])
    ].filter(isHostPermission).length;

    const files = {
      javascript: this.files.countFiles(/\.(js|mjs)$/),
      html: this.files.countFiles(/\.(htm|html)$/),
      css: this.files.countFiles(/\.css$/)
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

    const locales = 1; // TODO

    return {
      id: this.id,
      downloadUrl: this.#objectURLs.get("download")!,
      meta: {
        name: this.#__MSG_i18n(this.manifest.name),
        version: manifest.version,
        icon: this.#objectURLs.get("icon"),
        source: "file", // FIXME
        author: this.#getAuthor(),
        locales
      },
      permissions: {
        required: manifest.permissions?.length ?? 0,
        optional: manifest.optional_permissions?.length ?? 0,
        host: hostPermissions
      },
      files: {
        ...files,
        other: this.files.numFiles - (files.javascript + files.html + files.css),
        size: prettyBytes(this.files.uncompressedSize)
      },
      dynamicAnalysis: {
        supported: Runner.supports(this),
        background: backgroundScripts,
        jsType: Runner.supports(this) ? "classic" : undefined
      }
    };
  }

  i18n(messageName: string, substitutions: string | string[] = []): string {
    if (!this.#translations) {
      return messageName;
    }

    const translation = this.#translations[messageName];

    if (translation !== undefined) {
      if (substitutions.length > 0) {
        console.warn("Substitutions currently not supported.");
      }
      return translation.message;
    }

    return messageName;
  }

  /**
   * Get a blob: URL for the given file.
   * If timeout is a positive number the URL will be revoked automatically.
   * @param path path to file
   * @param timeout in seconds
   */
  async getFileURL(path: string, timeout = 10): Promise<string> {
    const file = this.files.getFile(path);
    const blob = await file.asBlob();
    const url = URL.createObjectURL(blob);

    if (timeout > 0.0) {
      setTimeout(() => URL.revokeObjectURL(url), timeout * 1000);
    }
    return url;
  }

  getPermissions(): PermissionsInfo {
    // TODO: manifest v3 has an additional field for host permissions
    const permissions = this.manifest.permissions ?? [];
    const optionalPermissions = this.manifest.optional_permissions ?? [];

    return {
      api: {
        required: permissions.filter((p) => !isHostPermission(p)),
        optional: optionalPermissions.filter((p) => !isHostPermission(p))
      },
      host: {
        required: permissions.filter(isHostPermission),
        optional: optionalPermissions.filter(isHostPermission)
      }
    };
  }

  free() {
    this.#objectURLs.forEach((url) => URL.revokeObjectURL(url));
  }

  #__MSG_i18n(rawString: string): string {
    if (!this.#translations) {
      return rawString;
    }

    const matches = rawString.match(/^__MSG_(.+)__$/);

    if (matches === null || matches.length !== 2) {
      return rawString;
    }

    const messageName = matches[1];

    const translation = this.#translations[messageName];

    if (translation !== undefined) {
      return translation.message;
    }

    return rawString;
  }

  #getAuthor(): string | undefined {
    const author = this.manifest.author;

    if (author === undefined || typeof author === "string") {
      return author;
    }

    if (typeof author === "object") {
      if (author.email) {
        return author.email;
      }
    }

    return undefined;
  }
}

function getIconPath(manifest: Manifest, root: FSFolder): string | undefined {
  if (!manifest.icons) {
    return;
  }

  const sizes = Object.entries(manifest.icons).map(([size, path]) => ({
    size: parseInt(size, 10),
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

  return /:\/\//.test(permission);
}

export type PermissionsInfo = {
  api: {
    required: string[];
    optional: string[];
  };
  host: {
    required: string[];
    optional: string[];
  };
};
