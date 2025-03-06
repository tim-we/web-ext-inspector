import { sum } from "../../utilities/iterators";
import { FSFolder } from "../FileSystem";
import type { ExtensionSummary } from "../types/ExtensionSummary";
import type { Manifest } from "../types/Manifest";

export default class Translations {
  readonly default_locale: Manifest["default_locale"];
  readonly #data: Map<LocaleId, LocaleData>;

  private constructor(default_locale: Manifest["default_locale"], data: Map<LocaleId, LocaleData>) {
    this.default_locale = default_locale;
    this.#data = data;
  }

  static async create(manifest: Manifest, files: FSFolder): Promise<Translations> {
    const data = new Map<LocaleId, LocaleData>();

    if (manifest.default_locale !== undefined) {
      // default_locale must be present if the _locales subdirectory is present, must be absent otherwise.
      // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/default_locale

      await Promise.all(
        Array.from(files.getFolder("_locales")!.children.values())
          .filter((node) => node instanceof FSFolder)
          .filter((folder) => folder.getFile("messages.json", false))
          .map(async (folder) => {
            const rawFileContent = await folder.getFile("messages.json").text();
            data.set(folder.name, JSON.parse(rawFileContent));
          })
      );

      if (!data.has(manifest.default_locale)) {
        console.warn(`Default locale (${manifest.default_locale}) missing.`);
      }
    }

    return new Translations(manifest.default_locale, data);
  }

  i18n(
    messageName: string,
    options: Partial<{ substitutions: string | string[]; locale: string }> = {}
  ): string {
    const { substitutions = [], locale = this.default_locale } = options;

    if (!locale) {
      return messageName;
    }

    const translations = this.#data.get(locale);
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
   * Get translations of localized manifest strings.
   * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization#internationalizing_manifest.json
   */
  i18nForManifestKey(rawString: string, locale = this.default_locale): string {
    if (!locale || !this.#data.has(locale)) {
      return rawString;
    }

    const matches = rawString.match(/^__MSG_(.+)__$/);

    if (matches === null || matches.length !== 2) {
      return rawString;
    }

    const messageName = matches[1];

    const translation = this.#data.get(locale)![messageName];

    if (translation !== undefined) {
      return translation.message;
    }

    return rawString;
  }

  getLocales() {
    return [...this.#data.keys()];
  }

  /**
   * Get the translated messages for the given locale and some meta information including:
   * - messages (keys) that are missing (not translated) in this locale
   * - the percentage of translated messages in this locale
   */
  getLocaleData(locale: string): LocaleInfo | undefined {
    let actualLocale = locale;
    let messages = this.#data.get(actualLocale);

    if (!messages && locale.includes("-")) {
      // If the requested locale is en-US we can use en as a fallback.
      actualLocale = locale.split("-")[0];
      messages = this.#data.get(actualLocale);
    }

    if (!messages) {
      return undefined;
    }

    const allMessageKeys = new Set(this.#data.values().flatMap((t) => Object.keys(t)));
    const translatedKeys = new Set(Object.keys(messages));
    const missingKeys = allMessageKeys.difference(translatedKeys);

    return {
      percentage: translatedKeys.size / allMessageKeys.size,
      missingKeys: missingKeys,
      messages: messages,
      locale: actualLocale
    };
  }

  getSummary(): ExtensionSummary["translations"] {
    const messageKeys = new Set(this.#data.values().flatMap((t) => Object.keys(t))).size;
    const translatedMessages = sum(this.#data.values().map((t) => Object.keys(t).length));

    return {
      locales: this.getLocales(),
      messages: messageKeys,
      defaultLocale: this.default_locale,
      percentage:
        this.#data.size * messageKeys > 0
          ? translatedMessages / (this.#data.size * messageKeys)
          : undefined
    };
  }
}

type LocaleId = string;

/**
 * Describes the i18n translations for a single locale.
 * See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization for details.
 */
export type LocaleData = Record<
  string,
  {
    message: string;
    description?: string;
    placeholders?: Record<
      string,
      {
        content: string;
        example?: string;
      }
    >;
  }
>;

export type LocaleInfo = {
  percentage: number;
  missingKeys: Set<string>;
  messages: LocaleData;
  locale: string;
};
