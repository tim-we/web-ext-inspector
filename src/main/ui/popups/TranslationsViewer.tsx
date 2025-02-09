import type { FunctionComponent } from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";
import { useState, useEffect } from "preact/hooks";
import wrappedWorker from "../../MainWorkerRef";
import type { TranslationsInfo } from "../../../extension/Extension";

type ViewerProps = { extId: ExtensionId; meta: ExtensionData["translations"] };

const TranslationsViewer: FunctionComponent<ViewerProps> = ({ extId, meta }) => {
  const [selectedLocales, setSelectedLocales] = useState<readonly string[]>([]);
  const [loadedLocales, setLoadedLocales] = useState<Map<string, TranslationsInfo>>(new Map());
  const defaultLocale = loadedLocales.get(meta.defaultLocale!);
  const allKeys = defaultLocale
    ? [...Object.keys(defaultLocale.messages), ...defaultLocale.missingKeys]
    : [];

  // Set initially selected locales.
  useEffect(() => {
    setSelectedLocales(
      Array.from(new Set(navigator.languages).intersection(new Set(meta.locales)))
    );
  }, [meta.locales]);

  // Load missing locales.
  useEffect(() => {
    if (selectedLocales.length === loadedLocales.size) {
      return;
    }

    const notLoadedLocales = Array.from(
      new Set(selectedLocales).difference(new Set(loadedLocales.keys()))
    );
    const copiedMap = new Map(loadedLocales);

    Promise.all(
      notLoadedLocales.map((locale) => wrappedWorker.getTranslations(extId, locale))
    ).then((results) => {
      for (const result of results) {
        if (result) {
          copiedMap.set(result.locale, result);
        }
      }
      setLoadedLocales(copiedMap);
    });
  }, [extId, selectedLocales, loadedLocales]);

  return (
    <table>
      <thead>
        <tr>
          <th>Key</th>
          {selectedLocales.map((locale) => (
            <th key={locale}>{intlLocaleDisplayNames.of(locale) ?? locale}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {allKeys.map((key) => (
          <tr key={key}>
            <td title={key}>{key}</td>
            {selectedLocales.map((locale) => {
              const translations = loadedLocales.get(locale);

              if (!translations) {
                return <td key={`${key}:${locale}`}>...</td>;
              }

              if (!Object.hasOwn(translations.messages, key)) {
                return (
                  <td key={`${key}:${locale}`} class="missing">
                    -
                  </td>
                );
              }

              const translation = translations.messages[key];

              return (
                <td key={`${key}:${locale}`} title={translation.description}>
                  {translation.message}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
      <tfoot />
    </table>
  );
};

const intlLocaleDisplayNames = new Intl.DisplayNames([navigator.language], { type: "language" });

export default TranslationsViewer;

type ExtensionId = ExtensionData["id"];
