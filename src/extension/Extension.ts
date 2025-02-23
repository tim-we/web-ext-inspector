import * as zip from "@zip.js/zip.js";
import prettyBytes from "pretty-bytes";
import { sum } from "../utilities/iterators";
import { createFileSystem } from "./FileSystem";
import { FSFolder } from "./FileSystem";
import type { ExtensionSummary } from "./types/ExtensionSummary";
import type { Manifest } from "./types/Manifest";
import type { Translations } from "./types/Translations";

export default class Extension {
  readonly manifest: Readonly<Manifest>;
  readonly files: FSFolder;
  readonly #translations: Map<string, Translations>;

  private constructor(root: FSFolder, manifest: Manifest, translations: Map<string, Translations>) {
    /* Some of the initialization happens in the static create method because the constructor is not async. */

    this.files = root;
    this.manifest = Object.freeze(manifest);
    this.#translations = translations;
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

    return new Extension(files, manifest, translations);
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

  /**
   * Get the translated messages for the given locale and some meta information including:
   * - messages (keys) that are missing (not translated) in this locale
   * - the percentage of translated messages in this locale
   */
  getTranslations(locale: string): TranslationsInfo | undefined {
    let actualLocale = locale;
    let messages = this.#translations.get(actualLocale);

    if (!messages && locale.includes("-")) {
      // If the requested locale is en-US we can use en as a fallback.
      actualLocale = locale.split("-")[0];
      messages = this.#translations.get(actualLocale);
    }

    if (!messages) {
      return undefined;
    }

    const allMessageKeys = new Set(this.#translations.values().flatMap((t) => Object.keys(t)));
    const translatedKeys = new Set(Object.keys(messages));
    const missingKeys = allMessageKeys.difference(translatedKeys);

    return {
      percentage: translatedKeys.size / allMessageKeys.size,
      missingKeys: missingKeys,
      messages: messages,
      locale: actualLocale
    };
  }

  getLocales() {
    return [...this.#translations.keys()];
  }

  get meta(): Omit<ExtensionSummary["meta"], "icon"> {
    return {
      name: this.#__MSG_i18n(this.manifest.name),
      version: this.manifest.version,
      source: "file", // FIXME
      author: this.#getAuthor(),
      manifestVersion: this.manifest.manifest_version,
      size: prettyBytes(this.files.uncompressedSize)
    };
  }

  get translationInfo(): ExtensionSummary["translations"] {
    const messageKeys = new Set(this.#translations.values().flatMap((t) => Object.keys(t))).size;
    const translatedMessages = sum(this.#translations.values().map((t) => Object.keys(t).length));

    return {
      locales: this.getLocales(),
      messages: messageKeys,
      defaultLocale: this.manifest.default_locale,
      percentage:
        this.#translations.size * messageKeys > 0
          ? translatedMessages / (this.#translations.size * messageKeys)
          : undefined
    };
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

export type TranslationsInfo = {
  percentage: number;
  missingKeys: Set<string>;
  messages: Translations;
  locale: string;
};
