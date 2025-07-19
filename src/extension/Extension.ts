import * as zip from "@zip.js/zip.js";
import prettyBytes from "pretty-bytes";
import type { FSFolder } from "./FileSystem";
import { createFileSystem } from "./FileSystem";
import Translations from "./modules/Translations";
import type { ExtensionSummary } from "./types/ExtensionSummary";
import type { Manifest } from "./types/Manifest";

export default class Extension {
  readonly manifest: Readonly<Manifest>;
  readonly files: FSFolder;
  readonly translations: Translations;

  private constructor(root: FSFolder, manifest: Manifest, translations: Translations) {
    /* Some of the initialization happens in the static create method because the constructor is not async. */

    this.files = root;
    this.manifest = Object.freeze(manifest);
    this.translations = translations;
  }

  /**
   * Create a new `Extension` instance.
   *
   * We use this method instead of the constructor because the constructor is not async.
   * The zip.js APIs are async and we need to get some values to construct the instance.
   */
  static async create(zipData: Blob): Promise<Extension> {
    const zipReader = new zip.ZipReader(new zip.BlobReader(zipData));
    const files = await createFileSystem(zipReader.getEntriesGenerator());

    // Manifest
    const rawManifest = await files.getFile("manifest.json").text();
    const manifest = JSON.parse(rawManifest.replace(/^\/\/.+$/gm, "")) as Manifest;

    // Translations
    const translations = await Translations.create(manifest, files);

    return new Extension(files, manifest, translations);
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

  getLocales() {
    return this.translations.getLocales();
  }

  get meta(): Omit<ExtensionSummary["meta"], "icon"> {
    return {
      name: this.translations.i18nForManifestKey(this.manifest.name),
      version: this.manifest.version,
      source: "file", // FIXME
      author: this.#getAuthor(),
      manifestVersion: this.manifest.manifest_version,
      size: prettyBytes(this.files.uncompressedSize)
    };
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
