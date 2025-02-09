import * as zip from "@zip.js/zip.js";
import prettyBytes from "pretty-bytes";
import Runner from "../runner/Runner";
import createUniqueId from "../utilities/unique-id";
import { createFileSystem } from "./FileSystem";
import { FSFolder } from "./FileSystem";
import type { ExtensionData } from "./types/ExtensionData";
import type { Manifest } from "./types/Manifest";
import type { Translations } from "./types/Translations";

export default class Extension {
  readonly id: string;
  readonly manifest: Readonly<Manifest>;
  readonly files: FSFolder;
  readonly #objectURLs = new Map<string, string>();
  readonly #translations: Map<string, Translations>;

  private constructor(
    blob: Blob,
    root: FSFolder,
    manifest: Manifest,
    translations: Map<string, Translations>,
    icon?: string
  ) {
    /* Some of the initialization happens in the static create method because the constructor is not async. */

    this.id = createUniqueId();
    this.files = root;
    this.manifest = Object.freeze(manifest);
    this.#translations = translations;

    this.#objectURLs.set("download", URL.createObjectURL(blob));
    if (icon) {
      this.#objectURLs.set("icon", icon);
    }
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
    const translations = new Map<string, Translations>();
    if (manifest.default_locale !== undefined) {
      // default_locale must be present if the _locales subdirectory is present, must be absent otherwise.
      // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/default_locale

      await Promise.all(
        Array.from(files.getFolder("_locales")!.children.values())
          .filter((node) => node instanceof FSFolder)
          .filter((folder) => folder.getFile("messages.json", false))
          .map(async (folder) => {
            const rawFileContent = await folder.getFile("messages.json").text();
            translations.set(folder.name, JSON.parse(rawFileContent));
          })
      );

      if (!translations.has(manifest.default_locale)) {
        console.warn(`Default locale (${manifest.default_locale}) missing.`);
      }
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

    return {
      id: this.id,
      downloadUrl: this.#objectURLs.get("download")!,
      meta: {
        name: this.#__MSG_i18n(this.manifest.name),
        version: manifest.version,
        icon: this.#objectURLs.get("icon"),
        source: "file", // FIXME
        author: this.#getAuthor(),
        manifestVersion: manifest.manifest_version
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
      },
      translations: {
        locales: Array.from(this.#translations.keys()),
        messages: Object.keys(this.#translations.get(manifest.default_locale ?? "") ?? {}).length, // TODO: count strings from all languages?
        defaultLocale: manifest.default_locale
      }
    };
  }

  i18n(
    messageName: string,
    options: Partial<{ substitutions: string | string[]; locale: string }> = {}
  ): string {
    const { substitutions = [], locale = this.manifest.default_locale } = options;

    if (!locale) {
      return messageName;
    }

    const translations = this.#translations.get(locale);
    if (!translations) {
      return messageName;
    }

    const translation = translations[messageName];

    if (translation !== undefined) {
      if (substitutions.length > 0) {
        // FIXME
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

  /**
   * Get translations of localized manifest strings.
   * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization#internationalizing_manifest.json
   */
  #__MSG_i18n(rawString: string, locale = this.manifest.default_locale): string {
    if (!locale || !this.#translations.has(locale)) {
      return rawString;
    }

    const matches = rawString.match(/^__MSG_(.+)__$/);

    if (matches === null || matches.length !== 2) {
      return rawString;
    }

    const messageName = matches[1];

    const translation = this.#translations.get(locale)![messageName];

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
